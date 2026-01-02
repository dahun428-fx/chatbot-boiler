import { ApiBasicResponse } from '@/shared/api/api.types';
import { MessageForHistorySummary } from '@/shared/types/message.type';

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type */

/**
 * getUserChatRoomSummaries API 응답 타입
 *
 * - 사용자의 챗룸 요약 목록을 반환합니다.
 * - ApiBasicResponse를 확장하여 statusCode, status 등의 공통 응답 필드를 포함합니다.
 * - pagination 필드는 현재 페이지 번호를 나타내며,
 *   chatHistory 배열에는 각 챗룸의 ID와 해당 챗룸의 메시지 요약 목록이 담깁니다.
 */
export interface GetUserChatRoomSummariesResponse extends ApiBasicResponse {
  /** 현재 페이지 번호 */
  pagination: number;
  /** 챗룸별 요약 대화 기록 목록 */
  chatHistory: {
    /** 챗룸 고유 식별자 */
    chatRoomId: string;
    /** 요약된 메시지 배열 */
    messages: MessageForHistorySummary[];
  }[];
}
