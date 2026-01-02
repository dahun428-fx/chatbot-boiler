/**
 * 채팅 메시지 컴포넌트
 */
import { memo } from 'react';

import type { LLMMessage } from '@/shared/api/llm/direct/types';
import { cn } from '@/shared/lib/common';

// 봇 로고 아이콘 컴포넌트 (my-health-ai-coach-web 원본)
const BotLogo = () => (
    <div className="mb-[6px]">
        <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="12.0898" cy="12.2686" r="12" fill="#66A8D0" />
            <path
                d="M14.2636 12.2683C14.9617 12.2683 15.5276 11.7024 15.5276 11.0043C15.5276 10.3062 14.9617 9.74023 14.2636 9.74023C13.5655 9.74023 12.9995 10.3062 12.9995 11.0043C12.9995 11.7024 13.5655 12.2683 14.2636 12.2683Z"
                fill="white"
            />
            <path
                d="M9.91833 12.2683C10.6164 12.2683 11.1824 11.7024 11.1824 11.0043C11.1824 10.3062 10.6164 9.74023 9.91833 9.74023C9.22022 9.74023 8.6543 10.3062 8.6543 11.0043C8.6543 11.7024 9.22022 12.2683 9.91833 12.2683Z"
                fill="white"
            />
        </svg>
    </div>
);

interface ChatMessageProps {
    message: LLMMessage;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    if (isUser) {
        // 사용자 메시지 - 우측 정렬, 회색 배경
        return (
            <div className="flex w-full justify-end">
                <div
                    className={cn(
                        'max-w-[80%] whitespace-pre-wrap break-all',
                        'rounded-bl-2xl rounded-br-[4px] rounded-t-2xl',
                        'bg-gray-50 text-gray-900',
                        'py-3 px-5'
                    )}
                >
                    <p className="text-[16px] leading-relaxed">
                        {message.content}
                    </p>
                </div>
            </div>
        );
    }

    // 봇 메시지 - 좌측 정렬, 로고 + 배경 없음
    return (
        <div className="flex w-full justify-start">
            <div className="max-w-[80%]">
                <BotLogo />
                <div className="pb-3 pt-1 text-gray-800">
                    <p className="whitespace-pre-wrap text-[16px] leading-relaxed">
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );
});

interface ChatMessageListProps {
    messages: LLMMessage[];
    streamingMessage?: string;
    isLoading?: boolean;
}

export const ChatMessageList = memo(function ChatMessageList({
    messages,
    streamingMessage,
    isLoading,
}: ChatMessageListProps) {
    return (
        <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}

            {/* 스트리밍 중인 메시지 */}
            {streamingMessage && (
                <div className="flex w-full justify-start">
                    <div className="max-w-[80%]">
                        <BotLogo />
                        <div className="pb-3 pt-1 text-gray-800">
                            <p className="whitespace-pre-wrap text-[16px] leading-relaxed">
                                {streamingMessage}
                                <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-gray-500" />
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 로딩 인디케이터 */}
            {isLoading && !streamingMessage && (
                <div className="flex w-full justify-start">
                    <div>
                        <BotLogo />
                        <div className="flex gap-1 pb-3 pt-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});;
