/**
 * 채팅 입력 컴포넌트
 */
import { memo, useState, useCallback, useRef, useEffect } from 'react';

import { cn } from '@/shared/lib/common';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export const ChatInput = memo(function ChatInput({
    onSend,
    disabled = false,
    placeholder = '메시지를 입력하세요...',
}: ChatInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 자동 높이 조절
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    }, [value]);

    const handleSubmit = useCallback(() => {
        if (!value.trim() || disabled) return;
        onSend(value.trim());
        setValue('');
    }, [value, disabled, onSend]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    return (
        <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-end gap-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        'flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3',
                        'text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
                        'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
                        'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                />
                <button
                    onClick={handleSubmit}
                    disabled={disabled || !value.trim()}
                    className={cn(
                        'rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white',
                        'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'transition-colors duration-200'
                    )}
                >
                    전송
                </button>
            </div>
        </div>
    );
});
