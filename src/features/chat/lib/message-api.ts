import camelcaseKeys from 'camelcase-keys';
import dayjs from 'dayjs';

import { HttpClient } from '@/shared/api/http';

import type {
    MessageReturnType,
    SendChatMessageParams,
    SnakeCaseMessageReturnType,
} from '../types/message-input.types';

import { MESSAGE_CONFIG } from './constants';

// Chat Direct API 클라이언트
const chatDirectApi = new HttpClient({
    baseUrl: import.meta.env.VITE_CHAT_DIRECT_URL ?? '/api/chat',
    headers: {
        'user-token': sessionStorage.getItem('userToken') ?? '',
    },
    timeout: MESSAGE_CONFIG.TIMEOUT_MS,
});

/**
 * 채팅 메시지를 서버에 전송하고 응답을 받습니다.
 *
 * @param params - 메시지 전송 파라미터
 * @param signal - AbortController 시그널 (요청 취소용)
 * @returns 변환된 메시지 응답
 */
export async function sendChatMessage(
    params: SendChatMessageParams,
    signal: AbortSignal
): Promise<MessageReturnType> {
    const rawRes = await chatDirectApi.post<SnakeCaseMessageReturnType>(
        '',
        {
            chatRoomId: params.chatRoomId,
            msgTimestamp: params.msgTimestamp,
            msgTypeCd: params.msgTypeCd,
            msgDc: params.msgDc,
        },
        { signal }
    );

    return camelcaseKeys(rawRes, { deep: true }) as MessageReturnType;
}

/**
 * 현재 시각의 타임스탬프를 생성합니다.
 * @returns YYYYMMDDHHmmssSSS 형식의 타임스탬프
 */
export function createMessageTimestamp(): string {
    return dayjs().format('YYYYMMDDHHmmssSSS');
}
