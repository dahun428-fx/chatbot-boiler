/**
 * 채팅 메시지 컴포넌트
 */
import { memo } from 'react';

import type { LLMMessage } from '@/shared/api/llm/direct/types';
import { cn } from '@/shared/lib/common';

interface ChatMessageProps {
    message: LLMMessage;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div
            className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
        >
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                )}
            >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                </p>
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
        <div className="flex flex-col gap-4 p-4">
            {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}

            {/* 스트리밍 중인 메시지 */}
            {streamingMessage && (
                <div className="flex w-full justify-start">
                    <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                            {streamingMessage}
                            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-gray-500" />
                        </p>
                    </div>
                </div>
            )}

            {/* 로딩 인디케이터 */}
            {isLoading && !streamingMessage && (
                <div className="flex w-full justify-start">
                    <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                        <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});
