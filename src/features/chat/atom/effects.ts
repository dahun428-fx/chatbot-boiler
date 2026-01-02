/**
 * Recoil Effects
 *
 * LocalStorage 동기화 등 side effect 처리
 */

import type { AtomEffect } from 'recoil';

/**
 * LocalStorage 저장 여부 (환경변수)
 */
const LOCALSTORAGE_SAVE = import.meta.env.VITE_LOCALSTORAGE_SAVE === 'true';

/**
 * LocalStorage 키 prefix
 */
const STORAGE_PREFIX = 'chatbot_';

/**
 * LocalStorage 동기화 Effect
 *
 * VITE_LOCALSTORAGE_SAVE=true 일 때만 동작
 *
 * @param key - 저장 키
 * @returns AtomEffect
 *
 * @example
 * ```ts
 * const messagesState = atom({
 *   key: 'chat/messages',
 *   default: [],
 *   effects: [localStorageEffect('messages')],
 * });
 * ```
 */
export const localStorageEffect =
    <T>(key: string): AtomEffect<T> =>
        ({ setSelf, onSet }) => {
            // LocalStorage 저장이 비활성화된 경우 아무것도 하지 않음
            if (!LOCALSTORAGE_SAVE) return;

            const storageKey = `${STORAGE_PREFIX}${key}`;

            // 초기값 복원
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved !== null) {
                    const parsed = JSON.parse(saved);
                    setSelf(parsed);
                }
            } catch (error) {
                console.warn(`[LocalStorage] Failed to parse ${storageKey}:`, error);
            }

            // 변경 시 저장
            onSet((newValue, _, isReset) => {
                try {
                    if (isReset) {
                        localStorage.removeItem(storageKey);
                    } else {
                        localStorage.setItem(storageKey, JSON.stringify(newValue));
                    }
                } catch (error) {
                    console.warn(`[LocalStorage] Failed to save ${storageKey}:`, error);
                }
            });
        };

/**
 * LocalStorage 저장 활성화 여부 확인
 */
export const isLocalStorageEnabled = (): boolean => LOCALSTORAGE_SAVE;

/**
 * 특정 키의 LocalStorage 데이터 삭제
 */
export const clearLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
        console.warn(`[LocalStorage] Failed to clear ${key}:`, error);
    }
};

/**
 * 모든 채팅 관련 LocalStorage 데이터 삭제
 */
export const clearAllChatStorage = (): void => {
    try {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_PREFIX));
        keys.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
        console.warn('[LocalStorage] Failed to clear all:', error);
    }
};
