/**
 * 채팅 관련 타입 정의
 *
 * 확장 지점: 새로운 타입 추가 시 여기에 정의 또는 별도 파일 생성 후 re-export
 */

// Message 타입
export type { Message, MessageRole, LLMRequestMessage } from './message';
export { createMessage, generateMessageId } from './message';

// Error 타입
export type { ChatError, ChatErrorType } from './error';
export { createChatError, getErrorDisplayMessage } from './error';

// Legacy 호환용 (shared에서 가져오는 타입)
export type { LLMMessage, LLMProviderType } from '@/shared/api/llm/direct/types';

/**
 * LLM 설정 타입
 */
export interface LLMConfig {
    provider: import('@/shared/api/llm/direct/types').LLMProviderType;
    apiKey: string;
    model?: string;
    systemPrompt: string;
}

/**
 * 채팅 상태 인터페이스 (읽기 전용)
 */
export interface ChatState {
    /** 메시지 목록 */
    messages: import('./message').Message[];
    /** 로딩 중 여부 */
    isLoading: boolean;
    /** 스트리밍 중인 콘텐츠 */
    streamingContent: string;
    /** 에러 정보 */
    error: import('./error').ChatError | null;
}

/**
 * 채팅 액션 인터페이스 (쓰기 전용)
 */
export interface ChatActions {
    /** 메시지 전송 */
    send: (content: string) => Promise<void>;
    /** 요청 중단 */
    abort: () => void;
    /** 대화 초기화 */
    clear: () => void;
    /** 재시도 */
    retry: () => void;
}

/**
 * 통합 채팅 훅 반환 타입
 */
export interface UseChat extends ChatState, ChatActions { }
