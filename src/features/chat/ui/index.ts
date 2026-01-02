/**
 * 채팅 UI 컴포넌트 모듈
 *
 * 확장 지점: 새로운 UI 컴포넌트 추가 시 여기에 export
 */

// 레거시 컴포넌트 (하위 호환)
export { ChatMessage, ChatMessageList } from './ChatMessage';

// 입력 컴포넌트
export { ChatInput } from './ChatInput';

// 에러 표시
export { ErrorDisplay } from './ErrorDisplay';

// 날짜 구분선
export { DateDivider } from './DateDivider';

// 메시지 버블 래퍼
export { MessageBubbleWrapper } from './MessageBubbleWrapper';

// 메시지 컴포넌트 (새로운 구조)
export {
    UserMessage,
    AssistantMessage,
    StreamingMessage,
    LoadingIndicator,
    MessageRenderer,
    registerMessageRenderer,
} from './messages';
