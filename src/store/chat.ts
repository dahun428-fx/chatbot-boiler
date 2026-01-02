/**
 * 채팅 상태 관리 (Recoil)
 */
import { atom } from 'recoil';

import type { LLMMessage } from '@/shared/api/llm/direct/types';

/** 채팅 메시지 상태 */
export const messagesState = atom<LLMMessage[]>({
    key: 'messagesState',
    default: [],
});

/** 로딩 상태 */
export const isLoadingState = atom<boolean>({
    key: 'isLoadingState',
    default: false,
});

/** 스트리밍 중인 메시지 */
export const streamingMessageState = atom<string>({
    key: 'streamingMessageState',
    default: '',
});
