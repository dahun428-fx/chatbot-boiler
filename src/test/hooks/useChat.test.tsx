/**
 * useChat Hook Tests
 *
 * ChatService 추상화 기반 채팅 훅 테스트
 */
import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useChat, useChatActions, useChatState } from '@/features/chat/hooks';
import * as servicesModule from '@/features/chat/services';
import type { ChatService, StreamChunk } from '@/features/chat/services/types';
import type { Message } from '@/features/chat/types/message';

// ChatService 모킹
const createMockChatService = (): ChatService => ({
    sendMessage: vi.fn(),
});

// chatService 모킹
vi.mock('@/features/chat/services', async () => {
    const actual = await vi.importActual('@/features/chat/services');
    return {
        ...actual,
        chatService: {
            sendMessage: vi.fn(),
        },
        isStreamingMode: vi.fn(() => false),
    };
});

describe('useChat', () => {
    // RecoilRoot Wrapper
    const createWrapper = () => {
        return function Wrapper({ children }: { children: ReactNode }) {
            return <RecoilRoot>{children}</RecoilRoot>;
        };
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('초기 상태', () => {
        it('초기 messages가 빈 배열이어야 한다', () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            expect(result.current.messages).toEqual([]);
        });

        it('초기 isLoading이 false여야 한다', () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('초기 streamingContent가 빈 문자열이어야 한다', () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            expect(result.current.streamingContent).toBe('');
        });

        it('초기 error가 null이어야 한다', () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            expect(result.current.error).toBeNull();
        });

        it('isEmpty가 true여야 한다', () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            expect(result.current.isEmpty).toBe(true);
        });
    });

    describe('send', () => {
        it('메시지를 전송하면 messages에 user 메시지가 추가되어야 한다', async () => {
            const mockSendMessage = vi.fn().mockResolvedValue('AI 응답입니다.');
            vi.mocked(servicesModule.chatService.sendMessage).mockImplementation(mockSendMessage);

            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.send('안녕하세요');
            });

            // user 메시지 + assistant 메시지
            expect(result.current.messages).toHaveLength(2);
            expect(result.current.messages[0].role).toBe('user');
            expect(result.current.messages[0].content).toBe('안녕하세요');
        });

        it('응답을 받으면 assistant 메시지가 추가되어야 한다', async () => {
            const mockResponse = 'AI 응답입니다.';
            vi.mocked(servicesModule.chatService.sendMessage).mockResolvedValue(mockResponse);

            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.send('안녕하세요');
            });

            expect(result.current.messages[1].role).toBe('assistant');
            expect(result.current.messages[1].content).toBe(mockResponse);
        });

        it('빈 메시지는 전송되지 않아야 한다', async () => {
            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.send('');
            });

            expect(result.current.messages).toHaveLength(0);
            expect(servicesModule.chatService.sendMessage).not.toHaveBeenCalled();
        });

        it('전송 중 isLoading이 true여야 한다', async () => {
            let resolvePromise: (value: string) => void;
            const pendingPromise = new Promise<string>((resolve) => {
                resolvePromise = resolve;
            });

            vi.mocked(servicesModule.chatService.sendMessage).mockReturnValue(pendingPromise);

            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            act(() => {
                result.current.send('안녕하세요');
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(true);
            });

            await act(async () => {
                resolvePromise!('응답');
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });

    describe('에러 처리', () => {
        it('에러 발생 시 error 상태가 설정되어야 한다', async () => {
            const testError = new Error('API 오류');
            vi.mocked(servicesModule.chatService.sendMessage).mockRejectedValue(testError);

            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.send('안녕하세요');
            });

            expect(result.current.error).not.toBeNull();
            expect(result.current.error?.message).toBe('API 오류');
        });

        it('AbortError는 에러로 처리되지 않아야 한다', async () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            vi.mocked(servicesModule.chatService.sendMessage).mockRejectedValue(abortError);

            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            await act(async () => {
                await result.current.send('안녕하세요');
            });

            expect(result.current.error).toBeNull();
        });
    });

    describe('clear', () => {
        it('대화를 초기화하면 모든 상태가 리셋되어야 한다', async () => {
            vi.mocked(servicesModule.chatService.sendMessage).mockResolvedValue('응답');

            const { result } = renderHook(() => useChat(), {
                wrapper: createWrapper(),
            });

            // 메시지 추가
            await act(async () => {
                await result.current.send('안녕하세요');
            });

            expect(result.current.messages.length).toBeGreaterThan(0);

            // 초기화
            act(() => {
                result.current.clear();
            });

            expect(result.current.messages).toEqual([]);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });
});

describe('useChatState', () => {
    const createWrapper = () => {
        return function Wrapper({ children }: { children: ReactNode }) {
            return <RecoilRoot>{children}</RecoilRoot>;
        };
    };

    it('읽기 전용 상태를 반환해야 한다', () => {
        const { result } = renderHook(() => useChatState(), {
            wrapper: createWrapper(),
        });

        expect(result.current).toHaveProperty('messages');
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('streamingContent');
        expect(result.current).toHaveProperty('error');
        expect(result.current).toHaveProperty('isEmpty');
    });
});

describe('useChatActions', () => {
    const createWrapper = () => {
        return function Wrapper({ children }: { children: ReactNode }) {
            return <RecoilRoot>{children}</RecoilRoot>;
        };
    };

    it('액션 함수들을 반환해야 한다', () => {
        const { result } = renderHook(() => useChatActions(), {
            wrapper: createWrapper(),
        });

        expect(result.current).toHaveProperty('send');
        expect(result.current).toHaveProperty('abort');
        expect(result.current).toHaveProperty('clear');
        expect(result.current).toHaveProperty('retry');
        expect(typeof result.current.send).toBe('function');
        expect(typeof result.current.abort).toBe('function');
        expect(typeof result.current.clear).toBe('function');
        expect(typeof result.current.retry).toBe('function');
    });
});
