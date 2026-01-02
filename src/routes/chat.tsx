/**
 * 채팅 페이지
 *
 * LLM 챗봇 UI - 환경변수로 LLM 설정을 관리합니다.
 */
import { useRef, useEffect, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useRecoilState } from 'recoil';

import { ChatInput, ChatMessageList } from '@/components/chat';
import { createLLM } from '@/shared/api/llm/direct';
import type { LLMAdapter, LLMMessage, LLMProviderType } from '@/shared/api/llm/direct/types';
import { isLoadingState, messagesState, streamingMessageState } from '@/store/chat';

// 환경변수에서 LLM 설정 로드
const LLM_CONFIG = {
  provider: (import.meta.env.VITE_LLM_PROVIDER || 'openai') as LLMProviderType,
  apiKey: import.meta.env.VITE_LLM_API_KEY || '',
  systemPrompt: import.meta.env.VITE_LLM_SYSTEM_PROMPT || 'You are a helpful assistant.',
};

const ChatPage = () => {
  const [messages, setMessages] = useRecoilState(messagesState);
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const [streamingMessage, setStreamingMessage] = useRecoilState(streamingMessageState);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const llmRef = useRef<LLMAdapter | null>(null);

  // 스크롤 하단 이동
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  // LLM 인스턴스 생성
  const getLLM = useCallback((): LLMAdapter => {
    if (!LLM_CONFIG.apiKey) {
      throw new Error('API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
    }
    llmRef.current = createLLM({ type: LLM_CONFIG.provider, apiKey: LLM_CONFIG.apiKey });
    return llmRef.current;
  }, []);

  // 메시지 전송 (스트리밍 모드 고정)
  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      if (!LLM_CONFIG.apiKey) {
        alert('API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
        return;
      }

      const userMessage: LLMMessage = { role: 'user', content };
      const newMessages = [...messages, userMessage];

      setMessages(newMessages);
      setIsLoading(true);
      setStreamingMessage('');

      try {
        const llm = getLLM();
        const requestMessages: LLMMessage[] = LLM_CONFIG.systemPrompt
          ? [{ role: 'system', content: LLM_CONFIG.systemPrompt }, ...newMessages]
          : newMessages;

        // 스트리밍 모드
        abortControllerRef.current = new AbortController();
        let fullContent = '';

        for await (const chunk of llm.stream({
          messages: requestMessages,
          signal: abortControllerRef.current.signal,
        })) {
          fullContent += chunk.content;
          setStreamingMessage(fullContent);
          if (chunk.done) break;
        }

        setMessages([...newMessages, { role: 'assistant', content: fullContent }]);
        setStreamingMessage('');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Chat error:', error);
          alert(`오류 발생: ${(error as Error).message}`);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isLoading, getLLM, setMessages, setIsLoading, setStreamingMessage]
  );

  // 중단
  const handleAbort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingMessage('');
  }, [setIsLoading, setStreamingMessage]);

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
        ref={chatContainerRef}
        className="mt-[3.5rem] flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-[14px]"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="mx-auto w-full max-w-4xl">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-gray-500">
              <div>
                <p className="text-lg">👋 안녕하세요!</p>
                <p className="mt-2">무엇이든 물어보세요.</p>
              </div>
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              streamingMessage={streamingMessage}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="mx-auto w-full max-w-4xl">
        <ChatInput
          onSend={handleSend}
          onStop={handleAbort}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/chat')({
  component: ChatPage,
});
