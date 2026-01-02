/**
 * 챗룸 대화 내역 조회(getChatRoomHistory) API 요청 바디 타입
 */
export interface GetChatRoomHistoryRequest {
  /** 조회할 챗룸의 고유 식별자 */
  chatRoomId: string;
}
