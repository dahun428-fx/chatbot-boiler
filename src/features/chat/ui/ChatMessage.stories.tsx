/**
 * ChatMessage Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecoilRoot } from 'recoil';

import { StreamingAnimationProvider } from '@/shared/context/StreamingAnimationContext';
import type { Message } from '../types/message';
import { createMessage } from '../types/message';

import { ChatMessage, ChatMessageList } from './ChatMessage';

// 테스트용 메시지 생성
const createTestMessage = (role: 'user' | 'assistant', content: string, daysAgo = 0): Message => {
    const msg = createMessage(role, content);
    // 날짜 조정 (테스트용)
    msg.timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    return msg;
};

const meta = {
    title: 'Features/Chat/ChatMessage',
    component: ChatMessage,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <RecoilRoot>
                <StreamingAnimationProvider>
                    <div className="max-w-2xl mx-auto p-4">
                        <Story />
                    </div>
                </StreamingAnimationProvider>
            </RecoilRoot>
        ),
    ],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 사용자 메시지
 */
export const UserMessage: Story = {
    args: {
        message: createTestMessage('user', '안녕하세요! 오늘 날씨가 어떤가요?'),
    },
};

/**
 * AI 응답 메시지
 */
export const AssistantMessage: Story = {
    args: {
        message: createTestMessage(
            'assistant',
            '안녕하세요! 오늘 서울의 날씨는 맑고 기온은 약 15도입니다. 외출하시기 좋은 날씨네요! 😊'
        ),
    },
};

/**
 * 마크다운 포함 메시지
 */
export const MarkdownMessage: Story = {
    args: {
        message: createTestMessage(
            'assistant',
            `# 건강 관리 팁

다음은 일상에서 실천할 수 있는 건강 관리 방법입니다:

1. **규칙적인 운동**: 하루 30분 이상 걷기
2. **충분한 수면**: 7-8시간 수면 권장
3. **균형 잡힌 식단**: 채소와 과일 섭취

> 건강은 가장 소중한 자산입니다.

더 자세한 정보가 필요하시면 말씀해주세요!`
        ),
    },
};

/**
 * 코드 블록 포함 메시지
 */
export const CodeBlockMessage: Story = {
    args: {
        message: createTestMessage(
            'assistant',
            `다음은 간단한 JavaScript 예제입니다:

\`\`\`javascript
function greet(name) {
    return \`안녕하세요, \${name}님!\`;
}

console.log(greet('사용자'));
\`\`\`

인라인 코드는 \`console.log()\` 처럼 사용합니다.`
        ),
    },
};

/**
 * 긴 메시지
 */
export const LongMessage: Story = {
    args: {
        message: createTestMessage(
            'assistant',
            `이것은 매우 긴 응답 메시지입니다. 채팅 버블이 긴 텍스트를 어떻게 처리하는지 확인하기 위한 테스트입니다.

실제 LLM 응답은 종종 여러 문단으로 구성되어 있으며, 다양한 정보를 포함할 수 있습니다. 이러한 긴 응답도 사용자가 편하게 읽을 수 있도록 적절한 줄바꿈과 여백이 적용되어야 합니다.

마크다운 형식을 지원하므로 **굵은 글씨**나 *기울임체*도 사용할 수 있습니다. 또한 리스트도 지원합니다:

- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

이렇게 다양한 형식의 콘텐츠가 올바르게 렌더링되어야 합니다.`
        ),
    },
};
