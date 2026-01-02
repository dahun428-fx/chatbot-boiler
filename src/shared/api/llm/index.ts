/**
 * LLM Provider Abstraction Layer
 *
 * 다양한 LLM 제공자(OpenAI, Anthropic 등)를 동일한 인터페이스로 사용할 수 있게 해주는 추상화 레이어입니다.
 *
 * @example
 * ```typescript
 * import { createLLMProvider, OpenAIAdapter } from '@/shared/api/llm';
 *
 * // 환경변수로 자동 설정
 * const provider = createLLMProvider();
 *
 * // 또는 직접 어댑터 생성
 * const openai = new OpenAIAdapter({
 *   apiKey: 'sk-...',
 *   defaultModel: 'gpt-4o',
 * });
 *
 * // 일반 채팅
 * const response = await provider.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 *
 * // 스트리밍
 * for await (const chunk of provider.stream({ messages })) {
 *   console.log(chunk.content);
 * }
 * ```
 */

// Types
export type {
    LLMAdapter,
    LLMMessage,
    LLMProviderConfig,
    LLMRequest,
    LLMResponse,
    LLMStreamChunk,
} from './types';

export { LLMError } from './types';

// SSE Client
export { createRetryableSSEStream, createSSEStream, parseSSEEvent } from './SSEClient';

// Adapters
export { AnthropicAdapter } from './adapters/AnthropicAdapter';
export { CustomAdapter } from './adapters/CustomAdapter';
export { OpenAIAdapter } from './adapters/OpenAIAdapter';

// Provider Factory
import type { LLMAdapter, LLMProviderConfig } from './types';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { CustomAdapter } from './adapters/CustomAdapter';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';

export type LLMProviderType = 'openai' | 'anthropic' | 'custom';

interface CreateLLMProviderOptions extends LLMProviderConfig {
    /** LLM 제공자 타입 */
    type?: LLMProviderType;
    /** Custom provider의 경우 사용할 엔드포인트 경로 */
    chatEndpoint?: string;
    streamEndpoint?: string;
    additionalHeaders?: Record<string, string>;
}

/**
 * LLM Provider 팩토리 함수
 *
 * 환경변수 또는 옵션을 기반으로 적절한 LLM 어댑터를 생성합니다.
 *
 * @example
 * ```typescript
 * // 환경변수 사용 (VITE_LLM_PROVIDER, VITE_LLM_API_KEY, VITE_LLM_MODEL)
 * const provider = createLLMProvider();
 *
 * // 직접 설정
 * const provider = createLLMProvider({
 *   type: 'openai',
 *   apiKey: 'sk-...',
 *   defaultModel: 'gpt-4o',
 * });
 * ```
 */
export function createLLMProvider(options?: CreateLLMProviderOptions): LLMAdapter {
    const type = options?.type || (import.meta.env.VITE_LLM_PROVIDER as LLMProviderType) || 'openai';
    const apiKey = options?.apiKey || import.meta.env.VITE_LLM_API_KEY || '';
    const defaultModel = options?.defaultModel || import.meta.env.VITE_LLM_MODEL || undefined;
    const baseUrl = options?.baseUrl || import.meta.env.VITE_LLM_BASE_URL || undefined;

    const config: LLMProviderConfig = {
        apiKey,
        defaultModel,
        baseUrl,
    };

    switch (type) {
        case 'openai':
            return new OpenAIAdapter(config);

        case 'anthropic':
            return new AnthropicAdapter(config);

        case 'custom':
            return new CustomAdapter({
                ...config,
                chatEndpoint: options?.chatEndpoint,
                streamEndpoint: options?.streamEndpoint,
                additionalHeaders: options?.additionalHeaders,
            });

        default:
            throw new Error(`Unknown LLM provider type: ${type}`);
    }
}

/**
 * LLM Provider 인스턴스를 생성하고 반환하는 싱글톤 패턴
 * React 외부에서 사용할 때 유용합니다.
 */
let defaultProvider: LLMAdapter | null = null;

export function getLLMProvider(): LLMAdapter {
    if (!defaultProvider) {
        defaultProvider = createLLMProvider();
    }
    return defaultProvider;
}

export function resetLLMProvider(): void {
    defaultProvider = null;
}
