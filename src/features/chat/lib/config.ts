/**
 * LLM 설정 - 환경변수에서 로드
 */
import type { LLMProviderType } from '@/shared/api/llm/direct/types';

import type { LLMConfig } from '../types';

/**
 * 환경변수에서 LLM 설정 로드
 */
export const getLLMConfig = (): LLMConfig => ({
    provider: (import.meta.env.VITE_LLM_PROVIDER || 'openai') as LLMProviderType,
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    systemPrompt: import.meta.env.VITE_LLM_SYSTEM_PROMPT || 'You are a helpful assistant.',
});

/**
 * API 키 유효성 검사
 */
export const validateApiKey = (apiKey: string): boolean => {
    return !!apiKey && apiKey.trim().length > 0;
};
