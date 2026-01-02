/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */

import { ApiBasicResponse } from '@/shared/api/api.types';

/**
 * openToAIChatroom API 응답 타입
 *
 * - ApiBasicResponse를 확장하여 statusCode, status 등의 공통 응답 필드를 포함합니다.
 * - 채팅룸 개설 요청에 대한 결과를 반환하며, 실제 채팅룸 ID나 추가 메타데이터는
 *   서버 구현에 따라 응답 필드에 포함될 수 있습니다.
 */
export interface OpenToAIChatroomResponse extends ApiBasicResponse {
  chatRoomId: string;
}
