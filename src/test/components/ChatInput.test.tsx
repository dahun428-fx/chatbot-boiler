/**
 * ChatInput Component Tests
 *
 * TDD 테스트: 채팅 입력 컴포넌트
 */
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ChatInput } from '@/components/chat/ChatInput';
import { render } from '@/test/test-utils';

describe('ChatInput', () => {
    const defaultProps = {
        onSend: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('렌더링', () => {
        it('기본 placeholder가 표시되어야 한다', () => {
            render(<ChatInput {...defaultProps} />);

            expect(screen.getByPlaceholderText('무엇이든 물어보세요')).toBeInTheDocument();
        });

        it('커스텀 placeholder가 표시되어야 한다', () => {
            render(<ChatInput {...defaultProps} placeholder="질문을 입력하세요" />);

            expect(screen.getByPlaceholderText('질문을 입력하세요')).toBeInTheDocument();
        });

        it('전송 버튼이 표시되어야 한다', () => {
            render(<ChatInput {...defaultProps} />);

            expect(screen.getByRole('button', { name: '메시지 전송' })).toBeInTheDocument();
        });

        it('안내 문구가 표시되어야 한다', () => {
            render(<ChatInput {...defaultProps} />);

            expect(screen.getByText('인공지능을 활용한 답변입니다')).toBeInTheDocument();
        });
    });

    describe('입력 기능', () => {
        it('텍스트를 입력할 수 있어야 한다', async () => {
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '안녕하세요');

            expect(textarea).toHaveValue('안녕하세요');
        });

        it('입력값이 있으면 테두리 색상이 변경되어야 한다', async () => {
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            const container = textarea.closest('div');

            // 입력 전
            expect(container).toHaveClass('border-gray-200');

            // 입력 후
            await user.type(textarea, '테스트');

            await waitFor(() => {
                expect(container).toHaveClass('border-[#0F75BD]');
            });
        });
    });

    describe('전송 기능', () => {
        it('버튼 클릭으로 메시지를 전송할 수 있어야 한다', async () => {
            const onSend = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput onSend={onSend} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '안녕하세요');

            const sendButton = screen.getByRole('button', { name: '메시지 전송' });
            await user.click(sendButton);

            expect(onSend).toHaveBeenCalledWith('안녕하세요');
            expect(onSend).toHaveBeenCalledTimes(1);
        });

        it('Enter 키로 메시지를 전송할 수 있어야 한다', async () => {
            const onSend = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput onSend={onSend} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '안녕하세요');
            await user.keyboard('{Enter}');

            expect(onSend).toHaveBeenCalledWith('안녕하세요');
        });

        it('Shift+Enter는 줄바꿈이 되어야 한다', async () => {
            const onSend = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput onSend={onSend} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '첫번째 줄{Shift>}{Enter}{/Shift}두번째 줄');

            expect(onSend).not.toHaveBeenCalled();
            expect(textarea).toHaveValue('첫번째 줄\n두번째 줄');
        });

        it('전송 후 입력창이 비워져야 한다', async () => {
            const onSend = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput onSend={onSend} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '테스트 메시지');
            await user.click(screen.getByRole('button', { name: '메시지 전송' }));

            expect(textarea).toHaveValue('');
        });

        it('공백만 있으면 전송되지 않아야 한다', async () => {
            const onSend = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput onSend={onSend} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '   ');
            await user.click(screen.getByRole('button', { name: '메시지 전송' }));

            expect(onSend).not.toHaveBeenCalled();
        });

        it('메시지 앞뒤 공백이 trim 되어야 한다', async () => {
            const onSend = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput onSend={onSend} />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            await user.type(textarea, '  안녕하세요  ');
            await user.click(screen.getByRole('button', { name: '메시지 전송' }));

            expect(onSend).toHaveBeenCalledWith('안녕하세요');
        });
    });

    describe('비활성화 상태', () => {
        it('disabled일 때 입력이 비활성화되어야 한다', () => {
            render(<ChatInput {...defaultProps} disabled />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            expect(textarea).toBeDisabled();
        });

        it('disabled일 때 전송 버튼이 비활성화되어야 한다', async () => {
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} disabled />);

            const sendButton = screen.getByRole('button', { name: '메시지 전송' });
            expect(sendButton).toBeDisabled();

            // 클릭해도 onSend가 호출되지 않아야 함
            await user.click(sendButton);
            expect(defaultProps.onSend).not.toHaveBeenCalled();
        });
    });

    describe('로딩 상태', () => {
        it('isLoading일 때 입력이 비활성화되어야 한다', () => {
            render(<ChatInput {...defaultProps} isLoading />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');
            expect(textarea).toBeDisabled();
        });

        it('isLoading이고 onStop이 있으면 중지 버튼이 표시되어야 한다', () => {
            const onStop = vi.fn();
            render(<ChatInput {...defaultProps} isLoading onStop={onStop} />);

            expect(screen.getByRole('button', { name: '생성 중지' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: '메시지 전송' })).not.toBeInTheDocument();
        });

        it('중지 버튼 클릭 시 onStop이 호출되어야 한다', async () => {
            const onStop = vi.fn();
            const user = userEvent.setup();
            render(<ChatInput {...defaultProps} isLoading onStop={onStop} />);

            const stopButton = screen.getByRole('button', { name: '생성 중지' });
            await user.click(stopButton);

            expect(onStop).toHaveBeenCalledTimes(1);
        });

        it('isLoading일 때 메시지 전송이 되지 않아야 한다', async () => {
            const onSend = vi.fn();
            render(<ChatInput onSend={onSend} isLoading />);

            const textarea = screen.getByPlaceholderText('무엇이든 물어보세요');

            // 값을 직접 설정 (disabled 상태에서 type이 작동하지 않음)
            fireEvent.change(textarea, { target: { value: '테스트' } });

            const sendButton = screen.getByRole('button', { name: '메시지 전송' });
            fireEvent.click(sendButton);

            expect(onSend).not.toHaveBeenCalled();
        });
    });
});
