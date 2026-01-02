/**
 * Chat Flow Integration Tests
 *
 * TDD 테스트: 채팅 플로우 통합 테스트
 * 실제 사용자 시나리오를 테스트합니다.
 */
import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ChatInput } from '@/components/chat/ChatInput';
import { ChatMessageList } from '@/components/chat/ChatMessage';
import * as llmModule from '@/shared/api/llm/direct';
import type { LLMMessage } from '@/shared/api/llm/direct/types';
import { MockLLMAdapter, createMockLLM } from '@/test/mocks/MockLLMAdapter';
import { render } from '@/test/test-utils';

// LLM 모듈 모킹
vi.mock('@/shared/api/llm/direct', () => ({
    createLLM: vi.fn(),
}));

/**
 * 간단한 채팅 UI 통합 컴포넌트
 * 실제 ChatPage와 유사한 구조로 테스트
 */
interface SimpleChatUIProps {
    mockLLM: MockLLMAdapter;
}

const SimpleChatUI = ({ mockLLM }: SimpleChatUIProps) => {
    const [messages, setMessages] = useState<LLMMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');

    const handleSend = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: LLMMessage = { role: 'user', content };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await mockLLM.chat({ messages: newMessages });
            const assistantMessage: LLMMessage = {
                role: 'assistant',
                content: response.content,
            };
            setMessages([...newMessages, assistantMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = () => {
        setIsLoading(false);
        setStreamingMessage('');
    };

    return (
        <div data-testid="chat-container">
            <ChatMessageList
                messages={messages}
                streamingMessage={streamingMessage}
                isLoading={isLoading}
            />
            <ChatInput
                onSend={handleSend}
                onStop={handleStop}
                isLoading={isLoading}
            />
        </div>
    );
}

describe('채팅 플로우 통합 테스트', () => {
    let mockLLM: MockLLMAdapter;

    beforeEach(() => {
        mockLLM = createMockLLM({
            defaultResponse: '안녕하세요! 무엇을 도와드릴까요?',
            delay: 0,
        });
        vi.mocked(llmModule.createLLM).mockReturnValue(mockLLM);
    });

    afterEach(() => {
        vi.clearAllMocks();
        mockLLM.reset();
    });

    describe('기본 대화 시나리오', () => {
        it('사용자가 메시지를 입력하고 응답을 받을 수 있어야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            // 메시지 입력
            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '안녕하세요');

            // 전송 버튼 클릭
            const sendButton = screen.getByRole('button', { name: '메시지 전송' });
            await user.click(sendButton);

            // 사용자 메시지 확인
            await waitFor(() => {
                expect(screen.getByText('안녕하세요')).toBeInTheDocument();
            });

            // 봇 응답 확인
            await waitFor(() => {
                expect(screen.getByText('안녕하세요! 무엇을 도와드릴까요?')).toBeInTheDocument();
            });
        });

        it('Enter 키로 메시지를 전송할 수 있어야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '테스트 메시지');
            await user.keyboard('{Enter}');

            await waitFor(() => {
                expect(screen.getByText('테스트 메시지')).toBeInTheDocument();
            });
        });
    });

    describe('다중 대화 시나리오', () => {
        it('여러 번의 대화가 순차적으로 처리되어야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            const sendButton = screen.getByRole('button', { name: '메시지 전송' });

            // 첫 번째 대화
            mockLLM.setNextResponse('첫 번째 응답입니다.');
            await user.type(textarea, '첫 번째 질문');
            await user.click(sendButton);

            await waitFor(() => {
                expect(screen.getByText('첫 번째 응답입니다.')).toBeInTheDocument();
            });

            // 두 번째 대화
            mockLLM.setNextResponse('두 번째 응답입니다.');
            await user.type(textarea, '두 번째 질문');
            await user.click(sendButton);

            await waitFor(() => {
                expect(screen.getByText('두 번째 응답입니다.')).toBeInTheDocument();
            });

            // 모든 메시지가 화면에 표시되어야 함
            expect(screen.getByText('첫 번째 질문')).toBeInTheDocument();
            expect(screen.getByText('첫 번째 응답입니다.')).toBeInTheDocument();
            expect(screen.getByText('두 번째 질문')).toBeInTheDocument();
            expect(screen.getByText('두 번째 응답입니다.')).toBeInTheDocument();
        });

        it('대화 히스토리가 올바른 순서로 표시되어야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            const sendButton = screen.getByRole('button', { name: '메시지 전송' });

            mockLLM.setNextResponse('응답 A');
            await user.type(textarea, '질문 A');
            await user.click(sendButton);
            await waitFor(() => {
                expect(screen.getByText('응답 A')).toBeInTheDocument();
            });

            mockLLM.setNextResponse('응답 B');
            await user.type(textarea, '질문 B');
            await user.click(sendButton);
            await waitFor(() => {
                expect(screen.getByText('응답 B')).toBeInTheDocument();
            });

            // 순서 확인
            const textContent = document.body.textContent || '';
            const indexA = textContent.indexOf('질문 A');
            const indexRespA = textContent.indexOf('응답 A');
            const indexB = textContent.indexOf('질문 B');
            const indexRespB = textContent.indexOf('응답 B');

            expect(indexA).toBeLessThan(indexRespA);
            expect(indexRespA).toBeLessThan(indexB);
            expect(indexB).toBeLessThan(indexRespB);
        });
    });

    describe('입력 유효성 검증', () => {
        it('공백만 입력하면 전송되지 않아야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            const sendButton = screen.getByRole('button', { name: '메시지 전송' });

            await user.type(textarea, '   ');
            await user.click(sendButton);

            // LLM이 호출되지 않아야 함
            expect(mockLLM.getCallCount()).toBe(0);
        });

        it('전송 후 입력창이 비워져야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '테스트 메시지');
            await user.click(screen.getByRole('button', { name: '메시지 전송' }));

            await waitFor(() => {
                expect(textarea).toHaveValue('');
            });
        });
    });

    describe('UI 상태 관리', () => {
        it('사용자 메시지는 우측에 표시되어야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '테스트');
            await user.click(screen.getByRole('button', { name: '메시지 전송' }));

            await waitFor(() => {
                const userMessage = screen.getByText('테스트');
                const container = userMessage.closest('div')?.parentElement;
                expect(container).toHaveClass('justify-end');
            });
        });

        it('봇 응답은 좌측에 표시되어야 한다', async () => {
            const user = userEvent.setup();
            render(<SimpleChatUI mockLLM={mockLLM} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '테스트');
            await user.click(screen.getByRole('button', { name: '메시지 전송' }));

            await waitFor(() => {
                const botMessage = screen.getByText('안녕하세요! 무엇을 도와드릴까요?');
                const container = botMessage.closest('div[class*="max-w"]')?.parentElement;
                expect(container).toHaveClass('justify-start');
            });
        });
    });
});

