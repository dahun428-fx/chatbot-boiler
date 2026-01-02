/**
 * 사용자 메시지 컴포넌트
 */
import { memo } from 'react';

import { cn } from '@/shared/lib/common';

import type { Message } from '../../types/message';

interface UserMessageProps {
    message: Message;
    className?: string;
}

export const UserMessage = memo(function UserMessage({ message, className }: UserMessageProps) {
    return (
        <div className={cn('flex w-full justify-end', className)}>
            <div
                className={cn(
                    'max-w-[80%] whitespace-pre-wrap break-all',
                    'rounded-bl-2xl rounded-br-[4px] rounded-t-2xl',
                    'bg-gray-50 text-gray-900',
                    'py-3 px-5'
                )}
            >
                <p className="text-[16px] leading-relaxed">{message.content}</p>
            </div>
        </div>
    );
});
