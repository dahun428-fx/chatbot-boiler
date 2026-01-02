/**
 * 채팅 상태 관리 (Recoil)
 */
import { atom } from 'recoil';

import type { LLMMessage } from '@/shared/api/llm/direct/types';

/**
 * 채팅 메시지 상태
 * - 대화 내역(LLMMessage[])을 저장
 */
export const messagesState = atom<LLMMessage[]>({
    key: 'messagesState',
    default: [],
});

/**
 * 로딩 상태
 * - true: 메시지 전송/응답 대기 중
 */
export const isLoadingState = atom<boolean>({
    key: 'isLoadingState',
    default: false,
});

/**
 * 스트리밍 중인 메시지
 * - 실시간으로 수신 중인 응답 텍스트
 */
export const streamingMessageState = atom<string>({
    key: 'streamingMessageState',
    default: '',
});
