import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from './Button';

const meta = {
    title: 'Shared/UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'white', null],
            description: '버튼 스타일 변형',
        },
        size: {
            control: { type: 'select' },
            options: ['default'],
            description: '버튼 크기',
        },
        disabled: {
            control: { type: 'boolean' },
            description: '비활성화 상태',
        },
        onClick: {
            action: 'clicked',
            description: '클릭 이벤트 핸들러',
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 버튼
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: '기본 버튼',
    },
};

// 화이트 버튼
export const White: Story = {
    args: {
        variant: 'white',
        children: '화이트 버튼',
    },
    parameters: {
        backgrounds: { default: 'dark' },
    },
};

// 비활성화된 버튼
export const Disabled: Story = {
    args: {
        variant: 'primary',
        children: '비활성화 버튼',
        disabled: true,
    },
};

// 커스텀 클래스가 적용된 버튼
export const WithCustomClass: Story = {
    args: {
        variant: 'primary',
        children: '커스텀 버튼',
        className: 'w-[200px] h-[50px]',
    },
};

// 여러 버튼 변형 보기
export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-col gap-4 items-center">
            <Button variant="primary">Primary 버튼</Button>
            <Button variant="white" className="border border-gray-200">
                White 버튼
            </Button>
            <Button variant="primary" disabled>
                비활성화 버튼
            </Button>
        </div>
    ),
};
