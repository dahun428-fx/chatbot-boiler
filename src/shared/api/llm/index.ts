/**
 * LLM Module
 *
 * LLM 연결을 위한 두 가지 방식을 제공합니다:
 *
 * 1. **Server** - 자체 백엔드 서버 경유 (SSE/API 모드)
 * 2. **Direct** - LLM API 직접 연결 (OpenAI, Claude, Gemini, Custom)
 *
 * @example
 * ```typescript
 * // 1. 자체 서버 경유 (SSE 모드)
 * import { LLMServerClient } from '@/shared/api/llm/server';
 *
 * const serverClient = new LLMServerClient({
 *   baseUrl: '/api/llm',
 *   streamEndpoint: '/chat/stream',
 * });
 *
 * for await (const chunk of serverClient.stream({ messages })) {
 *   console.log(chunk.content);
 * }
 *
 * // 2. LLM API 직접 연결
 * import { createLLM } from '@/shared/api/llm/direct';
 *
 * const llm = createLLM({
 *   type: 'openai',
 *   apiKey: 'sk-...',
 * });
 *
 * const response = await llm.chat({ messages });
 * ```
 */

// ============ Server (자체 백엔드 경유) ============
export { createLLMServerClient, LLMServerClient } from './server';
export type {
    ChatOptions,
    ChatRequest,
    ChatResponse,
    LLMServerConfig,
    Message,
    MessageRole,
    StreamChunk,
} from './server';

// ============ Direct (LLM API 직접 연결) ============
export {
    AnthropicAdapter,
    createLLM,
    CustomAdapter,
    GeminiAdapter,
    LLMError,
    OpenAIAdapter,
} from './direct';
export type {
    CreateLLMOptions,
    LLMAdapter,
    LLMErrorType,
    LLMMessage,
    LLMProviderConfig,
    LLMProviderType,
    LLMRequest,
    LLMResponse,
    LLMRole,
    LLMStreamChunk,
} from './direct';
