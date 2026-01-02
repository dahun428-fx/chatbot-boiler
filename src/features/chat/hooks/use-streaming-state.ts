import { useCallback, useMemo, useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { MessageKeyFactory } from '@/entities/message-set/lib/messageKeyFactory';
import { chatState, isShowStopButtonState, isStreamingState } from '@/features/chat';
import { MessageType } from '@/shared/constants/enum/message.enum';
import { getBotDomId, measureBubbleHeightById } from '@/shared/lib/common';
import type { Message } from '@/shared/types/message.type';

import { useChatOps } from './use-chat-ops';
import { useChatRoomActions } from './use-init-chat-room-id';
import { useProcessMessagesWithDelay } from './use-process-messages-with-delay';

/**
 * 스트리밍 상태 관리 훅
 *
 * - 로딩/스페이서 메시지 상태 관리
 * - 메시지 높이 측정
 * - 취소 처리
 */
export function useStreamingState() {
    const { chatRoomId } = useChatRoomActions();
    const chats = useRecoilValue(chatState);
    const { addChat, updateChat, deleteChat } = useChatOps({ useTransition: true });
    const [isLoading, setIsLoading] = useRecoilState(isStreamingState);
    const setIsShowStopButton = useSetRecoilState(isShowStopButtonState);
    const { processMessagesWithDelay, cancelFor } = useProcessMessagesWithDelay();

    // 로딩/스페이서 상태 보관
    const thinkingMsgIdRef = useRef<string | null>(null);
    const spacerMsgIdRef = useRef<string | null>(null);
    const thinkingHeightRef = useRef<number>(0);
    const lastAddedIdRef = useRef<string | null>(null);

    const lastChat = useMemo(
        () => (chats.length > 0 ? chats[chats.length - 1] : null),
        [chats]
    );

    /**
     * 마지막 추가된 메시지 ID 기억
     */
    const remember = useCallback((id: string) => {
        lastAddedIdRef.current = id;
    }, []);

    /**
     * 로딩 메시지 추가 및 표시
     */
    const showThinking = useCallback(
        (streamingMsg: Message) => {
            setIsShowStopButton(true);
            addChat(streamingMsg);
            thinkingMsgIdRef.current = streamingMsg.id;
            remember(streamingMsg.id);

            // 다음 프레임에 정확히 높이 측정
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const domId = getBotDomId(chatRoomId, thinkingMsgIdRef.current!);
                    thinkingHeightRef.current = measureBubbleHeightById(domId);
                });
            });
        },
        [addChat, chatRoomId, remember, setIsShowStopButton]
    );

    /**
     * 로딩 버블을 spacer로 변환
     */
    const convertToSpacer = useCallback(() => {
        if (thinkingMsgIdRef.current) {
            updateChat(thinkingMsgIdRef.current, (prev) => ({
                ...prev,
                messageType: MessageType.default,
                meta: { spacer: true, height: thinkingHeightRef.current || 48 },
                messageText: '',
                answerText: '',
            }));
            spacerMsgIdRef.current = thinkingMsgIdRef.current;
            remember(spacerMsgIdRef.current);
        }
    }, [remember, updateChat]);

    /**
     * spacer 메시지 제거
     */
    const clearSpacer = useCallback(() => {
        if (spacerMsgIdRef.current) {
            deleteChat(spacerMsgIdRef.current);
            if (lastAddedIdRef.current === spacerMsgIdRef.current) {
                lastAddedIdRef.current = null;
            }
            spacerMsgIdRef.current = null;
        }
    }, [deleteChat]);

    /**
     * 현재 spacerMsgId 반환 (최신 값)
     */
    const getSpacerMsgId = useCallback(() => {
        return spacerMsgIdRef.current;
    }, []);

    /**
     * 마지막 추가된 채팅 삭제 (취소 시)
     */
    const deleteLastAddedChat = useCallback(() => {
        if (lastChat && lastChat.id) {
            // "질문을 분석하는 중입니다" 메시지만 삭제
            if (
                lastChat.messageKey.module === MessageKeyFactory.chatbot.streaming_prefix().module &&
                lastChat.messageKey.action === MessageKeyFactory.chatbot.streaming_prefix().action
            ) {
                deleteChat(lastChat.id);
            }
            cancelFor(lastChat.id);
        }
    }, [cancelFor, deleteChat, lastChat]);

    /**
     * 모든 ref 상태 초기화
     */
    const resetRefs = useCallback(() => {
        thinkingMsgIdRef.current = null;
        spacerMsgIdRef.current = null;
        thinkingHeightRef.current = 0;
        lastAddedIdRef.current = null;
    }, []);

    /**
     * 스트리밍 시작
     */
    const startStreaming = useCallback(() => {
        setIsLoading(true);
    }, [setIsLoading]);

    /**
     * 스트리밍 종료
     */
    const stopStreaming = useCallback(() => {
        setIsLoading(false);
        setIsShowStopButton(false);
    }, [setIsLoading, setIsShowStopButton]);

    return {
        // 상태
        isLoading,
        getSpacerMsgId,

        // 메시지 조작
        addChat,
        remember,
        showThinking,
        convertToSpacer,
        clearSpacer,
        deleteLastAddedChat,
        processMessagesWithDelay,

        // 스트리밍 상태
        startStreaming,
        stopStreaming,
        resetRefs,
    };
}
