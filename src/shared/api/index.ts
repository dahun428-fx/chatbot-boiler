/**
 * API Module
 *
 * 이 모듈은 두 가지 주요 API 클라이언트를 제공합니다:
 *
 * 1. **HTTP** - 순수 RESTful API 클라이언트 (get, post, put, patch, delete)
 * 2. **LLM** - LLM 연결 클라이언트
 *    - Server: 자체 백엔드 경유 (SSE/API 모드)
 *    - Direct: LLM API 직접 연결 (OpenAI, Claude, Gemini, Custom)
 *
 * @example
 * ```typescript
 * // HTTP 클라이언트 (RESTful API)
 * import { HttpClient } from '@/shared/api/http';
 *
 * const http = new HttpClient({ baseUrl: '/api' });
 * const users = await http.get<User[]>('/users');
 * const user = await http.post<User>('/users', { name: 'John' });
 *
 * // LLM 서버 경유 (SSE 스트리밍)
 * import { LLMServerClient } from '@/shared/api/llm';
 *
 * const server = new LLMServerClient({ baseUrl: '/api/llm' });
 * for await (const chunk of server.stream({ messages })) {
 *   console.log(chunk.content);
 * }
 *
 * // LLM API 직접 연결
 * import { createLLM } from '@/shared/api/llm';
 *
 * const llm = createLLM({ type: 'openai', apiKey: '...' });
 * const response = await llm.chat({ messages });
 * ```
 */

// ============ HTTP (RESTful API) ============
export { createHttpClient, getHttpClient, HttpClient } from './http';
export { HttpError, NetworkError, TimeoutError } from './http';
export type { HttpClientConfig, HttpResponse, RequestOptions } from './http';

// ============ LLM ============
// Server (자체 백엔드 경유)
export { createLLMServerClient, LLMServerClient } from './llm';
export type {
    ChatOptions,
    ChatRequest,
    ChatResponse,
    LLMServerConfig,
    Message,
    MessageRole,
    StreamChunk,
} from './llm';

// Direct (LLM API 직접 연결)
export {
    AnthropicAdapter,
    createLLM,
    CustomAdapter,
    GeminiAdapter,
    LLMError,
    OpenAIAdapter,
} from './llm';
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
} from './llm';
