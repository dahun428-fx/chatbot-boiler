/**
 * 채팅 관련 타입 정의
 */

export type { LLMMessage, LLMProviderType } from '@/shared/api/llm/direct/types';

/**
 * LLM 설정 타입
 */
export interface LLMConfig {
    provider: import('@/shared/api/llm/direct/types').LLMProviderType;
    apiKey: string;
    systemPrompt: string;
}

/**
 * 메시지 전송 파라미터
 */
export interface SendMessageParams {
    content: string;
}

/**
 * 채팅 컨트롤러 인터페이스
 */
export interface ChatController {
    /** 메시지 전송 */
    sendMessage: (content: string) => Promise<void>;
    /** 스트리밍 중단 */
    abort: () => void;
    /** 대화 초기화 */
    clearChat: () => void;
}

/**
 * 메시지 입력 폼 상태
 */
export interface MessageInputState {
    value: string;
    setValue: (value: string) => void;
    clear: () => void;
}
