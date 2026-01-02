/**
 * LLM Server Client
 *
 * 자체 백엔드 서버를 통해 LLM과 통신합니다.
 * SSE 모드(스트리밍)와 API 모드(일반 요청)를 모두 지원합니다.
 *
 * @example
 * ```typescript
 * const client = new LLMServerClient({
 *   baseUrl: '/api/llm',
 *   chatEndpoint: '/chat',
 *   streamEndpoint: '/chat/stream',
 * });
 *
 * // API 모드 (일반 요청)
 * const response = await client.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 *
 * // SSE 모드 (스트리밍)
 * for await (const chunk of client.stream({ messages })) {
 *   console.log(chunk.content);
 *   if (chunk.done) break;
 * }
 * ```
 */

import type { ChatOptions, ChatRequest, ChatResponse, LLMServerConfig, StreamChunk } from './types';

export class LLMServerClient {
    private config: Required<
        Pick<LLMServerConfig, 'baseUrl' | 'chatEndpoint' | 'streamEndpoint' | 'timeout'>
    > &
        LLMServerConfig;

    constructor(config: LLMServerConfig) {
        this.config = {
            chatEndpoint: '/chat',
            streamEndpoint: '/chat/stream',
            timeout: 60000,
            ...config,
        };
    }

    /**
     * API 모드 - 일반 채팅 요청
     */
    async chat(request: ChatRequest, options?: ChatOptions): Promise<ChatResponse> {
        const url = `${this.config.baseUrl}${this.config.chatEndpoint}`;
        const headers = await this.buildHeaders(options?.headers);

        const controller = new AbortController();
        const timeoutMs = options?.timeout ?? this.config.timeout;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        if (options?.signal) {
            options.signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(request),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || errorData?.error || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // 커스텀 파서가 있으면 사용
            if (this.config.parseResponse) {
                return this.config.parseResponse(data);
            }

            return data as ChatResponse;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * SSE 모드 - 스트리밍 채팅 요청
     */
    async *stream(request: ChatRequest, options?: ChatOptions): AsyncGenerator<StreamChunk, void, unknown> {
        const url = `${this.config.baseUrl}${this.config.streamEndpoint}`;
        const headers = await this.buildHeaders(options?.headers);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...headers,
                Accept: 'text/event-stream',
            },
            body: JSON.stringify(request),
            signal: options?.signal,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || errorData?.error || `HTTP ${response.status}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
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

                // SSE 이벤트 파싱
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        // [DONE] 시그널
                        if (data === '[DONE]') {
                            yield { content: '', done: true };
                            return;
                        }

                        // 커스텀 파서가 있으면 사용
                        if (this.config.parseSSEData) {
                            const chunk = this.config.parseSSEData(data);
                            if (chunk) yield chunk;
                        } else {
                            // 기본 파싱: JSON 또는 텍스트
                            try {
                                const parsed = JSON.parse(data);
                                yield {
                                    content: parsed.content || parsed.text || parsed.delta || '',
                                    done: parsed.done || parsed.finished || false,
                                    ...parsed,
                                };
                            } catch {
                                yield { content: data, done: false };
                            }
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * 설정 업데이트
     */
    setConfig(config: Partial<LLMServerConfig>): void {
        Object.assign(this.config, config);
    }

    // ============ Private Methods ============

    private async buildHeaders(extraHeaders?: Record<string, string>): Promise<Record<string, string>> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...this.config.headers,
            ...extraHeaders,
        };

        // 인증 토큰
        if (this.config.getAuthToken) {
            const token = await this.config.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }
}

export function createLLMServerClient(config: LLMServerConfig): LLMServerClient {
    return new LLMServerClient(config);
}
