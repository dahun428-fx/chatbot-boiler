/**
 * Google Gemini Adapter
 *
 * Gemini API 직접 연결
 *
 * @example
 * ```typescript
 * const gemini = new GeminiAdapter({
 *   apiKey: 'AIza...',
 *   defaultModel: 'gemini-1.5-pro',
 * });
 *
 * const response = await gemini.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */

import { LLMError } from '../types';
import type { LLMAdapter, LLMMessage, LLMProviderConfig, LLMRequest, LLMResponse, LLMStreamChunk } from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiAdapter implements LLMAdapter {
    readonly name = 'gemini';
    private config: LLMProviderConfig;

    constructor(config: LLMProviderConfig) {
        this.config = {
            defaultModel: 'gemini-1.5-pro',
            timeout: 60000,
            ...config,
        };
    }

    async chat(request: LLMRequest): Promise<LLMResponse> {
        const model = request.model || this.config.defaultModel;
        // baseUrl이 있으면 프록시 사용 (API Key는 서버에서 주입)
        const url = this.config.baseUrl
            ? `${this.config.baseUrl}/${model}:generateContent`
            : `${GEMINI_API_BASE}/${model}:generateContent?key=${this.config.apiKey}`;

        const { systemInstruction, contents } = this.convertMessages(request.messages);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                contents,
                generationConfig: {
                    temperature: request.temperature,
                    maxOutputTokens: request.maxTokens,
                    topP: request.topP,
                },
            }),
            signal: request.signal,
        });

        if (!response.ok) {
            throw await this.handleError(response);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];

        return {
            content: candidate?.content?.parts?.[0]?.text || '',
            model: model!,
            usage: data.usageMetadata
                ? {
                    promptTokens: data.usageMetadata.promptTokenCount || 0,
                    completionTokens: data.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: data.usageMetadata.totalTokenCount || 0,
                }
                : undefined,
            finishReason: this.mapFinishReason(candidate?.finishReason),
        };
    }

    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        const model = request.model || this.config.defaultModel;
        // baseUrl이 있으면 프록시 사용 (API Key는 서버에서 주입)
        const url = this.config.baseUrl
            ? `${this.config.baseUrl}/${model}:streamGenerateContent?alt=sse`
            : `${GEMINI_API_BASE}/${model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`;

        const { systemInstruction, contents } = this.convertMessages(request.messages);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                contents,
                generationConfig: {
                    temperature: request.temperature,
                    maxOutputTokens: request.maxTokens,
                    topP: request.topP,
                },
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
                            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                            const finishReason = parsed.candidates?.[0]?.finishReason;

                            yield {
                                content: text,
                                done: finishReason === 'STOP',
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

    private convertMessages(messages: LLMMessage[]): {
        systemInstruction?: string;
        contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
    } {
        let systemInstruction: string | undefined;
        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstruction = msg.content;
            } else {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                });
            }
        }

        return { systemInstruction, contents };
    }

    private mapFinishReason(reason?: string): 'stop' | 'length' | 'content_filter' | 'error' | undefined {
        switch (reason) {
            case 'STOP':
                return 'stop';
            case 'MAX_TOKENS':
                return 'length';
            case 'SAFETY':
                return 'content_filter';
            case 'ERROR':
                return 'error';
            default:
                return undefined;
        }
    }

    private async handleError(response: Response): Promise<LLMError> {
        const data = await response.json().catch(() => ({}));
        const message = data?.error?.message || `Gemini API error: ${response.status}`;

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
