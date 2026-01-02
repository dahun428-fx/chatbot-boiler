/**
 * ErrorDisplay Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';

import { createChatError } from '../types/error';

import { ErrorDisplay } from './ErrorDisplay';

const meta = {
    title: 'Features/Chat/ErrorDisplay',
    component: ErrorDisplay,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        onRetry: {
            action: 'retry',
            description: '재시도 버튼 클릭 핸들러',
        },
        onDismiss: {
            action: 'dismiss',
            description: '닫기 버튼 클릭 핸들러 (선택)',
        },
    },
    args: {
        onRetry: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-2xl mx-auto p-4">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ErrorDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 네트워크 에러
 */
export const NetworkError: Story = {
    args: {
        error: createChatError(new Error('네트워크 연결에 실패했습니다.')),
    },
};

/**
 * API 에러
 */
export const APIError: Story = {
    args: {
        error: {
            type: 'api_error',
            message: 'API 요청이 실패했습니다. 잠시 후 다시 시도해주세요.',
            timestamp: Date.now(),
        },
    },
};

/**
 * 타임아웃 에러
 */
export const TimeoutError: Story = {
    args: {
        error: {
            type: 'timeout',
            message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
            timestamp: Date.now(),
        },
    },
};

/**
 * 인증 에러
 */
export const AuthError: Story = {
    args: {
        error: {
            type: 'auth_error',
            message: 'API 키가 유효하지 않습니다. 설정을 확인해주세요.',
            timestamp: Date.now(),
        },
    },
};

/**
 * Rate Limit 에러
 */
export const RateLimitError: Story = {
    args: {
        error: {
            type: 'rate_limit',
            message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            timestamp: Date.now(),
        },
    },
};

/**
 * 알 수 없는 에러
 */
export const UnknownError: Story = {
    args: {
        error: {
            type: 'unknown',
            message: '알 수 없는 오류가 발생했습니다.',
            timestamp: Date.now(),
        },
    },
};

/**
 * 닫기 버튼 포함
 */
export const WithDismiss: Story = {
    args: {
        error: createChatError(new Error('에러가 발생했습니다.')),
        onDismiss: fn(),
    },
};
