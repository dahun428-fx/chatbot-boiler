/**
 * LLM Server Client 타입 정의
 *
 * 자체 백엔드 서버를 통해 LLM과 통신할 때 사용
 */

/** 메시지 역할 */
export type MessageRole = 'system' | 'user' | 'assistant';

/** 메시지 */
export interface Message {
    role: MessageRole;
    content: string;
}

/** 채팅 요청 */
export interface ChatRequest {
    messages: Message[];
    /** 추가 파라미터 (서버에서 정의한 필드) */
    [key: string]: unknown;
}

/** 채팅 응답 (API 모드) */
export interface ChatResponse {
    content: string;
    /** 추가 응답 데이터 */
    [key: string]: unknown;
}

/** 스트리밍 청크 */
export interface StreamChunk {
    content: string;
    done: boolean;
    /** 추가 데이터 */
    [key: string]: unknown;
}

/** LLM Server Client 설정 */
export interface LLMServerConfig {
    /** 서버 기본 URL */
    baseUrl: string;
    /** 채팅 엔드포인트 (기본: '/chat') */
    chatEndpoint?: string;
    /** 스트리밍 엔드포인트 (기본: '/chat/stream') */
    streamEndpoint?: string;
    /** 기본 헤더 */
    headers?: Record<string, string>;
    /** 타임아웃 (ms) */
    timeout?: number;
    /** 인증 토큰 제공자 */
    getAuthToken?: () => string | null | Promise<string | null>;
    /** SSE 데이터 파서 (서버 응답 형식에 맞게 커스터마이징) */
    parseSSEData?: (data: string) => StreamChunk | null;
    /** API 응답 파서 */
    parseResponse?: (data: unknown) => ChatResponse;
}

/** 요청 옵션 */
export interface ChatOptions {
    /** 추가 헤더 */
    headers?: Record<string, string>;
    /** AbortSignal */
    signal?: AbortSignal;
    /** 타임아웃 (ms) */
    timeout?: number;
}
