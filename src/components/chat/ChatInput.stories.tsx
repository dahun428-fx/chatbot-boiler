/**
 * ChatInput Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { ChatInput } from './ChatInput';

const meta: Meta<typeof ChatInput> = {
    title: 'Chat/ChatInput',
    component: ChatInput,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        onSend: { action: 'sent' },
        disabled: { control: 'boolean' },
        placeholder: { control: 'text' },
    },
    args: {
        onSend: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 상태
 */
export const Default: Story = {
    args: {
        placeholder: '메시지를 입력하세요...',
    },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
    args: {
        disabled: true,
        placeholder: '메시지를 입력하세요...',
    },
};

/**
 * 커스텀 플레이스홀더
 */
export const CustomPlaceholder: Story = {
    args: {
        placeholder: 'AI에게 질문하세요...',
    },
};

/**
 * 다크 모드 (배경 포함)
 */
export const DarkMode: Story = {
    args: {
        placeholder: '메시지를 입력하세요...',
    },
    decorators: [
        (Story) => (
            <div className="dark bg-gray-900 p-4">
                <Story />
            </div>
        ),
    ],
};
