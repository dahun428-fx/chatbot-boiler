/**
 * LLM API 서비스
 *
 * LLM(OpenAI, Anthropic, Gemini)을 직접 호출하는 서비스
 */

import { createLLM } from '@/shared/api/llm/direct';
import type { LLMAdapter } from '@/shared/api/llm/direct/types';

import type { Message } from '../types/message';

import type { ChatService, ChatServiceOptions, ServiceConfig, StreamChunk } from './types';

export class LLMAPIService implements ChatService {
    private config: ServiceConfig;
    private llm: LLMAdapter | null = null;

    constructor(config: ServiceConfig) {
        this.config = config;
    }

    /**
     * LLM 인스턴스 생성 (lazy initialization)
     */
    private getLLM(): LLMAdapter {
        if (!this.llm) {
            if (!this.config.llmApiKey) {
                throw new Error('LLM API 키가 설정되지 않았습니다.');
            }

            this.llm = createLLM({
                type: (this.config.llmProvider || 'openai') as 'openai' | 'anthropic' | 'gemini',
                apiKey: this.config.llmApiKey,
                defaultModel: this.config.llmModel,
            });
        }
        return this.llm;
    }

    /**
     * 메시지를 LLM 요청 형식으로 변환
     */
    private prepareMessages(messages: Message[]): Array<{ role: string; content: string }> {
        const requestMessages = messages.map((m) => ({
            role: m.role,
            content: m.content,
        }));

        // 시스템 프롬프트 추가
        if (this.config.systemPrompt) {
            return [{ role: 'system', content: this.config.systemPrompt }, ...requestMessages];
        }

        return requestMessages;
    }

    /**
     * 메시지 전송
     */
    async sendMessage(
        messages: Message[],
        onChunk?: (chunk: StreamChunk) => void,
        options?: ChatServiceOptions
    ): Promise<string> {
        const llm = this.getLLM();
        const requestMessages = this.prepareMessages(messages);
        const streaming = options?.streaming ?? this.config.streaming;
        const signal = options?.signal;

        if (streaming && onChunk) {
            // 스트리밍 모드
            return this.streamMessage(llm, requestMessages, onChunk, signal);
        } else {
            // 논스트리밍 모드
            return this.chatMessage(llm, requestMessages, onChunk, signal);
        }
    }

    /**
     * 스트리밍 모드로 메시지 전송
     */
    private async streamMessage(
        llm: LLMAdapter,
        messages: Array<{ role: string; content: string }>,
        onChunk: (chunk: StreamChunk) => void,
        signal?: AbortSignal
    ): Promise<string> {
        let fullContent = '';

        for await (const chunk of llm.stream({
            messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
            signal,
        })) {
            fullContent += chunk.content;
            onChunk({ content: fullContent, done: chunk.done });

            if (chunk.done) break;
        }

        return fullContent;
    }

    /**
     * 논스트리밍 모드로 메시지 전송
     */
    private async chatMessage(
        llm: LLMAdapter,
        messages: Array<{ role: string; content: string }>,
        onChunk?: (chunk: StreamChunk) => void,
        signal?: AbortSignal
    ): Promise<string> {
        const response = await llm.chat({
            messages: messages as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
            signal,
        });

        const content = response.content;
        onChunk?.({ content, done: true });

        return content;
    }
}
