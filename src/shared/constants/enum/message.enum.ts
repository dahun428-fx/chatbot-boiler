/**
 * 메시지 송신자 타입
 * - user: 사용자 메시지
 * - chatbot: 챗봇 메시지
 */
export enum SenderType {
  /** 사용자 메시지 */
  user = '0',
  /** 챗봇 메시지 */
  chatbot = '1',
}

/**
 * 메시지 응답(Answer) 유형
 * - default: 기본 옵션(가로)
 * - defaultVertical: 기본 옵션(세로)
 * - defaultHorizontal: 기본 옵션(가로)
 * - content: 컨텐츠
 * - faq: FAQ
 * - star: 만족도 조사
 * - starSubmitted: 만족도 조사 완료
 * - chatFinished: 채팅 종료
 * - summery: 요약
 * - modal: 모달
 * - document: 문서
 * - error: 에러
 */
export enum AnswerType {
  /** 기본 옵션(가로) */
  default = '0',
  /** 기본 옵션(세로) */
  defaultVertical = '1',
  /** 기본 옵션(가로) */
  defaultHorizontal = '12',
  /** 컨텐츠 */
  content = '3',
  /** FAQ */
  faq = '4',
  /** 만족도 조사 */
  star = '5',
  /** 만족도 조사 완료 */
  starSubmitted = '6',
  /** 채팅 종료 */
  chatFinished = '7',
  /** 요약 */
  summery = '8',
  /** 모달 */
  modal = '9',
  /** 문서 */
  document = '11',
  /** 에러 */
  error = '13',
  /** LLM 에러 */
  llmError = '14',
  /** FAQ 카드 */
  faqCard = '15',
}

/**
 * 만족도 조사 유형
 */
export enum SatisfactionType {
  /** 상세 만족도 */
  detail = '2',
}

export enum MessageType {
  /** 사용자 default : 0 */
  default = 0,
  /** 자유발화 */
  usertext = 1,
}

export enum OptionTextType {
  CommonAnswer = 1,
  DefaultAnswerText = 2,
  ContentAnswer = 4,
  FAQAnswer = 5,
  LLMAnswer = 6,
  FaqCardAnswer = 7,
}
