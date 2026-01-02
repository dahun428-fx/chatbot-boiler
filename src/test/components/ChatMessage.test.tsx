/**
 * ChatMessage Component Tests
 *
 * TDD 테스트: 채팅 메시지 컴포넌트
 */
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ChatMessage, ChatMessageList } from '@/components/chat/ChatMessage';
import type { LLMMessage } from '@/shared/api/llm/direct/types';
import { render } from '@/test/test-utils';

describe('ChatMessage', () => {
    describe('사용자 메시지', () => {
        it('사용자 메시지가 올바르게 렌더링되어야 한다', () => {
            const message: LLMMessage = {
                role: 'user',
                content: '안녕하세요!',
            };

            render(<ChatMessage message={message} />);

            expect(screen.getByText('안녕하세요!')).toBeInTheDocument();
        });

        it('사용자 메시지는 우측 정렬이어야 한다', () => {
            const message: LLMMessage = {
                role: 'user',
                content: '테스트 메시지',
            };

            render(<ChatMessage message={message} />);

            const container = screen.getByText('테스트 메시지').closest('div')?.parentElement;
            expect(container).toHaveClass('justify-end');
        });

        it('사용자 메시지는 회색 배경이어야 한다', () => {
            const message: LLMMessage = {
                role: 'user',
                content: '배경 테스트',
            };

            render(<ChatMessage message={message} />);

            const messageBox = screen.getByText('배경 테스트').closest('div');
            expect(messageBox).toHaveClass('bg-gray-50');
        });
    });

    describe('어시스턴트 메시지', () => {
        it('어시스턴트 메시지가 올바르게 렌더링되어야 한다', () => {
            const message: LLMMessage = {
                role: 'assistant',
                content: '안녕하세요! 무엇을 도와드릴까요?',
            };

            render(<ChatMessage message={message} />);

            expect(screen.getByText('안녕하세요! 무엇을 도와드릴까요?')).toBeInTheDocument();
        });

        it('어시스턴트 메시지는 좌측 정렬이어야 한다', () => {
            const message: LLMMessage = {
                role: 'assistant',
                content: '좌측 정렬 테스트',
            };

            render(<ChatMessage message={message} />);

            const container = screen.getByText('좌측 정렬 테스트').closest('div[class*="max-w"]')?.parentElement;
            expect(container).toHaveClass('justify-start');
        });

        it('어시스턴트 메시지에는 봇 로고가 표시되어야 한다', () => {
            const message: LLMMessage = {
                role: 'assistant',
                content: '로고 테스트',
            };

            render(<ChatMessage message={message} />);

            // SVG 로고 확인
            const svgElement = document.querySelector('svg circle[fill="#66A8D0"]');
            expect(svgElement).toBeInTheDocument();
        });
    });

    describe('멀티라인 메시지', () => {
        it('줄바꿈이 포함된 메시지가 올바르게 렌더링되어야 한다', () => {
            const message: LLMMessage = {
                role: 'user',
                content: '첫번째 줄\n두번째 줄\n세번째 줄',
            };

            render(<ChatMessage message={message} />);

            // p 태그에 whitespace-pre-wrap 클래스가 있음
            const messageElement = screen.getByText(/첫번째 줄/);
            expect(messageElement.textContent).toContain('첫번째 줄');
            expect(messageElement.textContent).toContain('두번째 줄');
        });
    });
});

describe('ChatMessageList', () => {
    describe('메시지 목록 렌더링', () => {
        it('여러 메시지가 올바르게 렌더링되어야 한다', () => {
            const messages: LLMMessage[] = [
                { role: 'user', content: '안녕하세요' },
                { role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요?' },
                { role: 'user', content: '날씨 알려줘' },
                { role: 'assistant', content: '오늘 날씨는 맑습니다.' },
            ];

            render(<ChatMessageList messages={messages} />);

            expect(screen.getByText('안녕하세요')).toBeInTheDocument();
            expect(screen.getByText('안녕하세요! 무엇을 도와드릴까요?')).toBeInTheDocument();
            expect(screen.getByText('날씨 알려줘')).toBeInTheDocument();
            expect(screen.getByText('오늘 날씨는 맑습니다.')).toBeInTheDocument();
        });

        it('빈 메시지 목록이 렌더링되어야 한다', () => {
            render(<ChatMessageList messages={[]} />);

            const container = document.querySelector('.flex.flex-col.gap-4');
            expect(container).toBeInTheDocument();
            expect(container?.children).toHaveLength(0);
        });
    });

    describe('스트리밍 메시지', () => {
        it('스트리밍 메시지가 표시되어야 한다', () => {
            const messages: LLMMessage[] = [
                { role: 'user', content: '질문입니다' },
            ];

            render(
                <ChatMessageList
                    messages={messages}
                    streamingMessage="스트리밍 중인 응답..."
                />
            );

            expect(screen.getByText('스트리밍 중인 응답...')).toBeInTheDocument();
        });

        it('스트리밍 중일 때 로딩 아이콘이 표시되어야 한다', () => {
            render(
                <ChatMessageList
                    messages={[]}
                    streamingMessage="로딩 중..."
                />
            );

            // animate-spin 클래스를 가진 SVG 확인
            const spinningIcon = document.querySelector('.animate-spin');
            expect(spinningIcon).toBeInTheDocument();
        });
    });

    describe('로딩 상태', () => {
        it('isLoading일 때 로딩 인디케이터가 표시되어야 한다', () => {
            render(
                <ChatMessageList
                    messages={[{ role: 'user', content: '질문' }]}
                    isLoading={true}
                />
            );

            // 로딩 아이콘 확인
            const spinningIcon = document.querySelector('.animate-spin');
            expect(spinningIcon).toBeInTheDocument();
        });

        it('스트리밍 메시지가 있으면 로딩 인디케이터가 표시되지 않아야 한다', () => {
            render(
                <ChatMessageList
                    messages={[]}
                    streamingMessage="응답 중..."
                    isLoading={true}
                />
            );

            // 스트리밍 메시지와 함께 로딩 아이콘이 하나만 있어야 함
            const spinningIcons = document.querySelectorAll('.animate-spin');
            expect(spinningIcons).toHaveLength(1);
        });
    });

    describe('메시지 순서', () => {
        it('메시지가 순서대로 렌더링되어야 한다', () => {
            const messages: LLMMessage[] = [
                { role: 'user', content: '첫번째' },
                { role: 'assistant', content: '두번째' },
                { role: 'user', content: '세번째' },
            ];

            render(<ChatMessageList messages={messages} />);

            const allText = document.body.textContent || '';
            const firstIndex = allText.indexOf('첫번째');
            const secondIndex = allText.indexOf('두번째');
            const thirdIndex = allText.indexOf('세번째');

            expect(firstIndex).toBeLessThan(secondIndex);
            expect(secondIndex).toBeLessThan(thirdIndex);
        });
    });
});
