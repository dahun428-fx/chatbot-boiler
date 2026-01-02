/**
 * 채팅 상태 훅 (읽기 전용)
 *
 * Recoil 상태에 대한 읽기 전용 접근을 제공합니다.
 * 쓰기 작업은 useChatActions를 사용하세요.
 */
import { useRecoilValue } from 'recoil';

import { errorState, isLoadingState, messagesState, streamingContentState } from '../atom';
import type { ChatState } from '../types';

/**
 * 채팅 상태 읽기 훅
 *
 * @returns ChatState - 읽기 전용 상태
 *
 * @example
 * ```tsx
 * const { messages, isLoading, streamingContent, error } = useChatState();
 * ```
 */
export const useChatState = (): ChatState & { isEmpty: boolean } => {
    const messages = useRecoilValue(messagesState);
    const isLoading = useRecoilValue(isLoadingState);
    const streamingContent = useRecoilValue(streamingContentState);
    const error = useRecoilValue(errorState);

    return {
        messages,
        isLoading,
        streamingContent,
        error,
        /** 메시지가 비어있는지 확인 */
        isEmpty: messages.length === 0 && !streamingContent,
    };
};
