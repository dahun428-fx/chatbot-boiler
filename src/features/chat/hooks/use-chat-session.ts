import { useCallback, useRef } from 'react';

import { useOpenToAIChatroom } from '@/entities/chat';

import { MESSAGE_CONFIG } from '../lib/constants';

import { useChatRoomActions } from './use-init-chat-room-id';

/**
 * 채팅 세션 및 네트워크 요청 관리 훅
 *
 * - AbortController를 통한 요청 취소 관리
 * - 세션 유효성 검증 및 갱신
 * - 30분 스로틀링된 refetch
 */
export function useChatSession() {
    const { chatRoomId } = useChatRoomActions();
    const { refetch } = useOpenToAIChatroom({}, { enabled: false });

    /** 네트워크 중단용 컨트롤러 */
    const controllerRef = useRef<AbortController | null>(null);
    /** 응답에서 받은 chatRoomId 저장 */
    const resChatRoomIdRef = useRef<string | null>(null);
    /** 마지막 refetch 시간 */
    const lastRefetchAtRef = useRef<number | null>(null);
    /** 마지막 refetch한 roomId */
    const lastRoomIdRef = useRef<string | null>(null);

    /**
     * 30분 제한 스로틀된 refetch
     * - room이 같으면 60분 내 refetch 스킵
     */
    const throttledRefetch = useCallback(async () => {
        if (lastRoomIdRef.current !== chatRoomId) {
            lastRoomIdRef.current = chatRoomId;
            lastRefetchAtRef.current = null;
        }

        const now = Date.now();
        if (
            lastRefetchAtRef.current === null ||
            now - lastRefetchAtRef.current >= MESSAGE_CONFIG.SESSION_TTL_MS
        ) {
            const { data } = await refetch();
            if (data?.statusCode === 200) {
                resChatRoomIdRef.current = data?.chatRoomId ?? null;
            }
            lastRefetchAtRef.current = now;
        }
    }, [chatRoomId, refetch]);

    /**
     * 새 AbortController 생성 및 반환
     */
    const createController = useCallback(() => {
        const controller = new AbortController();
        controllerRef.current = controller;
        return controller;
    }, []);

    /**
     * 현재 요청 중단
     */
    const abortRequest = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
    }, []);

    /**
     * 컨트롤러 초기화 (요청 완료 후)
     */
    const clearController = useCallback(() => {
        controllerRef.current = null;
    }, []);

    /**
     * 활성화된 chatRoomId 반환 (응답에서 받은 ID 우선)
     */
    const getActiveChatRoomId = useCallback(() => {
        return resChatRoomIdRef.current ?? chatRoomId;
    }, [chatRoomId]);

    return {
        chatRoomId,
        throttledRefetch,
        createController,
        abortRequest,
        clearController,
        getActiveChatRoomId,
    };
}
