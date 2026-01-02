/**
 * Anthropic (Claude) Adapter
 *
 * Claude API 직접 연결
 *
 * @example
 * ```typescript
 * const claude = new AnthropicAdapter({
 *   apiKey: 'sk-ant-...',
 *   defaultModel: 'claude-3-5-sonnet-20241022',
 * });
 *
 * const response = await claude.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */

import { LLMError } from '../types';
import type { LLMAdapter, LLMMessage, LLMProviderConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export class AnthropicAdapter implements LLMAdapter {
    readonly name = 'anthropic';
    private config: LLMProviderConfig;

    constructor(config: LLMProviderConfig) {
        this.config = {
            defaultModel: 'claude-3-5-sonnet-20241022',
            timeout: 60000,
            ...config,
        };
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const url = this.config.baseUrl || ANTHROPIC_API_URL;
        const { systemMessage, messages } = this.convertMessages(request.messages);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': ANTHROPIC_VERSION,
            },
            body: JSON.stringify({
                model: request.model || this.config.defaultModel,
                max_tokens: request.maxTokens || 4096,
                system: systemMessage,
                messages,
                temperature: request.temperature,
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
            content: data.content?.[0]?.text || '',
            model: data.model,
            usage: data.usage
                ? {
                    promptTokens: data.usage.input_tokens,
                    completionTokens: data.usage.output_tokens,
                    totalTokens: data.usage.input_tokens + data.usage.output_tokens,
                }
                : undefined,
            finishReason: data.stop_reason === 'end_turn' ? 'stop' : data.stop_reason,
        };
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const url = this.config.baseUrl || ANTHROPIC_API_URL;
        const { systemMessage, messages } = this.convertMessages(request.messages);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': ANTHROPIC_VERSION,
            },
            body: JSON.stringify({
                model: request.model || this.config.defaultModel,
                max_tokens: request.maxTokens || 4096,
                system: systemMessage,
                messages,
                temperature: request.temperature,
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

                        try {
                            const parsed = JSON.parse(data);

                            if (parsed.type === 'content_block_delta') {
                                yield {
                                    content: parsed.delta?.text || '',
                                    done: false,
                                };
                            } else if (parsed.type === 'message_stop') {
                                yield { content: '', done: true };
                                return;
                            }
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

    private convertMessages(messages: LLMMessage[]): {
        systemMessage?: string;
        messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    } {
        let systemMessage: string | undefined;
        const convertedMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemMessage = msg.content;
            } else {
                convertedMessages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                });
            }
        }

        return { systemMessage, messages: convertedMessages };
    }

    private async handleError(response: Response): Promise<LLMError> {
        const data = await response.json().catch(() => ({}));
        const message = data?.error?.message || `Anthropic API error: ${response.status}`;

        switch (response.status) {
            case 401:
                return new LLMError(message, 'auth_error', response.status);
            case 429:
                return new LLMError(message, 'rate_limit', response.status);
            case 400:
                return new LLMError(message, 'invalid_request', response.status);
            case 404:
                return new LLMError(message, 'model_not_found', response.status);
            default:
                return new LLMError(message, 'unknown', response.status);
        }
    }
}
