/**
 * ChatInput Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import { ChatInput } from './ChatInput';

const meta = {
    title: 'Features/Chat/ChatInput',
    component: ChatInput,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        onSend: {
            action: 'send',
            description: '메시지 전송 핸들러',
        },
        onStop: {
            action: 'stop',
            description: '요청 중단 핸들러',
        },
        disabled: {
            control: 'boolean',
            description: '비활성화 상태',
        },
        isLoading: {
            control: 'boolean',
            description: '로딩 상태 (스트리밍 중)',
        },
        placeholder: {
            control: 'text',
            description: '플레이스홀더 텍스트',
        },
    },
    args: {
        onSend: fn(),
        onStop: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl mx-auto">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 상태
 */
export const Default: Story = {
    args: {
        placeholder: '무엇이든 물어보세요',
    },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: '입력이 비활성화되었습니다',
    },
};

/**
 * 로딩 상태 (스트리밍 중)
 * - 전송 버튼이 중지 버튼으로 변경됨
 */
export const Loading: Story = {
    args: {
        isLoading: true,
    },
};

/**
 * 커스텀 플레이스홀더
 */
export const CustomPlaceholder: Story = {
    args: {
        placeholder: '건강 관련 질문을 입력하세요...',
    },
};
