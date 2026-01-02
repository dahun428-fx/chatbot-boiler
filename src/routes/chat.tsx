/**
 * 채팅 페이지
 *
 * LLM Provider를 선택하고 채팅할 수 있는 예제 페이지입니다.
 * 실제 사용 시 환경변수 또는 설정에서 API 키를 관리하세요.
 */
import { useRef, useEffect, useCallback, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useRecoilState } from 'recoil';

import { ChatInput, ChatMessageList } from '@/components/chat';
import { createLLM } from '@/shared/api/llm/direct';
import type { LLMAdapter, LLMMessage, LLMProviderType } from '@/shared/api/llm/direct/types';
import { cn } from '@/shared/lib/common';
import { isLoadingState, messagesState, streamingMessageState } from '@/store/chat';

type ChatMode = 'normal' | 'stream';

const PROVIDERS: { value: LLMProviderType; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'custom', label: 'Custom' },
];

const ChatPage = () => {
  const [messages, setMessages] = useRecoilState(messagesState);
  const [isLoading, setIsLoading] = useRecoilState(isLoadingState);
  const [streamingMessage, setStreamingMessage] = useRecoilState(streamingMessageState);

  const [provider, setProvider] = useState<LLMProviderType>('openai');
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState<ChatMode>('stream');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');

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
    if (!apiKey) {
      throw new Error('API 키를 입력해주세요.');
    }
    llmRef.current = createLLM({ type: provider, apiKey });
    return llmRef.current;
  }, [provider, apiKey]);

  // 메시지 전송
  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      if (!apiKey) {
        alert('API 키를 입력해주세요.');
        return;
      }

      const userMessage: LLMMessage = { role: 'user', content };
      const newMessages = [...messages, userMessage];

      setMessages(newMessages);
      setIsLoading(true);
      setStreamingMessage('');

      try {
        const llm = getLLM();
        const requestMessages: LLMMessage[] = systemPrompt
          ? [{ role: 'system', content: systemPrompt }, ...newMessages]
          : newMessages;

        if (mode === 'stream') {
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
        } else {
          // 일반 모드
          const response = await llm.chat({ messages: requestMessages });
          setMessages([...newMessages, { role: 'assistant', content: response.content }]);
        }
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
    [messages, isLoading, apiKey, systemPrompt, mode, getLLM, setMessages, setIsLoading, setStreamingMessage]
  );

  // 중단
  const handleAbort = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingMessage('');
  }, [setIsLoading, setStreamingMessage]);

  // 초기화
  const handleClear = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
  }, [setMessages, setStreamingMessage]);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            LLM Chatbot Boilerplate
          </h1>
          <button
            onClick={handleClear}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            대화 초기화
          </button>
        </div>
      </header>

      {/* 설정 패널 */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4">
          {/* Provider 선택 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Provider:</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as LLMProviderType)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* API 키 입력 */}
          <div className="flex flex-1 items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 모드 선택 */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-300">Mode:</label>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setMode('normal')}
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors',
                  mode === 'normal'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                Normal
              </button>
              <button
                onClick={() => setMode('stream')}
                className={cn(
                  'px-3 py-1.5 text-sm transition-colors',
                  mode === 'stream'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300'
                )}
              >
                Stream
              </button>
            </div>
          </div>
        </div>

        {/* 시스템 프롬프트 */}
        <div className="mx-auto mt-3 max-w-4xl">
          <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
            System Prompt:
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* 채팅 영역 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-4xl">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-gray-500">
              <div>
                <p className="text-lg">👋 안녕하세요!</p>
                <p className="mt-2">Provider와 API 키를 설정한 후 메시지를 입력해주세요.</p>
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
        {isLoading && mode === 'stream' && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleAbort}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              생성 중단
            </button>
          </div>
        )}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/chat')({
  component: ChatPage,
});
