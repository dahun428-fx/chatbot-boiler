/**
 * useLLMChat Hook Tests
 *
 * TDD 테스트: LLM 채팅 훅
 */
import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useLLMChat } from '@/hooks/useLLMChat';
import * as llmModule from '@/shared/api/llm/direct';
import { MockLLMAdapter, createMockLLM } from '@/test/mocks/MockLLMAdapter';

// createLLM 모킹
vi.mock('@/shared/api/llm/direct', () => ({
    createLLM: vi.fn(),
}));

describe('useLLMChat', () => {
    let mockLLM: MockLLMAdapter;

    // 각 테스트마다 새로운 RecoilRoot를 제공
    const createWrapper = () => {
        return function Wrapper({ children }: { children: ReactNode }) {
            return <RecoilRoot>{children}</RecoilRoot>;
        };
    };

    const defaultOptions = {
        provider: 'openai' as const,
        config: {
            apiKey: 'test-key',
        },
    };

    beforeEach(() => {
        mockLLM = createMockLLM({
            defaultResponse: '안녕하세요! 무엇을 도와드릴까요?',
            delay: 0,
            streamDelay: 0,
        });
        vi.mocked(llmModule.createLLM).mockReturnValue(mockLLM);
    });

    afterEach(() => {
        vi.clearAllMocks();
        mockLLM.reset();
    });

    describe('초기 상태', () => {
        it('초기 messages가 빈 배열이어야 한다', () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            expect(result.current.messages).toEqual([]);
        });

        it('초기 isLoading이 false여야 한다', () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            expect(result.current.isLoading).toBe(false);
        });

        it('초기 streamingMessage가 빈 문자열이어야 한다', () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            expect(result.current.streamingMessage).toBe('');
        });
    });

    describe('sendMessage', () => {
        it('메시지를 전송하고 응답을 받아야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.sendMessage('안녕하세요');
            });

            expect(result.current.messages).toHaveLength(2);
            expect(result.current.messages[0]).toEqual({
                role: 'user',
                content: '안녕하세요',
            });
            expect(result.current.messages[1]).toEqual({
                role: 'assistant',
                content: '안녕하세요! 무엇을 도와드릴까요?',
            });
        });

        it('빈 메시지는 전송되지 않아야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.sendMessage('');
            });

            expect(result.current.messages).toHaveLength(0);
            expect(mockLLM.getCallCount()).toBe(0);
        });

        it('공백만 있는 메시지는 전송되지 않아야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.sendMessage('   ');
            });

            expect(result.current.messages).toHaveLength(0);
        });

        it('시스템 프롬프트가 포함되어야 한다', async () => {
            const { result } = renderHook(
                () =>
                    useLLMChat({
                        ...defaultOptions,
                        systemPrompt: '당신은 친절한 도우미입니다.',
                    }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                await result.current.sendMessage('안녕');
            });

            const lastCall = mockLLM.getLastCall();
            expect(lastCall?.messages[0]).toEqual({
                role: 'system',
                content: '당신은 친절한 도우미입니다.',
            });
        });

        it('에러 발생 시 onError가 호출되어야 한다', async () => {
            const onError = vi.fn();
            mockLLM.setError('network_error');

            const { result } = renderHook(
                () => useLLMChat({ ...defaultOptions, onError }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                await result.current.sendMessage('테스트');
            });

            expect(onError).toHaveBeenCalled();
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('sendMessageStream', () => {
        it('스트리밍으로 메시지를 전송하고 응답을 받아야 한다', async () => {
            mockLLM.setNextResponse('스트리밍 응답입니다');

            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.sendMessageStream('안녕하세요');
            });

            expect(result.current.messages).toHaveLength(2);
            expect(result.current.messages[1].content).toBe('스트리밍 응답입니다');
        });

        it('스트리밍 완료 후 streamingMessage가 초기화되어야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.sendMessageStream('테스트');
            });

            expect(result.current.streamingMessage).toBe('');
        });

        it('빈 메시지는 스트리밍되지 않아야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            await act(async () => {
                await result.current.sendMessageStream('');
            });

            expect(mockLLM.getCallCount()).toBe(0);
        });
    });

    describe('abort', () => {
        it('abort 후 isLoading이 false가 되어야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            act(() => {
                result.current.abort();
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('clearMessages', () => {
        it('모든 메시지를 초기화해야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            // 메시지 추가
            await act(async () => {
                await result.current.sendMessage('안녕하세요');
            });

            expect(result.current.messages).toHaveLength(2);

            // 초기화
            act(() => {
                result.current.clearMessages();
            });

            expect(result.current.messages).toHaveLength(0);
        });

        it('streamingMessage도 초기화해야 한다', () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            act(() => {
                result.current.clearMessages();
            });

            expect(result.current.streamingMessage).toBe('');
        });
    });

    describe('다중 메시지 대화', () => {
        it('대화 컨텍스트가 유지되어야 한다', async () => {
            const { result } = renderHook(() => useLLMChat(defaultOptions), { wrapper: createWrapper() });

            mockLLM.setNextResponse('첫 번째 응답');
            await act(async () => {
                await result.current.sendMessage('첫 번째 질문');
            });

            mockLLM.setNextResponse('두 번째 응답');
            await act(async () => {
                await result.current.sendMessage('두 번째 질문');
            });

            expect(result.current.messages).toHaveLength(4);

            // 마지막 호출에는 이전 대화가 포함되어야 함
            const lastCall = mockLLM.getLastCall();
            expect(lastCall?.messages).toHaveLength(3); // user1, assistant1, user2
        });
    });
});
