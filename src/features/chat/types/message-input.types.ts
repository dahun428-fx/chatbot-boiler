import type { Message } from '@/shared/types/message.type';

/**
 * 챗봇 의도 분석 결과 타입
 */
export type IntentType = {
    code: string;
    intent: string;
    slots: Record<string, unknown>;
};

/**
 * 지역 정보 타입
 */
export type Sigungu = {
    sigunguCode?: string;
    sidoCode?: string;
    dong?: string;
};

/**
 * 메시지 API 응답 타입 (camelCase 변환 후)
 */
export type MessageReturnType = {
    statusCd: string;
    message: string;
    msgTypeCd: string;
    msgDc: string;
    document: string[];
    suggestQuestions: string[];
    intentSlots: IntentType;
    sigungu?: Sigungu;
};

/**
 * 메시지 API 응답 타입 (snake_case 원본)
 */
export type SnakeCaseMessageReturnType = {
    status_cd: string;
    message: string;
    msg_type_cd: string;
    msg_dc: string;
    document: string[];
    suggest_questions: string[];
    intent_slots: IntentType;
};

/**
 * 메시지 전송 파라미터
 */
export type SendMessageParams = {
    /** 사용자 질문 */
    msg: string;
    /** 추천 질문 인덱스 (0,1,2) */
    idx?: number;
    /** 사용자 메시지 숨김 여부 */
    dontShowUserMsg?: boolean;
    /** dontShowUserMsg가 true일 때 다음 메시지 */
    nextMsg?: Message[];
    /** 이벤트 출처 */
    from?: 'llm' | 'suggested_question_1' | 'suggested_question_2' | 'suggested_question_3' | string;
};

/**
 * 채팅 API 호출 파라미터
 */
export type SendChatMessageParams = {
    chatRoomId: string;
    msgTimestamp: string;
    msgTypeCd: string;
    msgDc: string;
};

/**
 * useMessageInput 훅에서 외부로 노출하는 메서드
 */
export type MessageInputHandle = {
    sendMessage: (params: SendMessageParams) => Promise<void>;
    deleteLastAddedChat: () => void;
};
