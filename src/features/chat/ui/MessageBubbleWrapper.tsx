/**
 * 메시지 버블 래퍼 컴포넌트
 *
 * 모든 메시지 버블의 공통 래퍼입니다.
 * - 일관된 스크롤 동작
 * - 공통 스타일링
 * - 접근성 지원
 *
 * my-health-ai-coach-web의 MessageBubbleWrapper를 참고하여 구현
 */
import { memo, ReactNode, useRef } from 'react';

import { cn } from '@/shared/lib/common';

interface MessageBubbleWrapperProps {
    /** 메시지 고유 ID */
    id?: string;
    /** 버블 내용 */
    children: ReactNode;
    /** 추가 클래스 */
    className?: string;
}

/**
 * 메시지 버블 공통 래퍼
 *
 * @example
 * ```tsx
 * <MessageBubbleWrapper id="msg-1">
 *   <div>메시지 내용</div>
 * </MessageBubbleWrapper>
 * ```
 */
export const MessageBubbleWrapper = memo(function MessageBubbleWrapper({
    id,
    children,
    className = '',
}: MessageBubbleWrapperProps) {
    const bubbleRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={bubbleRef}
            data-bubble-id={id}
            tabIndex={-1}
            className={cn('message-bubble', className)}
        >
            {children}
        </div>
    );
});

export default MessageBubbleWrapper;