describe('ChatInput + ChatMessageList 독립 통합 테스트', () => {
    describe('컴포넌트 간 인터랙션', () => {
        it('ChatInput과 ChatMessageList가 함께 작동해야 한다', () => {
            const messages: LLMMessage[] = [
                { role: 'user', content: '안녕' },
                { role: 'assistant', content: '반가워요!' },
            ];
            const onSend = vi.fn();

            render(
                <div>
                    <ChatMessageList messages={messages} />
                    <ChatInput onSend={onSend} />
                </div>
            );

            // 메시지가 표시됨
            expect(screen.getByText('안녕')).toBeInTheDocument();
            expect(screen.getByText('반가워요!')).toBeInTheDocument();

            // 입력 필드가 작동함
            expect(screen.getByPlaceholderText('무엇이든 물어보세요')).toBeInTheDocument();
        });

        it('로딩 상태에서 중지 버튼이 표시되어야 한다', () => {
            const messages: LLMMessage[] = [{ role: 'user', content: '질문' }];
            const onSend = vi.fn();
            const onStop = vi.fn();

            render(
                <div>
                    <ChatMessageList messages={messages} isLoading />
                    <ChatInput onSend={onSend} onStop={onStop} isLoading />
                </div>
            );

            // 로딩 인디케이터
            expect(document.querySelector('.animate-spin')).toBeInTheDocument();

            // 중지 버튼
            expect(screen.getByRole('button', { name: '생성 중지' })).toBeInTheDocument();
        });

        it('스트리밍 중 메시지가 실시간으로 표시되어야 한다', () => {
            const messages: LLMMessage[] = [{ role: 'user', content: '질문입니다' }];
            const streamingMessage = '현재 생성 중인 응답...';

            render(
                <ChatMessageList
                    messages={messages}
                    streamingMessage={streamingMessage}
                    isLoading
                />
            );

            expect(screen.getByText('질문입니다')).toBeInTheDocument();
            expect(screen.getByText('현재 생성 중인 응답...')).toBeInTheDocument();
        });
    });
});

describe('에러 시나리오', () => {
    let mockLLM: MockLLMAdapter;

    beforeEach(() => {
        mockLLM = createMockLLM();
        vi.mocked(llmModule.createLLM).mockReturnValue(mockLLM);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('에러 발생 시에도 UI가 안정적으로 유지되어야 한다', async () => {
        // 에러 발생하는 SimpleChatUI 테스트
        const ErrorHandlingChat = () => {
            const [messages, setMessages] = useState<LLMMessage[]>([]);
            const [isLoading, setIsLoading] = useState(false);
            const [error, setError] = useState<string | null>(null);

            const handleSend = async (content: string) => {
                if (!content.trim() || isLoading) return;

                const userMessage: LLMMessage = { role: 'user', content };
                setMessages((prev: LLMMessage[]) => [...prev, userMessage]);
                setIsLoading(true);
                setError(null);

                try {
                    await mockLLM.chat({ messages: [userMessage] });
                } catch (err) {
                    setError((err as Error).message);
                } finally {
                    setIsLoading(false);
                }
            };

            return (
                <div>
                    <ChatMessageList messages={messages} isLoading={isLoading} />
                    {error && <div data-testid="error-message">{error}</div>}
                    <ChatInput onSend={handleSend} isLoading={isLoading} />
                </div>
            );
        };

        mockLLM.setError('network_error');
        const user = userEvent.setup();

        render(<ErrorHandlingChat />);

        const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
        await user.type(textarea, '테스트');
        await user.click(screen.getByRole('button', { name: '메시지 전송' }));

        // 에러 메시지 표시
        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
        });

        // UI는 여전히 작동해야 함
        expect(screen.getByPlaceholderText('무엇이든 물어보세요')).toBeInTheDocument();
        expect(screen.getByText('테스트')).toBeInTheDocument(); // 사용자 메시지는 유지됨
    });
});
