/**
 * Custom LLM Adapter
 *
 * 사용자 정의 LLM API 연결용 (OpenAI 호환 API 등)
 *
 * @example
 * ```typescript
 * const custom = new CustomAdapter({
 *   apiKey: 'your-key',
 *   baseUrl: 'https://your-api.com/v1/chat/completions',
 *   defaultModel: 'your-model',
 * });
 *
 * const response = await custom.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */

import { LLMError } from '../types';
import type { LLMAdapter, LLMProviderConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

interface CustomAdapterConfig extends LLMProviderConfig {
    /** 요청 변환 함수 */
    transformRequest?: (request: LLMRequest) => unknown;
    /** 응답 파싱 함수 */
    parseResponse?: (data: unknown) => LLMResponse;
    /** 스트리밍 청크 파싱 함수 */
    parseStreamChunk?: (data: string) => LLMStreamChunk | null;
    /** 추가 헤더 */
    headers?: Record<string, string>;
}

export class CustomAdapter implements LLMAdapter {
    readonly name = 'custom';
    private config: CustomAdapterConfig;

    constructor(config: CustomAdapterConfig) {
        if (!config.baseUrl) {
            throw new Error('CustomAdapter requires baseUrl');
        }
        this.config = {
            timeout: 60000,
            ...config,
        };
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const body = this.config.transformRequest
            ? this.config.transformRequest(request)
            : this.defaultTransformRequest(request);

        const response = await fetch(this.config.baseUrl!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
                ...this.config.headers,
            },
            body: JSON.stringify(body),
            signal: request.signal,
        });

        if (!response.ok) {
            throw await this.handleError(response);
        }

        const data = await response.json();

        if (this.config.parseResponse) {
            return this.config.parseResponse(data);
        }

        return this.defaultParseResponse(data);
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const body = this.config.transformRequest
            ? this.config.transformRequest({ ...request, stream: true })
            : this.defaultTransformRequest({ ...request, stream: true });

        const response = await fetch(this.config.baseUrl!, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
                Accept: 'text/event-stream',
                ...this.config.headers,
            },
            body: JSON.stringify(body),
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

                        if (this.config.parseStreamChunk) {
                            const chunk = this.config.parseStreamChunk(data);
                            if (chunk) yield chunk;
                        } else {
                            const chunk = this.defaultParseStreamChunk(data);
                            if (chunk) yield chunk;
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    // ============ Default Parsers (OpenAI 호환) ============

    private defaultTransformRequest(request: LLMRequest): unknown {
        return {
            model: request.model || this.config.defaultModel,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            top_p: request.topP,
            stream: request.stream ?? false,
        };
    }

    private defaultParseResponse(data: Record<string, unknown>): LLMResponse {
        const choices = data.choices as Array<Record<string, unknown>> | undefined;
        const usage = data.usage as Record<string, number> | undefined;

        return {
            content: (choices?.[0]?.message as Record<string, string>)?.content || '',
            model: (data.model as string) || 'unknown',
            usage: usage
                ? {
                    promptTokens: usage.prompt_tokens || 0,
                    completionTokens: usage.completion_tokens || 0,
                    totalTokens: usage.total_tokens || 0,
                }
                : undefined,
            finishReason: choices?.[0]?.finish_reason as LLMResponse['finishReason'],
        };
    }

    private defaultParseStreamChunk(data: string): LLMStreamChunk | null {
        try {
            const parsed = JSON.parse(data);
            const choices = parsed.choices as Array<Record<string, unknown>> | undefined;
            const delta = choices?.[0]?.delta as Record<string, string> | undefined;

            return {
                content: delta?.content || '',
                done: choices?.[0]?.finish_reason === 'stop',
            };
        } catch {
            return null;
        }
    }

    private async handleError(response: Response): Promise<LLMError> {
        const data = await response.json().catch(() => ({}));
        const errorObj = data as { error?: { message?: string }; message?: string };
        const message = errorObj?.error?.message || errorObj?.message || `API error: ${response.status}`;

        switch (response.status) {
            case 401:
            case 403:
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
