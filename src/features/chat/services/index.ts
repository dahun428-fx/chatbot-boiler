/**
 * ChatService 팩토리 및 설정
 *
 * 확장 지점: 새로운 서비스 추가 시 serviceFactories에 등록
 */

import { BackendAPIService } from './backend-api.service';
import { LLMAPIService } from './llm-api.service';
import type { ChatService, ServiceConfig, ServiceType } from './types';

/**
 * 환경변수에서 설정 로드
 */
const loadConfig = (): ServiceConfig => ({
    type: (import.meta.env.VITE_CHAT_SERVICE_TYPE || 'BackendAPI') as ServiceType,
    streaming: import.meta.env.VITE_STREAMING_MODE === 'true',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000,
    systemPrompt: import.meta.env.VITE_SYSTEM_PROMPT || undefined,
    backendUrl: import.meta.env.VITE_BACKEND_API_URL || undefined,
    llmProvider: import.meta.env.VITE_LLM_PROVIDER || 'openai',
    llmApiKey: import.meta.env.VITE_LLM_API_KEY || undefined,
});

/**
 * 서비스 팩토리 레지스트리
 *
 * 확장 방법:
 * ```ts
 * serviceFactories['RAGService'] = (config) => new RAGService(config);
 * serviceFactories['ClaudeAPI'] = (config) => new ClaudeAPIService(config);
 * ```
 */
const serviceFactories: Record<string, (config: ServiceConfig) => ChatService> = {
    LLMAPI: (config) => new LLMAPIService(config),
    BackendAPI: (config) => new BackendAPIService(config),
};

/**
 * 서비스 팩토리에 새 서비스 등록
 */
export const registerService = (
    type: string,
    factory: (config: ServiceConfig) => ChatService
): void => {
    serviceFactories[type] = factory;
};

/**
 * ChatService 인스턴스 생성
 */
export const createChatService = (customConfig?: Partial<ServiceConfig>): ChatService => {
    const config = { ...loadConfig(), ...customConfig };
    const factory = serviceFactories[config.type];

    if (!factory) {
        console.warn(`Unknown service type: ${config.type}, falling back to BackendAPI`);
        return new BackendAPIService(config);
    }

    return factory(config);
};

/**
 * 기본 설정 조회
 */
export const getServiceConfig = (): ServiceConfig => loadConfig();

/**
 * 스트리밍 모드 여부
 */
export const isStreamingMode = (): boolean => loadConfig().streaming;

/**
 * 기본 ChatService 싱글톤
 *
 * 대부분의 경우 이것을 사용
 */
export const chatService: ChatService = createChatService();

// 타입 re-export
export type { ChatService, ChatServiceOptions, ServiceConfig, ServiceType, StreamChunk } from './types';
