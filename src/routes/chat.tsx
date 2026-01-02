/**
 * 채팅 페이지
 *
 * LLM 챗봇 UI - 환경변수로 LLM 설정을 관리합니다.
 */
import { createFileRoute } from '@tanstack/react-router';

import {
  ChatInput,
  ChatMessageList,
  ErrorDisplay,
  useChat,
  useAutoScroll,
} from '@/features/chat';

const ChatPage = () => {
  // 통합 훅 사용
  const { messages, isLoading, streamingContent, error, isEmpty, send, abort, retry } = useChat();
  const { containerRef } = useAutoScroll([messages, streamingContent]);

  return (
    <div className="flex h-[100svh] flex-col bg-white">
      {/* 헤더 */}
      <header className="fixed left-0 top-0 z-10 flex h-[3.5rem] w-full items-center justify-center border-b border-gray-100 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">
          AI Chatbot
        </h1>
      </header>

      {/* 채팅 영역 */}
      <div
        ref={containerRef}
        className="mt-[3.5rem] flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-[14px]"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="mx-auto w-full max-w-4xl">
          {isEmpty ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-gray-500">
              <div>
                <p className="text-lg">👋 안녕하세요!</p>
                <p className="mt-2">무엇이든 물어보세요.</p>
              </div>
            </div>
          ) : (
            <>
              <ChatMessageList
                messages={messages}
                streamingMessage={streamingContent}
                isLoading={isLoading}
              />
              {error && (
                <div className="mt-4">
                  <ErrorDisplay error={error} onRetry={retry} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="mx-auto w-full max-w-4xl">
        <ChatInput
          onSend={send}
          onStop={abort}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/chat')({
  component: ChatPage,
});
