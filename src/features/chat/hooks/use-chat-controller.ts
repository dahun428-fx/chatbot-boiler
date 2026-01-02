/**
 * 채팅 컨트롤러 훅 (Legacy)
 *
 * @deprecated useChat 또는 useChatActions를 사용하세요.
 *
 * 하위 호환성을 위해 유지됩니다.
 */
import { useCallback } from 'react';

import { useChatActions } from './use-chat-actions';

/**
 * 레거시 ChatController 인터페이스
 * @deprecated
 */
export interface ChatController {
    /** 메시지 전송 */
    sendMessage: (content: string) => Promise<void>;
    /** 스트리밍 중단 */
    abort: () => void;
    /** 대화 초기화 */
    clearChat: () => void;
}

/**
 * 채팅 컨트롤러 훅
 *
 * @deprecated useChat 또는 useChatActions를 사용하세요.
 *
 * @returns ChatController - 메시지 전송, 중단, 초기화 함수
 */
export const useChatController = (): ChatController => {
    const { send, abort, clear } = useChatActions();

    // 레거시 API 호환
    const sendMessage = useCallback(
        async (content: string) => {
            await send(content);
        },
        [send]
    );

    const clearChat = useCallback(() => {
        clear();
    }, [clear]);

    return {
        sendMessage,
        abort,
        clearChat,
    };
};
