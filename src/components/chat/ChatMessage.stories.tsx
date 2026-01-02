/**
 * ChatMessage Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react';

import type { LLMMessage } from '@/shared/api/llm/direct/types';

import { ChatMessage, ChatMessageList } from './ChatMessage';

// ============ ChatMessage Stories ============

const chatMessageMeta: Meta<typeof ChatMessage> = {
    title: 'Chat/ChatMessage',
    component: ChatMessage,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
};

export default chatMessageMeta;
type Story = StoryObj<typeof chatMessageMeta>;

/**
 * 사용자 메시지
 */
export const UserMessage: Story = {
    args: {
        message: {
            role: 'user',
            content: '안녕하세요! 오늘 날씨가 어때요?',
        },
    },
};

/**
 * AI 응답 메시지
 */
export const AssistantMessage: Story = {
    args: {
        message: {
            role: 'assistant',
            content: '안녕하세요! 오늘 서울의 날씨는 맑고 기온은 약 15도입니다. 외출하기 좋은 날씨네요!',
        },
    },
};

/**
 * 긴 메시지
 */
export const LongMessage: Story = {
    args: {
        message: {
            role: 'assistant',
            content: `물론이죠! React에서 상태 관리를 하는 방법에 대해 설명해 드릴게요.

1. **useState** - 컴포넌트 내부의 간단한 상태 관리
2. **useReducer** - 복잡한 상태 로직 관리
3. **Context API** - 전역 상태 공유
4. **외부 라이브러리** - Redux, Zustand, Recoil 등

각각의 사용 사례와 장단점이 있으니, 프로젝트의 규모와 요구사항에 맞게 선택하시면 됩니다.

더 자세한 설명이 필요하시면 말씀해 주세요!`,
        },
    },
};

/**
 * 코드 블록 포함 메시지
 */
export const CodeMessage: Story = {
    args: {
        message: {
            role: 'assistant',
            content: `다음은 React에서 useState를 사용하는 예제입니다:

\`\`\`tsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(prev => prev + 1);
};
\`\`\`

이렇게 하면 버튼을 클릭할 때마다 count가 증가합니다.`,
        },
    },
};

/**
 * 다크 모드
 */
export const DarkMode: Story = {
    args: {
        message: {
            role: 'assistant',
            content: '다크 모드에서의 AI 응답입니다.',
        },
    },
    decorators: [
        (Story) => (
            <div className="dark bg-gray-900 p-4">
                <Story />
            </div>
        ),
    ],
};

// ============ ChatMessageList Stories ============

const sampleMessages: LLMMessage[] = [
    { role: 'user', content: '안녕하세요!' },
    { role: 'assistant', content: '안녕하세요! 무엇을 도와드릴까요?' },
    { role: 'user', content: 'React에서 상태 관리하는 방법을 알려주세요.' },
    {
        role: 'assistant',
        content:
            'React에서 상태 관리는 useState, useReducer, Context API, 그리고 Redux나 Zustand 같은 외부 라이브러리를 사용할 수 있습니다.',
    },
];

export const MessageList: StoryObj<typeof ChatMessageList> = {
    render: () => <ChatMessageList messages={sampleMessages} />,
};

export const MessageListWithStreaming: StoryObj<typeof ChatMessageList> = {
    render: () => (
        <ChatMessageList
            messages={sampleMessages}
            streamingMessage="현재 응답을 생성하고 있습니다..."
        />
    ),
};

export const MessageListLoading: StoryObj<typeof ChatMessageList> = {
    render: () => <ChatMessageList messages={sampleMessages} isLoading />,
};

export const EmptyMessageList: StoryObj<typeof ChatMessageList> = {
    render: () => <ChatMessageList messages={[]} />,
};
