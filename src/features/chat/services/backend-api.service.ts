/**
 * Backend API 서비스
 *
 * 백엔드 서버를 통해 채팅 API를 호출하는 서비스
 */

import type { Message } from '../types/message';

import type { ChatService, ChatServiceOptions, ServiceConfig, StreamChunk } from './types';

export class BackendAPIService implements ChatService {
    private config: ServiceConfig;

    constructor(config: ServiceConfig) {
        this.config = config;
    }

    /**
     * 메시지 전송
     */
    async sendMessage(
        messages: Message[],
        onChunk?: (chunk: StreamChunk) => void,
        options?: ChatServiceOptions
    ): Promise<string> {
        const streaming = options?.streaming ?? this.config.streaming;
        const signal = options?.signal;
        const timeout = options?.timeout ?? this.config.timeout;

        if (!this.config.backendUrl) {
            throw new Error('Backend API URL이 설정되지 않았습니다.');
        }

        // 요청 본문 준비
        const body = this.prepareRequestBody(messages);

        if (streaming && onChunk) {
            return this.streamRequest(body, onChunk, signal, timeout);
        } else {
            return this.fetchRequest(body, onChunk, signal, timeout);
        }
    }

    /**
     * 요청 본문 준비
     */
    private prepareRequestBody(messages: Message[]): Record<string, unknown> {
        const requestMessages = messages.map((m) => ({
            role: m.role,
            content: m.content,
        }));

        return {
            messages: requestMessages,
            ...(this.config.systemPrompt && { systemPrompt: this.config.systemPrompt }),
        };
    }

    /**
     * 스트리밍 요청 (SSE)
     */
    private async streamRequest(
        body: Record<string, unknown>,
        onChunk: (chunk: StreamChunk) => void,
        signal?: AbortSignal,
        timeout?: number
    ): Promise<string> {
        const controller = new AbortController();
        const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

        // 외부 signal과 내부 타임아웃 signal 연결
        if (signal) {
            signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        try {
            const response = await fetch(this.config.backendUrl!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw response;
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            // ReadableStream으로 스트리밍 처리
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onChunk({ content: fullContent, done: true });
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                fullContent += this.parseStreamChunk(chunk);
                onChunk({ content: fullContent, done: false });
            }

            return fullContent;
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }

    /**
     * 스트림 청크 파싱
     * SSE 형식 또는 JSON 라인 형식 지원
     */
    private parseStreamChunk(chunk: string): string {
        // SSE 형식: "data: {...}\n"
        if (chunk.startsWith('data:')) {
            try {
                const jsonStr = chunk.replace(/^data:\s*/, '').trim();
                if (jsonStr === '[DONE]') return '';
                const parsed = JSON.parse(jsonStr);
                return parsed.content || parsed.message || parsed.text || '';
            } catch {
                return chunk.replace(/^data:\s*/, '').trim();
            }
        }

        // JSON 라인 형식
        try {
            const parsed = JSON.parse(chunk);
            return parsed.content || parsed.message || parsed.text || '';
        } catch {
            // 일반 텍스트
            return chunk;
        }
    }

    /**
     * 일반 요청 (논스트리밍)
     */
    private async fetchRequest(
        body: Record<string, unknown>,
        onChunk?: (chunk: StreamChunk) => void,
        signal?: AbortSignal,
        timeout?: number
    ): Promise<string> {
        const controller = new AbortController();
        const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;

        if (signal) {
            signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        try {
            const response = await fetch(this.config.backendUrl!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw response;
            }

            const data = await response.json();
            const content = data.content || data.message || data.text || '';

            onChunk?.({ content, done: true });

            return content;
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }
}
