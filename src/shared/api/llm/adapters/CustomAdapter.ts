/**
 * Custom API Adapter
 * 자체 백엔드 서버와 통신하기 위한 어댑터
 */

import { createSSEStream, parseSSEEvent } from '../SSEClient';
import type {
    LLMAdapter,
    LLMProviderConfig,
    LLMRequest,
    LLMResponse,
    LLMStreamChunk,
} from '../types';
import { LLMError } from '../types';

interface CustomProviderConfig extends LLMProviderConfig {
    /** 채팅 엔드포인트 경로 */
    chatEndpoint?: string;
    /** 스트리밍 엔드포인트 경로 */
    streamEndpoint?: string;
    /** 추가 헤더 */
    additionalHeaders?: Record<string, string>;
}

/**
 * Custom API Adapter
 *
 * @example
 * ```typescript
 * const adapter = new CustomAdapter({
 *   apiKey: 'your-token',
 *   baseUrl: 'https://your-api.com',
 *   chatEndpoint: '/api/chat',
 *   streamEndpoint: '/api/chat/stream',
 * });
 * ```
 */
export class CustomAdapter implements LLMAdapter {
    readonly name = 'custom';
    private config: CustomProviderConfig;

    constructor(config: CustomProviderConfig) {
        this.config = {
            chatEndpoint: '/chat',
            streamEndpoint: '/chat/stream',
            ...config,
        };
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const url = `${this.config.baseUrl}${this.config.chatEndpoint}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
                ...this.config.additionalHeaders,
            },
            body: JSON.stringify({
                messages: request.messages,
                model: request.model || this.config.defaultModel,
                temperature: request.temperature,
                max_tokens: request.maxTokens,
            }),
            signal: request.signal,
        });

        if (!response.ok) {
            throw this.handleError(response.status, await response.text());
        }

        const data = await response.json();

        // 응답 형식은 서버에 따라 조정 필요
        return {
            content: data.content || data.message || data.response || '',
            model: data.model || 'custom',
            usage: data.usage,
            finishReason: data.finish_reason || 'stop',
        };
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const url = `${this.config.baseUrl}${this.config.streamEndpoint}`;

        const sseStream = createSSEStream({
            url,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                ...this.config.additionalHeaders,
            },
            body: {
                messages: request.messages,
                model: request.model || this.config.defaultModel,
                temperature: request.temperature,
                max_tokens: request.maxTokens,
                stream: true,
            },
            signal: request.signal,
        });

        for await (const data of sseStream) {
            const parsed = parseSSEEvent(data);

            // 응답 형식은 서버에 따라 조정 필요
            if (typeof parsed === 'string') {
                yield { content: parsed, done: false };
            } else if (parsed && typeof parsed === 'object') {
                const obj = parsed as Record<string, unknown>;
                const content = (obj.content || obj.text || obj.delta || '') as string;
                const done = (obj.done || obj.finished || false) as boolean;
                yield { content, done };
            }
        }

        yield { content: '', done: true };
    }

    private handleError(status: number, body: string): LLMError {
        let message = `Custom API error: ${status}`;

        try {
            const errorData = JSON.parse(body);
            message = errorData?.error?.message || errorData?.message || message;
        } catch {
            // ignore parse error
        }

        switch (status) {
            case 401:
            case 403:
                return new LLMError(message, 'auth_error', status);
            case 429:
                return new LLMError(message, 'rate_limit', status);
            case 400:
                return new LLMError(message, 'invalid_request', status);
            case 408:
                return new LLMError(message, 'timeout', status);
            default:
                return new LLMError(message, 'unknown', status);
        }
    }
}
