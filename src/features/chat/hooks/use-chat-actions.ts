/**
 * 채팅 액션 훅 (쓰기 전용)
 *
 * 메시지 전송, 중단, 초기화, 재시도 등 상태 변경 작업을 담당합니다.
 * 읽기 작업은 useChatState를 사용하세요.
 */
import { useCallback, useRef } from 'react';
import { useRecoilCallback, useResetRecoilState, useSetRecoilState } from 'recoil';

import { errorState, isLoadingState, messagesState, streamingContentState } from '../atom';
import { chatService, isStreamingMode } from '../services';
import type { ChatError } from '../types/error';
import { createChatError } from '../types/error';
import type { Message } from '../types/message';
import { createMessage } from '../types/message';
import type { ChatActions } from '../types';

/**
 * 채팅 액션 훅
 *
 * @returns ChatActions - 상태 변경 액션들
 *
 * @example
 * ```tsx
 * const { send, abort, clear, retry } = useChatActions();
 *
 * // 메시지 전송
 * await send('안녕하세요');
 *
 * // 요청 중단
 * abort();
 *
 * // 대화 초기화
 * clear();
 *
 * // 마지막 메시지 재시도
 * retry();
 * ```
 */
export const useChatActions = (): ChatActions => {
    const setMessages = useSetRecoilState(messagesState);
    const setIsLoading = useSetRecoilState(isLoadingState);
    const setStreamingContent = useSetRecoilState(streamingContentState);
    const setError = useSetRecoilState(errorState);

    const resetMessages = useResetRecoilState(messagesState);
    const resetLoading = useResetRecoilState(isLoadingState);
    const resetStreaming = useResetRecoilState(streamingContentState);
    const resetError = useResetRecoilState(errorState);

    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * 메시지 전송
     */
    const send = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            // 사용자 메시지 생성 및 추가
            const userMessage = createMessage('user', content);

            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setStreamingContent('');
            setError(null);

            // AbortController 생성
            abortControllerRef.current = new AbortController();

            try {
                // 현재 메시지 목록 가져오기 (방금 추가한 사용자 메시지 포함)
                const currentMessages = await new Promise<Message[]>((resolve) => {
                    setMessages((prev) => {
                        resolve(prev);
                        return prev;
                    });
                });

                // ChatService를 통해 메시지 전송
                const responseContent = await chatService.sendMessage(
                    currentMessages,
                    (chunk) => {
                        setStreamingContent(chunk.content);
                    },
                    {
                        streaming: isStreamingMode(),
                        signal: abortControllerRef.current?.signal,
                    }
                );

                // 응답 메시지 추가
                const assistantMessage = createMessage('assistant', responseContent);
                setMessages((prev) => [...prev, assistantMessage]);
            } catch (error) {
                // AbortError는 무시 (사용자가 의도적으로 취소)
                if ((error as Error).name === 'AbortError') {
                    return;
                }

                // 에러 상태 설정
                const chatError = createChatError(error);
                setError(chatError);

                console.error('[Chat] Send error:', error);
            } finally {
                setIsLoading(false);
                setStreamingContent('');
                abortControllerRef.current = null;
            }
        },
        [setMessages, setIsLoading, setStreamingContent, setError]
    );

    /**
     * 요청 중단
     */
    const abort = useCallback(() => {
        abortControllerRef.current?.abort();
        setIsLoading(false);
        setStreamingContent('');
    }, [setIsLoading, setStreamingContent]);

    /**
     * 대화 초기화
     */
    const clear = useCallback(() => {
        abort(); // 진행 중인 요청 중단
        resetMessages();
        resetLoading();
        resetStreaming();
        resetError();
    }, [abort, resetMessages, resetLoading, resetStreaming, resetError]);

    /**
     * 마지막 메시지 재시도
     *
     * my-health-ai-coach-web 패턴:
     * - 마지막 user 메시지를 찾아서 재전송
     * - user 메시지는 유지, 에러만 초기화
     * - send 대신 직접 API 호출 (user 메시지 중복 방지)
     */
    const retry = useRecoilCallback(
        ({ snapshot, set }) =>
            async () => {
                const messages = await snapshot.getPromise(messagesState);
                const currentError = await snapshot.getPromise(errorState);

                // 에러 초기화
                if (currentError) {
                    set(errorState, null);
                }

                // 마지막 user 메시지 찾기
                const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');

                if (!lastUserMessage) return;

                // user 메시지는 유지하고, 바로 API 호출
                set(isLoadingState, true);
                set(streamingContentState, '');

                abortControllerRef.current = new AbortController();

                try {
                    const responseContent = await chatService.sendMessage(
                        messages, // 기존 메시지 그대로 사용
                        (chunk) => {
                            set(streamingContentState, chunk.content);
                        },
                        {
                            streaming: isStreamingMode(),
                            signal: abortControllerRef.current?.signal,
                        }
                    );

                    // 응답 메시지 추가
                    const assistantMessage = createMessage('assistant', responseContent);
                    set(messagesState, [...messages, assistantMessage]);
                } catch (err) {
                    if ((err as Error).name === 'AbortError') return;

                    const chatError = createChatError(err);
                    set(errorState, chatError);
                    console.error('[Chat] Retry error:', err);
                } finally {
                    set(isLoadingState, false);
                    set(streamingContentState, '');
                    abortControllerRef.current = null;
                }
            },
        []
    );

    return {
        send,
        abort,
        clear,
        retry,
    };
};
