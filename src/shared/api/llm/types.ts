/**
 * LLM Provider 추상화 레이어 타입 정의
 */

/** LLM 메시지 역할 */
export type LLMRole = 'system' | 'user' | 'assistant';

/** LLM 메시지 */
export interface LLMMessage {
    role: LLMRole;
    content: string;
}

/** LLM 요청 파라미터 */
export interface LLMRequest {
    messages: LLMMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    signal?: AbortSignal;
}

/** LLM 응답 */
export interface LLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: 'stop' | 'length' | 'content_filter' | 'error';
}

/** 스트리밍 청크 */
export interface LLMStreamChunk {
    content: string;
    done: boolean;
}

/** LLM 에러 타입 */
export type LLMErrorType =
    | 'auth_error'
    | 'rate_limit'
    | 'invalid_request'
    | 'model_not_found'
    | 'context_length_exceeded'
    | 'network_error'
    | 'timeout'
    | 'unknown';

/** LLM 에러 */
export class LLMError extends Error {
    type: LLMErrorType;
    statusCode?: number;
    retryable: boolean;

    constructor(message: string, type: LLMErrorType, statusCode?: number) {
        super(message);
        this.name = 'LLMError';
        this.type = type;
        this.statusCode = statusCode;
        this.retryable = ['rate_limit', 'network_error', 'timeout'].includes(type);
    }
}

/** LLM Provider 설정 */
export interface LLMProviderConfig {
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
    timeout?: number;
}

/** LLM Adapter 인터페이스 */
export interface LLMAdapter {
    /** 동기 채팅 요청 */
    chat(request: LLMRequest): Promise<LLMResponse>;

    /** 스트리밍 채팅 요청 */
    stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown>;

    /** Provider 이름 */
    readonly name: string;
}
