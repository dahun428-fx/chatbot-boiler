/**
 * 채팅 입력 컴포넌트
 */
import { memo, useState, useCallback, useRef, useEffect } from 'react';

import { cn } from '@/shared/lib/common';

// 전송 아이콘 (my-health-ai-coach-web 원본)
const SendIcon = ({ fill = '#c4c4c4' }: { fill?: string }) => (
    <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="0.613281" y="0.5" width="32" height="32" rx="8" fill={fill} />
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.5148 16.0999C10.2577 15.8427 10.1133 15.4939 10.1133 15.1303C10.1133 14.7666 10.2577 14.4179 10.5148 14.1607L16.0005 8.67497C16.2577 8.41787 16.6065 8.27344 16.9701 8.27344C17.3338 8.27344 17.6825 8.41787 17.9397 8.67497L23.4254 14.1607C23.6753 14.4193 23.8135 14.7658 23.8104 15.1254C23.8072 15.4849 23.663 15.8289 23.4087 16.0832C23.1545 16.3375 22.8105 16.4817 22.4509 16.4848C22.0913 16.4879 21.7449 16.3497 21.4862 16.0999L18.3416 12.9552V23.3589C18.3416 23.7226 18.1971 24.0714 17.9399 24.3286C17.6827 24.5858 17.3339 24.7303 16.9701 24.7303C16.6064 24.7303 16.2576 24.5858 16.0004 24.3286C15.7432 24.0714 15.5987 23.7226 15.5987 23.3589V12.9552L12.454 16.0999C12.1968 16.357 11.8481 16.5014 11.4844 16.5014C11.1208 16.5014 10.772 16.357 10.5148 16.0999V16.0999Z"
            fill="white"
        />
    </svg>
);

// 중지 아이콘 (my-health-ai-coach-web 원본)
const StopIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="currentColor"
    >
        <rect width="32" height="32" rx="8" fill="currentColor" />
        <rect x="9" y="9" width="14" height="14" rx="3" fill="white" />
    </svg>
);

interface ChatInputProps {
    onSend: (message: string) => void;
    onStop?: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    placeholder?: string;
}

const INPUT_MAX_HEIGHT = 34;
const MAX_LINES = 2;

export const ChatInput = memo(function ChatInput({
    onSend,
    onStop,
    disabled = false,
    isLoading = false,
    placeholder = '무엇이든 물어보세요',
}: ChatInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const getMaxHeight = useCallback((el: HTMLTextAreaElement) => {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '22');
        return lineHeight * MAX_LINES;
    }, []);

    const resizeUpToMax = useCallback(
        (el: HTMLTextAreaElement) => {
            const maxH = getMaxHeight(el);
            el.style.height = `${INPUT_MAX_HEIGHT}px`;
            const next = Math.min(el.scrollHeight, maxH);
            el.style.height = `${next}px`;
            el.style.maxHeight = `${maxH}px`;
            el.scrollTop = el.scrollHeight;
        },
        [getMaxHeight]
    );

    useEffect(() => {
        if (textareaRef.current) resizeUpToMax(textareaRef.current);
    }, [resizeUpToMax]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        resizeUpToMax(e.target);
    };

    const handleSubmit = useCallback(() => {
        if (!value.trim() || disabled || isLoading) return;
        onSend(value.trim());
        setValue('');
        // 제출 후 높이 초기화
        if (textareaRef.current) {
            textareaRef.current.style.height = `${INPUT_MAX_HEIGHT}px`;
        }
    }, [value, disabled, isLoading, onSend]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        },
        [handleSubmit]
    );

    const isValid = value.trim().length > 0;

    // 스크롤바 숨김 스타일
    const noScrollbarStyle: React.CSSProperties = {
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    };

    return (
        <div
            className="rounded-t-3xl bg-white pb-[21px]"
            style={{
                boxShadow: '0 -4px 14px rgba(0,0,0,0.04), 4px 0 14px rgba(0,0,0,0.04)',
            }}
        >
            <div className="box-border flex max-h-[150px] w-full flex-col justify-end px-4 pt-4">
                {/* 입력 영역 */}
                <div
                    className={cn(
                        'relative flex min-h-[44px] flex-1 items-end gap-2 rounded-[12px] border bg-white px-4 py-2',
                        isValid && !disabled && !isLoading ? 'border-[#0F75BD]' : 'border-gray-200'
                    )}
                >
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isLoading}
                        rows={1}
                        autoComplete="off"
                        style={noScrollbarStyle}
                        className={cn(
                            'h-auto w-full resize-none bg-white text-base font-medium leading-[22px] text-black',
                            'placeholder:text-gray-300 focus:outline-none',
                            'max-h-[44px] overflow-y-auto pt-[5px]',
                            'disabled:cursor-not-allowed disabled:opacity-50'
                        )}
                    />
                    {isLoading && onStop ? (
                        <button
                            type="button"
                            onClick={onStop}
                            className="self-end pl-[10px] text-gray-400 hover:text-[#0F75BD]"
                            aria-label="생성 중지"
                        >
                            <StopIcon />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={disabled || !isValid || isLoading}
                            className="self-end pl-[10px] disabled:cursor-not-allowed"
                            aria-label="메시지 전송"
                        >
                            <SendIcon fill={isValid && !disabled && !isLoading ? '#0F75BD' : '#c4c4c4'} />
                        </button>
                    )}
                </div>

                {/* 안내 문구 */}
                <p className="mt-4 w-full text-center text-[10.5px] font-medium text-gray-500">
                    인공지능을 활용한 답변입니다
                </p>
            </div>
        </div>
    );
});
