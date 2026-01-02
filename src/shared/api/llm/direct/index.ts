/**
 * LLM Direct Module
 *
 * LLM API 직접 연결용 모듈
 */

// Types
export { LLMError } from './types';
export type {
    LLMAdapter,
    LLMErrorType,
    LLMMessage,
    LLMProviderConfig,
    LLMProviderType,
    LLMRequest,
    LLMResponse,
    LLMRole,
    LLMStreamChunk,
} from './types';

// Adapters
export { AnthropicAdapter, CustomAdapter, GeminiAdapter, OpenAIAdapter } from './adapters';

// Factory
import type { LLMAdapter, LLMProviderConfig, LLMProviderType } from './types';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { CustomAdapter } from './adapters/CustomAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';

export interface CreateLLMOptions extends LLMProviderConfig {
    type: LLMProviderType;
}

/**
 * LLM Provider 팩토리
 *
 * @example
 * ```typescript
 * const llm = createLLM({
 *   type: 'openai',
 *   apiKey: 'sk-...',
 *   defaultModel: 'gpt-4o',
 * });
 *
 * // 또는 환경변수 사용
 * const llm = createLLM({
 *   type: import.meta.env.VITE_LLM_PROVIDER,
 *   apiKey: import.meta.env.VITE_LLM_API_KEY,
 * });
 * ```
 */
export function createLLM(options: CreateLLMOptions): LLMAdapter {
    const { type, ...config } = options;

    switch (type) {
        case 'openai':
            return new OpenAIAdapter(config);
        case 'anthropic':
            return new AnthropicAdapter(config);
        case 'gemini':
            return new GeminiAdapter(config);
        case 'custom':
            return new CustomAdapter(config);
        default:
            throw new Error(`Unknown LLM provider type: ${type}`);
    }
}
