import { ApiBasicResponse } from '@/shared/api/types';

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */

/**
 * saveUserChat API 응답 타입
 *
 * - ApiBasicResponse를 확장하여 statusCode, status 등의 공통 응답 필드를 포함합니다.
 * - 서버에 채팅 메시지를 저장한 후, 생성된 메시지의 고유 ID를 반환합니다.
 */
export interface SaveUserChatResponse extends ApiBasicResponse {
  /** 생성된 채팅 메시지 ID 데이터 */
  data: {
    /** 저장된 메시지의 고유 ID */
    id: string;
  };
}
