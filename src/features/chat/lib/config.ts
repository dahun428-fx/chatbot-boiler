/**
 * 채팅 설정 - 환경변수에서 로드
 */
import type { LLMProviderType } from '@/shared/api/llm/direct/types';

import type { LLMConfig } from '../types';

/**
 * 환경변수에서 LLM 설정 로드
 */
export const getLLMConfig = (): LLMConfig => ({
    provider: (import.meta.env.VITE_LLM_PROVIDER || 'openai') as LLMProviderType,
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || undefined,
    systemPrompt: import.meta.env.VITE_SYSTEM_PROMPT || 'You are a helpful assistant.',
});

/**
 * API 키 유효성 검사
 */
export const validateApiKey = (apiKey: string): boolean => {
    return !!apiKey && apiKey.trim().length > 0;
};

/**
 * 서비스 설정 조회
 */
export const getServiceConfig = () => ({
    type: import.meta.env.VITE_CHAT_SERVICE_TYPE || 'BackendAPI',
    streaming: import.meta.env.VITE_STREAMING_MODE === 'true',
    localStorageSave: import.meta.env.VITE_LOCALSTORAGE_SAVE === 'true',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 30000,
    backendUrl: import.meta.env.VITE_BACKEND_API_URL || '',
});
