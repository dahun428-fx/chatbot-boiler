import { MessageType } from '@/shared/constants/enum/message.enum';

/**
 * 사용자 채팅 저장 API 요청 바디 타입
 */
export interface SaveUserChatRequest {
  /** 메시지가 속한 챗룸의 고유 식별자 */
  chatRoomId: string;
  /** 발신자 유형 */
  senderType?: string;
  /** 메시지 타입 */
  messageType?: MessageType;
  /** 발신자가 입력한 메시지 내용 */
  messageText?: string;
  /** 응답 타입 */
  answerType?: string;
  /** AI 또는 시스템이 반환한 응답 내용 */
  answerText?: string;
  /** 버튼 옵션 타입 */
  optionType?: string;
  /** 버튼 옵션 텍스트 */
  optionText?: string;
}
