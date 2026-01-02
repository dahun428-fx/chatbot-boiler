/**
 * 메시지 렌더러
 *
 * 메시지 타입에 따라 적절한 컴포넌트를 렌더링합니다.
 *
 * 확장 지점: 새로운 메시지 타입 추가 시 renderers에 등록
 */
import { memo, type FC } from 'react';

import type { Message } from '../../types/message';

import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessageRendererProps {
    message: Message;
    className?: string;
}

/**
 * 메시지 타입별 렌더러 레지스트리
 *
 * 확장 방법:
 * ```ts
 * // 새로운 메시지 타입 추가
 * renderers['image'] = ImageMessage;
 * renderers['code'] = CodeMessage;
 * ```
 */
const renderers: Record<string, FC<MessageRendererProps>> = {
    user: UserMessage,
    assistant: AssistantMessage,
};

/**
 * 기본 메시지 컴포넌트 (알 수 없는 타입용)
 */
const DefaultMessage = memo(function DefaultMessage({ message }: MessageRendererProps) {
    return (
        <div className="flex w-full justify-start">
            <div className="max-w-[80%] rounded-lg bg-gray-100 p-3">
                <p className="text-sm text-gray-600">{message.content}</p>
            </div>
        </div>
    );
});

/**
 * 메시지 렌더러 컴포넌트
 *
 * @example
 * ```tsx
 * <MessageRenderer message={message} />
 * ```
 */
export const MessageRenderer = memo(function MessageRenderer(props: MessageRendererProps) {
    const Renderer = renderers[props.message.role] || DefaultMessage;
    return <Renderer {...props} />;
});

/**
 * 렌더러 등록 함수 (확장용)
 */
export const registerMessageRenderer = (
    type: string,
    renderer: FC<MessageRendererProps>
): void => {
    renderers[type] = renderer;
};
