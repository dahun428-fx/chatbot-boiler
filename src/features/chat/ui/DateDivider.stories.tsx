/**
 * DateDivider Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Message } from '../types/message';
import { createMessage } from '../types/message';

import { DateDivider } from './DateDivider';

// 특정 날짜의 메시지 생성
const createMessageOnDate = (daysAgo: number): Message => {
    const msg = createMessage('user', 'test');
    msg.timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    return msg;
};

const meta = {
    title: 'Features/Chat/DateDivider',
    component: DateDivider,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="w-[400px] p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof DateDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 오늘 날짜 (첫 메시지)
 */
export const Today: Story = {
    args: {
        message: createMessageOnDate(0),
        prevMessage: null,
    },
};

/**
 * 어제 날짜
 */
export const Yesterday: Story = {
    args: {
        message: createMessageOnDate(1),
        prevMessage: null,
    },
};

/**
 * 일주일 전
 */
export const OneWeekAgo: Story = {
    args: {
        message: createMessageOnDate(7),
        prevMessage: null,
    },
};

/**
 * 날짜가 같으면 표시 안함
 */
export const SameDate: Story = {
    args: {
        message: createMessageOnDate(0),
        prevMessage: createMessageOnDate(0),
    },
    parameters: {
        docs: {
            description: {
                story: '이전 메시지와 같은 날짜면 DateDivider가 렌더링되지 않습니다.',
            },
        },
    },
};

/**
 * 날짜가 다르면 표시
 */
export const DifferentDate: Story = {
    args: {
        message: createMessageOnDate(0), // 오늘
        prevMessage: createMessageOnDate(1), // 어제
    },
    parameters: {
        docs: {
            description: {
                story: '이전 메시지와 다른 날짜면 DateDivider가 표시됩니다.',
            },
        },
    },
};
