/**
 * 통합 채팅 훅
 *
 * useChatState와 useChatActions를 조합한 통합 훅입니다.
 * 대부분의 경우 이 훅만 사용하면 됩니다.
 */

import type { UseChat } from '../types';

import { useChatActions } from './use-chat-actions';
import { useChatState } from './use-chat-state';

/**
 * 통합 채팅 훅
 *
 * @returns UseChat - 상태 + 액션
 *
 * @example
 * ```tsx
 * const {
 *   // 상태
 *   messages,
 *   isLoading,
 *   streamingContent,
 *   error,
 *   isEmpty,
 *
 *   // 액션
 *   send,
 *   abort,
 *   clear,
 *   retry,
 * } = useChat();
 *
 * // 메시지 전송
 * const handleSubmit = async (text: string) => {
 *   await send(text);
 * };
 *
 * // 에러 발생 시 재시도
 * if (error?.retryable) {
 *   return <button onClick={retry}>재시도</button>;
 * }
 * ```
 */
export const useChat = (): UseChat & { isEmpty: boolean } => {
    const state = useChatState();
    const actions = useChatActions();

    return {
        ...state,
        ...actions,
    };
};
