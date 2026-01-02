/**
 * 메시지 관련 타입 정의
 */

/**
 * 메시지 역할 타입
 * - user: 사용자 메시지
 * - assistant: AI 응답
 * - system: 시스템 프롬프트 (내부용)
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 메시지 인터페이스
 */
export interface Message {
    /** 고유 ID */
    id: string;
    /** 역할 */
    role: MessageRole;
    /** 메시지 내용 */
    content: string;
    /** 생성 타임스탬프 */
    timestamp: number;
}

/**
 * LLM 요청용 메시지 (id, timestamp 제외)
 */
export interface LLMRequestMessage {
    role: MessageRole;
    content: string;
}

/**
 * 메시지 생성 헬퍼
 */
export const createMessage = (
    role: MessageRole,
    content: string,
    id?: string
): Message => ({
    id: id || generateMessageId(),
    role,
    content,
    timestamp: Date.now(),
});

/**
 * 메시지 ID 생성
 */
export const generateMessageId = (): string =>
    `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
