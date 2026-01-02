import { RefObject } from 'react';
import { atom } from 'recoil';

import { MessageKey } from '@/entities/message-set/types/messageKey';
import { Message } from '@/shared/types/message.type';

/**
 * 채팅 메시지 상태
 */
export const chatState = atom<Array<Message>>({
  key: 'chatState',
  default: [],
  dangerouslyAllowMutability: true,
});

/**
 * 현재 활성화된 메시지 세트 정보
 */
export const currentMessageSetIdState = atom<{
  messageSetId: string | undefined;
  messageKey: MessageKey | undefined;
  messageText: string | undefined;
}>({
  key: 'currentMessageSetIdState',
  default: {
    messageSetId: undefined,
    messageKey: undefined,
    messageText: undefined,
  },
});

/**
 * 채팅 메시지 스트리밍 여부
 */
export const isStreamingState = atom<boolean>({
  key: 'isStreamingState',
  default: false,
});

/**
 * 스크롤 컨테이너 ref 상태
 */
export const scrollParentRefState = atom<RefObject<HTMLDivElement> | null>({
  key: 'scrollParentRefState',
  default: null,
  dangerouslyAllowMutability: true,
});

/**
 * 스크롤 애니메이션 상태
 */
export const isScrollAnimatingState = atom<boolean>({
  key: 'isScrollAnimatingState',
  default: false,
});

/**
 * 채팅 시작 여부
 */
export const chatStartedState = atom<boolean>({
  key: 'chatStartedState',
  default: false,
});

/**
 * 채팅방 ID
 */
const STORAGE_KEY = 'chatRoomIdSession';

export const chatRoomIdState = atom<string | null>({
  key: 'chatRoomId',
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) setSelf(saved);
      }
      onSet((val) => {
        if (typeof window === 'undefined') return;
        if (val) sessionStorage.setItem(STORAGE_KEY, val);
        else sessionStorage.removeItem(STORAGE_KEY);
      });
    },
  ],
});

/**
 * 스톱 버튼 표시 상태
 */
export const isShowStopButtonState = atom<boolean>({
  key: 'isShowStopButtonState',
  default: false,
});
