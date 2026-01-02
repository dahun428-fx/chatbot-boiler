/**
 * Chat Feature Module
 *
 * 채팅 기능 관련 모든 모듈을 통합하여 export합니다.
 *
 * 확장 지점:
 * - services: 새로운 ChatService 구현체 추가
 * - hooks: 새로운 훅 추가
 * - ui/messages: 새로운 메시지 렌더러 추가
 * - atom: 새로운 상태 추가
 */

// ============================================
// Types
// ============================================
export type {
    // Message 타입
    Message,
    MessageRole,
    LLMRequestMessage,
    // Error 타입
    ChatError,
    ChatErrorType,
    // 인터페이스
    ChatState,
    ChatActions,
    UseChat,
    LLMConfig,
    // Legacy
    LLMMessage,
    LLMProviderType,
} from './types';

export { createMessage, generateMessageId, createChatError, getErrorDisplayMessage } from './types';

// ============================================
// Services (ChatService 추상화)
// ============================================
export type { ChatService, ChatServiceOptions, ServiceConfig, ServiceType, StreamChunk } from './services';
export { chatService, createChatService, registerService, getServiceConfig, isStreamingMode } from './services';

// ============================================
// Atoms (Recoil State)
// ============================================
export {
    messagesState,
    isLoadingState,
    streamingContentState,
    errorState,
    // Effects
    localStorageEffect,
    isLocalStorageEnabled,
    clearLocalStorage,
    clearAllChatStorage,
} from './atom';

// Legacy alias (하위 호환)
export { streamingContentState as streamingMessageState } from './atom';

// ============================================
// Hooks
// ============================================
export {
    // 통합 훅 (권장)
    useChat,
    // 분리된 훅
    useChatState,
    useChatActions,
    // 유틸리티 훅
    useAutoScroll,
    // Legacy (deprecated)
    useChatController,
} from './hooks';

// ============================================
// Lib (Utilities)
// ============================================
export { getLLMConfig, validateApiKey, getServiceConfig as getConfigFromLib } from './lib';

// ============================================
// UI Components
// ============================================
export {
    // 입력
    ChatInput,
    // 에러 표시
    ErrorDisplay,
    // 메시지 컴포넌트
    UserMessage,
    AssistantMessage,
    StreamingMessage,
    LoadingIndicator,
    MessageRenderer,
    registerMessageRenderer,
    // Legacy (하위 호환)
    ChatMessage,
    ChatMessageList,
} from './ui';
