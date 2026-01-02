/**
 * 채팅 상태 관리 (Recoil)
 *
 * 확장 지점: 새로운 상태 추가 시 여기에 atom 정의
 */
import { atom } from 'recoil';

import type { ChatError } from '../types/error';
import type { Message } from '../types/message';

import { localStorageEffect } from './effects';

/**
 * 채팅 메시지 상태
 * - 대화 내역(Message[])을 저장
 * - LocalStorage 동기화 (VITE_LOCALSTORAGE_SAVE=true 시)
 */
export const messagesState = atom<Message[]>({
    key: 'chat/messages',
    default: [],
    effects: [localStorageEffect<Message[]>('messages')],
});

/**
 * 로딩 상태
 * - true: 메시지 전송/응답 대기 중
 */
export const isLoadingState = atom<boolean>({
    key: 'chat/loading',
    default: false,
});

/**
 * 스트리밍 중인 콘텐츠
 * - 실시간으로 수신 중인 응답 텍스트
 */
export const streamingContentState = atom<string>({
    key: 'chat/streaming',
    default: '',
});

/**
 * 에러 상태
 * - 마지막 발생한 에러 정보
 */
export const errorState = atom<ChatError | null>({
    key: 'chat/error',
    default: null,
});

// Effects re-export
export { clearAllChatStorage, clearLocalStorage, isLocalStorageEnabled, localStorageEffect } from './effects';
