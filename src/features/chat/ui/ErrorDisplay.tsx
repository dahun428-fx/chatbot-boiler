/**
 * 에러 표시 컴포넌트
 *
 * 에러 발생 시 메시지와 재시도 버튼을 표시합니다.
 */
import { memo } from 'react';

import { cn } from '@/shared/lib/common';

import type { ChatError } from '../types/error';
import { getErrorDisplayMessage } from '../types/error';

// 재시도 아이콘
const RetryIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
);

interface ErrorDisplayProps {
    /** 에러 객체 */
    error: ChatError;
    /** 재시도 콜백 */
    onRetry?: () => void;
    /** 추가 CSS 클래스 */
    className?: string;
}

/**
 * 에러 표시 컴포넌트
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   error={chatError}
 *   onRetry={() => retry()}
 * />
 * ```
 */
export const ErrorDisplay = memo(function ErrorDisplay({
    error,
    onRetry,
    className,
}: ErrorDisplayProps) {
    const message = getErrorDisplayMessage(error);

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-lg bg-red-50 p-4',
                className
            )}
        >
            <p className="text-center text-sm text-gray-600">{message}</p>

            {error.retryable && onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className={cn(
                        'flex items-center gap-2 rounded-md px-4 py-2',
                        'bg-blue-500 text-sm text-white',
                        'hover:bg-blue-600 transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    )}
                >
                    <RetryIcon />
                    <span>답변 재생성</span>
                </button>
            )}
        </div>
    );
});
