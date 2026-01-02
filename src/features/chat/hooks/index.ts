/**
 * 채팅 훅 모듈
 *
 * 확장 지점: 새로운 훅 추가 시 여기에 export
 */

// 통합 훅 (권장)
export { useChat } from './use-chat';

// 분리된 훅 (세밀한 제어 필요시)
export { useChatState } from './use-chat-state';
export { useChatActions } from './use-chat-actions';

// 유틸리티 훅
export { useAutoScroll } from './use-auto-scroll';

// 레거시 (하위 호환용, deprecated)
export { useChatController } from './use-chat-controller';
