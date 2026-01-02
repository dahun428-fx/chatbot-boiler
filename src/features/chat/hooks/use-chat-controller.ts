/**
 * 채팅 컨트롤러 훅
 *
 * LLM API 호출 및 메시지 스트리밍을 담당합니다.
 */
import { useCallback, useRef } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';

import { createLLM } from '@/shared/api/llm/direct';
import type { LLMAdapter, LLMMessage } from '@/shared/api/llm/direct/types';

import { isLoadingState, messagesState, streamingMessageState } from '../atom';
import { getLLMConfig, validateApiKey } from '../lib';
import type { ChatController } from '../types';

/**
 * 채팅 컨트롤러 훅
 * @returns ChatController - 메시지 전송, 중단, 초기화 함수
 */
export const useChatController = (): ChatController => {
    const [messages, setMessages] = useRecoilState(messagesState);
    const [, setIsLoading] = useRecoilState(isLoadingState);
    const [, setStreamingMessage] = useRecoilState(streamingMessageState);

    const resetMessages = useResetRecoilState(messagesState);
    const resetLoading = useResetRecoilState(isLoadingState);
    const resetStreaming = useResetRecoilState(streamingMessageState);

    const abortControllerRef = useRef<AbortController | null>(null);
    const llmRef = useRef<LLMAdapter | null>(null);

    /**
     * LLM 인스턴스 생성
     */
    const getLLM = useCallback((): LLMAdapter => {
        const config = getLLMConfig();
        llmRef.current = createLLM({ type: config.provider, apiKey: config.apiKey });
        return llmRef.current;
    }, []);

    /**
     * 메시지 전송 (스트리밍 모드)
     */
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            const config = getLLMConfig();

            if (!validateApiKey(config.apiKey)) {
                console.error('[LLM] API 키가 설정되지 않았습니다. VITE_LLM_API_KEY 환경변수를 확인해주세요.');
                return;
            }

            const userMessage: LLMMessage = { role: 'user', content };
            const newMessages = [...messages, userMessage];

            setMessages(newMessages);
            setIsLoading(true);
            setStreamingMessage('');

            try {
                const llm = getLLM();
                const requestMessages: LLMMessage[] = config.systemPrompt
                    ? [{ role: 'system', content: config.systemPrompt }, ...newMessages]
                    : newMessages;

                // 스트리밍 시작
                abortControllerRef.current = new AbortController();
                let fullContent = '';

                for await (const chunk of llm.stream({
                    messages: requestMessages,
                    signal: abortControllerRef.current.signal,
                })) {
                    fullContent += chunk.content;
                    setStreamingMessage(fullContent);
                    if (chunk.done) break;
                }

                // 응답 완료
                setMessages([...newMessages, { role: 'assistant', content: fullContent }]);
                setStreamingMessage('');
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('[LLM] Chat error:', error);
                }
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [messages, getLLM, setMessages, setIsLoading, setStreamingMessage]
    );

    /**
     * 스트리밍 중단
     */
    const abort = useCallback(() => {
        abortControllerRef.current?.abort();
        setIsLoading(false);
        setStreamingMessage('');
    }, [setIsLoading, setStreamingMessage]);

    /**
     * 대화 초기화
     */
    const clearChat = useCallback(() => {
        resetMessages();
        resetLoading();
        resetStreaming();
    }, [resetMessages, resetLoading, resetStreaming]);

    return {
        sendMessage,
        abort,
        clearChat,
    };
};
