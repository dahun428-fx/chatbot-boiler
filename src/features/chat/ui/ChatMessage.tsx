/**
 * 채팅 메시지 컴포넌트
 *
 * - 마크다운 지원 (MarkdownContent)
 * - 스트리밍 애니메이션 (StreamingText)
 * - 로고 ↔ 로딩 아이콘 토글
 * - MessageBubbleWrapper로 일관된 구조
 */
import { memo } from 'react';

import { useStreamingAnimation } from '@/shared/context/StreamingAnimationContext';
import { cn } from '@/shared/lib/common';
import MarkdownContent from '@/shared/ui/MarkdownContent';
import { StreamingText } from '@/shared/ui/StreamingText';

import type { Message } from '../types/message';

import { DateDivider } from './DateDivider';
import { MessageBubbleWrapper } from './MessageBubbleWrapper';

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

// 로딩 아이콘 컴포넌트 (my-health-ai-coach-web 원본)
const LoadingIcon = () => (
    <div className="mb-[6px]">
        <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin"
            style={{ animation: 'spin 1.8s linear infinite' }}
        >
            <g clipPath="url(#clip0_loading)">
                <path
                    d="M12.6871 6.33326C14.2068 6.33326 15.4387 5.10133 15.4387 3.58167C15.4387 2.06201 14.2068 0.830078 12.6871 0.830078C11.1675 0.830078 9.93555 2.06201 9.93555 3.58167C9.93555 5.10133 11.1675 6.33326 12.6871 6.33326Z"
                    fill="#0F75BD"
                />
                <path
                    d="M5.98401 9.10962C7.50367 9.10962 8.7356 7.8777 8.7356 6.35803C8.7356 4.83837 7.50367 3.60645 5.98401 3.60645C4.46435 3.60645 3.23242 4.83837 3.23242 6.35803C3.23242 7.8777 4.46435 9.10962 5.98401 9.10962Z"
                    fill="#0F75BD"
                />
                <path
                    d="M3.21057 15.8108C4.73023 15.8108 5.96216 14.5789 5.96216 13.0592C5.96216 11.5395 4.73023 10.3076 3.21057 10.3076C1.69091 10.3076 0.458984 11.5395 0.458984 13.0592C0.458984 14.5789 1.69091 15.8108 3.21057 15.8108Z"
                    fill="#0F75BD"
                />
                <path
                    d="M5.98401 22.5129C7.50367 22.5129 8.7356 21.281 8.7356 19.7614C8.7356 18.2417 7.50367 17.0098 5.98401 17.0098C4.46435 17.0098 3.23242 18.2417 3.23242 19.7614C3.23242 21.281 4.46435 22.5129 5.98401 22.5129Z"
                    fill="#66A8D0"
                />
                <path
                    d="M19.3899 7.27482C19.8964 7.27482 20.307 6.86418 20.307 6.35763C20.307 5.85107 19.8964 5.44043 19.3899 5.44043C18.8833 5.44043 18.4727 5.85107 18.4727 6.35763C18.4727 6.86418 18.8833 7.27482 19.3899 7.27482Z"
                    fill="#66A8D0"
                />
                <path
                    d="M22.1649 14.4352C22.9247 14.4352 23.5407 13.8192 23.5407 13.0594C23.5407 12.2996 22.9247 11.6836 22.1649 11.6836C21.405 11.6836 20.7891 12.2996 20.7891 13.0594C20.7891 13.8192 21.405 14.4352 22.1649 14.4352Z"
                    fill="#66A8D0"
                />
                <path
                    d="M19.3891 21.5955C20.4022 21.5955 21.2235 20.7743 21.2235 19.7612C21.2235 18.748 20.4022 17.9268 19.3891 17.9268C18.376 17.9268 17.5547 18.748 17.5547 19.7612C17.5547 20.7743 18.376 21.5955 19.3891 21.5955Z"
                    fill="#CCE3F0"
                />
                <path
                    d="M12.6875 24.8301C13.9539 24.8301 14.9805 23.8035 14.9805 22.5371C14.9805 21.2707 13.9539 20.2441 12.6875 20.2441C11.4211 20.2441 10.3945 21.2707 10.3945 22.5371C10.3945 23.8035 11.4211 24.8301 12.6875 24.8301Z"
                    fill="#CCE3F0"
                />
            </g>
            <defs>
                <clipPath id="clip0_loading">
                    <rect width="24" height="24" fill="white" transform="translate(0 0.830078)" />
                </clipPath>
            </defs>
        </svg>
    </div>
);

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    if (isUser) {
        // 사용자 메시지 - 우측 정렬, 회색 배경
        return (
            <MessageBubbleWrapper id={message.id}>
                <div className="flex w-full justify-end">
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
            </MessageBubbleWrapper>
        );
    }

    // 봇 메시지 - 좌측 정렬, 로고 + 마크다운
    return (
        <MessageBubbleWrapper id={message.id}>
            <div className="flex w-full justify-start">
                <div className="max-w-[80%]">
                    <BotLogo />
                    <div className="pb-3 pt-1 text-gray-800">
                        <MarkdownContent markdownContent={message.content} />
                    </div>
                </div>
            </div>
        </MessageBubbleWrapper>
    );
});

interface ChatMessageListProps {
    messages: Message[];
    streamingMessage?: string;
    isLoading?: boolean;
}

export const ChatMessageList = memo(function ChatMessageList({
    messages,
    streamingMessage,
    isLoading,
}: ChatMessageListProps) {
    const { animationType } = useStreamingAnimation();
    const isStreaming = !!streamingMessage;

    return (
        <div className="flex flex-col gap-4">
            {messages.map((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                return (
                    <div key={message.id || `msg-${index}`}>
                        <DateDivider message={message} prevMessage={prevMessage} />
                        <ChatMessage message={message} />
                    </div>
                );
            })}

            {/* 스트리밍 중인 메시지 - 로딩 아이콘 + fade-in 애니메이션 */}
            {isStreaming && (
                <MessageBubbleWrapper id="streaming">
                    <div className="flex w-full justify-start">
                        <div className="max-w-[80%]">
                            {/* 스트리밍 중에는 로딩 아이콘, 완료 시 로고 */}
                            <LoadingIcon />
                            <div className="pb-3 pt-1 text-gray-800">
                                {animationType === 'fade-in' ? (
                                    <StreamingText
                                        text={streamingMessage}
                                        className="prose max-w-none text-[16px]"
                                    />
                                ) : (
                                    <MarkdownContent markdownContent={streamingMessage} />
                                )}
                            </div>
                        </div>
                    </div>
                </MessageBubbleWrapper>
            )}

            {/* 로딩 인디케이터 (스트리밍 시작 전) */}
            {isLoading && !isStreaming && (
                <MessageBubbleWrapper id="loading">
                    <div className="flex w-full justify-start">
                        <div>
                            <LoadingIcon />
                        </div>
                    </div>
                </MessageBubbleWrapper>
            )}
        </div>
    );
});
