/**
 * 사용자 챗룸 요약 목록 조회 API 요청 바디 타입
 */
export interface GetUserChatRoomSummariesRequest {
  /** 요청할 페이지 번호 (1부터 시작) */
  pagination: number;
}
