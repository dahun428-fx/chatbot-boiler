/**
 * LLM 채팅 훅
 *
 * 다양한 LLM Provider와 연결하여 채팅 기능을 제공합니다.
 */
import { useCallback, useRef } from 'react';
import { useRecoilState } from 'recoil';

import { createLLM } from '@/shared/api/llm/direct';
import type { LLMAdapter, LLMMessage, LLMProviderConfig, LLMProviderType } from '@/shared/api/llm/direct/types';

import { isLoadingState, messagesState, streamingMessageState } from '../store/chat';

interface UseLLMChatOptions {
    provider: LLMProviderType;
    config: LLMProviderConfig;
    systemPrompt?: string;
    onError?: (error: Error) => void;
}

export function useLLMChat(options: UseLLMChatOptions) {
    const { provider, config, systemPrompt, onError } = options;

    const [messages, setMessages] = useRecoilState(messagesState);
    const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
    const [streamingMessage, setStreamingMessage] = useRecoilState(streamingMessageState);

    const abortControllerRef = useRef<AbortController | null>(null);
    const llmRef = useRef<LLMAdapter | null>(null);

    // LLM 인스턴스 가져오기 (lazy init)
    const getLLM = useCallback(() => {
        if (!llmRef.current) {
            llmRef.current = createLLM({ type: provider, ...config });
        }
        return llmRef.current;
    }, [provider, config]);

    /**
     * 메시지 전송 (일반 모드)
     */
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMessage: LLMMessage = { role: 'user', content };
            const newMessages = [...messages, userMessage];

            setMessages(newMessages);
            setIsLoading(true);

            try {
                const llm = getLLM();
                const requestMessages: LLMMessage[] = systemPrompt
                    ? [{ role: 'system', content: systemPrompt }, ...newMessages]
                    : newMessages;

                const response = await llm.chat({
                    messages: requestMessages,
                });

                const assistantMessage: LLMMessage = {
                    role: 'assistant',
                    content: response.content,
                };

                setMessages([...newMessages, assistantMessage]);
            } catch (error) {
                onError?.(error as Error);
                console.error('Chat error:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [messages, isLoading, systemPrompt, getLLM, setMessages, setIsLoading, onError]
    );

    /**
     * 메시지 전송 (스트리밍 모드)
     */
    const sendMessageStream = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMessage: LLMMessage = { role: 'user', content };
            const newMessages = [...messages, userMessage];

            setMessages(newMessages);
            setIsLoading(true);
            setStreamingMessage('');

            abortControllerRef.current = new AbortController();

            try {
                const llm = getLLM();
                const requestMessages: LLMMessage[] = systemPrompt
                    ? [{ role: 'system', content: systemPrompt }, ...newMessages]
                    : newMessages;

                let fullContent = '';

                for await (const chunk of llm.stream({
                    messages: requestMessages,
                    signal: abortControllerRef.current.signal,
                })) {
                    fullContent += chunk.content;
                    setStreamingMessage(fullContent);

                    if (chunk.done) break;
                }

                const assistantMessage: LLMMessage = {
                    role: 'assistant',
                    content: fullContent,
                };

                setMessages([...newMessages, assistantMessage]);
                setStreamingMessage('');
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    onError?.(error as Error);
                    console.error('Stream error:', error);
                }
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [messages, isLoading, systemPrompt, getLLM, setMessages, setIsLoading, setStreamingMessage, onError]
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
     * 채팅 초기화
     */
    const clearMessages = useCallback(() => {
        setMessages([]);
        setStreamingMessage('');
    }, [setMessages, setStreamingMessage]);

    return {
        messages,
        isLoading,
        streamingMessage,
        sendMessage,
        sendMessageStream,
        abort,
        clearMessages,
    };
}
