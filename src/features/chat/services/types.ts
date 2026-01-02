/**
 * ChatService 인터페이스 및 관련 타입 정의
 *
 * 확장 지점: 새로운 서비스 추가 시 이 인터페이스 구현
 */

import type { Message } from '../types/message';

/**
 * 스트리밍 청크 타입
 */
export interface StreamChunk {
    /** 현재까지 누적된 콘텐츠 */
    content: string;
    /** 스트리밍 완료 여부 */
    done: boolean;
}

/**
 * 서비스 옵션
 */
export interface ChatServiceOptions {
    /** 스트리밍 모드 사용 여부 */
    streaming?: boolean;
    /** 요청 타임아웃 (ms) */
    timeout?: number;
    /** AbortSignal (요청 취소용) */
    signal?: AbortSignal;
}

/**
 * ChatService 인터페이스
 *
 * 모든 채팅 서비스는 이 인터페이스를 구현해야 함
 * - LLMAPIService: LLM 직접 호출
 * - BackendAPIService: 백엔드 서버 API
 * - 확장 가능: RAGService, ClaudeAPIService 등
 */
export interface ChatService {
    /**
     * 메시지 전송
     *
     * @param messages - 대화 히스토리
     * @param onChunk - 스트리밍 청크 콜백 (streaming=true일 때)
     * @param options - 서비스 옵션
     * @returns 전체 응답 텍스트
     */
    sendMessage(
        messages: Message[],
        onChunk?: (chunk: StreamChunk) => void,
        options?: ChatServiceOptions
    ): Promise<string>;
}

/**
 * 서비스 타입 enum
 */
export type ServiceType = 'LLMAPI' | 'BackendAPI';

/**
 * 서비스 설정
 */
export interface ServiceConfig {
    /** 서비스 타입 */
    type: ServiceType;
    /** 스트리밍 모드 */
    streaming: boolean;
    /** 타임아웃 (ms) */
    timeout: number;
    /** 시스템 프롬프트 */
    systemPrompt?: string;
    /** 백엔드 API URL (BackendAPI용) */
    backendUrl?: string;
    /** LLM Provider (LLMAPI용) */
    llmProvider?: string;
    /** LLM API Key (LLMAPI용) */
    llmApiKey?: string;
    /** LLM Model (LLMAPI용) */
    llmModel?: string;
    /** LLM 프록시 사용 여부 (API Key 숨김) */
    llmUseProxy?: boolean;
}
