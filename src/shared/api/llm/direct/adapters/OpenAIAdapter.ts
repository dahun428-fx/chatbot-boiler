/**
 * OpenAI Adapter
 *
 * OpenAI API (GPT-4, GPT-3.5 등) 직접 연결
 *
 * @example
 * ```typescript
 * const openai = new OpenAIAdapter({
 *   apiKey: 'sk-...',
 *   defaultModel: 'gpt-4o',
 * });
 *
 * // 일반 요청
 * const response = await openai.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 *
 * // 스트리밍
 * for await (const chunk of openai.stream({ messages })) {
 *   console.log(chunk.content);
 * }
 * ```
 */

import { LLMError } from '../types';
import type { LLMAdapter, LLMProviderConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIAdapter implements LLMAdapter {
    readonly name = 'openai';
    private config: LLMProviderConfig;

    constructor(config: LLMProviderConfig) {
        this.config = {
            defaultModel: 'gpt-4o',
            timeout: 60000,
            ...config,
        };
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const url = this.config.baseUrl || OPENAI_API_URL;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: request.model || this.config.defaultModel,
                messages: request.messages,
                temperature: request.temperature,
                max_tokens: request.maxTokens,
                top_p: request.topP,
                stream: false,
            }),
            signal: request.signal,
        });

        if (!response.ok) {
            throw await this.handleError(response);
        }

        const data = await response.json();

        return {
            content: data.choices?.[0]?.message?.content || '',
            model: data.model,
            usage: data.usage
                ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                }
                : undefined,
            finishReason: data.choices?.[0]?.finish_reason,
        };
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const url = this.config.baseUrl || OPENAI_API_URL;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: request.model || this.config.defaultModel,
                messages: request.messages,
                temperature: request.temperature,
                max_tokens: request.maxTokens,
                top_p: request.topP,
                stream: true,
            }),
            signal: request.signal,
        });

        if (!response.ok) {
            throw await this.handleError(response);
        }

        if (!response.body) {
            throw new LLMError('Response body is null', 'unknown');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    yield { content: '', done: true };
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            yield { content: '', done: true };
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            const finishReason = parsed.choices?.[0]?.finish_reason;

                            yield {
                                content,
                                done: finishReason === 'stop',
                            };
                        } catch {
                            // JSON 파싱 실패 시 무시
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    private async handleError(response: Response): Promise<LLMError> {
        const data = await response.json().catch(() => ({}));
        const message = data?.error?.message || `OpenAI API error: ${response.status}`;

        switch (response.status) {
            case 401:
                return new LLMError(message, 'auth_error', response.status);
            case 429:
                return new LLMError(message, 'rate_limit', response.status);
            case 400:
                if (message.includes('context_length')) {
                    return new LLMError(message, 'context_length_exceeded', response.status);
                }
                return new LLMError(message, 'invalid_request', response.status);
            case 404:
                return new LLMError(message, 'model_not_found', response.status);
            default:
                return new LLMError(message, 'unknown', response.status);
        }
    }
}
