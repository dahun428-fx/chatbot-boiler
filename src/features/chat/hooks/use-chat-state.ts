/**
 * 채팅 상태 훅
 *
 * Recoil 상태에 대한 읽기 전용 접근을 제공합니다.
 */
import { useRecoilValue } from 'recoil';

import { isLoadingState, messagesState, streamingMessageState } from '../atom';

/**
 * 채팅 상태 읽기 훅
 */
export const useChatState = () => {
    const messages = useRecoilValue(messagesState);
    const isLoading = useRecoilValue(isLoadingState);
    const streamingMessage = useRecoilValue(streamingMessageState);

    return {
        messages,
        isLoading,
        streamingMessage,
        /** 메시지가 비어있는지 확인 */
        isEmpty: messages.length === 0 && !streamingMessage,
    };
};
