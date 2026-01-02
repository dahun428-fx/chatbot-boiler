import { MessageKey } from '@/entities/message-set/types/messageKey';

import {
  AnswerType,
  MessageType,
  OptionTextType,
  SatisfactionType,
  SenderType,
} from '../constants/enum/message.enum';

// client용
export interface Message {
  id: string; // message id : server 측에서 받아옴
  senderType: SenderType; // 발신자 유형 (예: user, bot) -- 채팅에서 챗봇 / 사용자 메시지 구분
  messageKey: MessageKey; // 발화 key
  messageText?: string; // 사용자 메시지
  messageType?: MessageType; // 자유 발화 여부를 구분한다 -- LLM 으로 부터 직접 질문하는 발화는 '자유 발화 : 1' 로 구분
  answerType?: AnswerType; // 답변 타입 -- 챗봇의 행동을 분기처리하기 위해 구분한다
  answerText?: string; // 답변 옵션들 혹은 컨텐츠 등 stringify해서 저장 -- 챗봇이 직접 응답하는 발화.
  optionType?: OptionText;
  buttonOptionText?: string; // 서버에 전송할 버튼 Json 문자열
  optionText?:
    | CommonAnswerType
    | DefaultAnswerTextType
    | ContentAnswerType
    | FAQAnswerType
    | DocumentsType
    | SuggestQuestionsType; // 출처 확인 혹은 컨텐츠 등
  createTime?: string; // 메시지 생성 시간
  satisfactionType?: SatisfactionType; // 만족도 조사 타입
  documents?: string[]; // 출처
  suggestQuestions?: string[]; // 추천 질문들
  chatRoomId?: string; // 채팅방 ID
  deleted?: boolean;
  deleted_at?: string | null;
  messageBubble?: string; //실제로 출력되는 메시지
  chatBotId?: string; // 챗봇 ID
  /** ✅ spacer 인지 여부와 높이 전달용 (useMessageInput에서 meta로 세팅) */
  meta?: {
    spacer?: boolean;
    height?: number;
  } | null;
  isNoAnswer?: boolean; // 답변이 없음을 나타내는 플래그
}

// history용
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MessageForHistory extends Message {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MessageForHistorySummary extends Message {}

export interface MessageWithcreateTime extends Message {
  createTime: string;
}

export type CommonAnswerType = {
  isNewChat?: boolean;
};

// 기본적인 option들만 있는 타입.
export interface DefaultAnswerTextType extends CommonAnswerType {
  options: Option[];
}

export type Option = {
  id?: string;
  subLabel?: string; // 옵션의 하위 레이블
  topLabel?: string; // 옵션의 상위 레이블
  label: string; // 버튼에 표시되는 텍스트
  icon?: string;
  answerLabel?: string;
  goTo?: MessageKey;
  searchText?: string;
  messages?: Message[];
  isEndButton?: boolean;
  isFinishButton?: boolean; // 종료 버튼 여부
  btnType?: 'default'; // 버튼 스타일 구분용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
};

// 컨텐츠 정보
export type Content = {
  url: string;
};

// 컨텐츠 정보들을 담은 타입.
export interface ContentAnswerType extends CommonAnswerType {
  contents: Content[];
}

export type FAQ = {
  question: string;
  answer: string;
  linkUrl?: string;
};

export interface FAQAnswerType extends CommonAnswerType {
  faqs: FAQ[];
}

export interface DocumentsType extends CommonAnswerType {
  documents: string[];
}

export interface SuggestQuestionsType extends CommonAnswerType {
  suggestQuestions: string[];
}

export type AnswerProps = {
  chat: Message;
};

// optionText 정의
export type OptionText =
  | OptionTextType.CommonAnswer
  | OptionTextType.DefaultAnswerText
  | OptionTextType.ContentAnswer
  | OptionTextType.FAQAnswer
  | OptionTextType.LLMAnswer;
