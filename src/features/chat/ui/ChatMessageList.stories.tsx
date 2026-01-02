/**
 * ChatMessageList Storybook Stories
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecoilRoot } from 'recoil';

import { StreamingAnimationProvider } from '@/shared/context/StreamingAnimationContext';
import type { Message } from '../types/message';
import { createMessage } from '../types/message';

import { ChatMessageList } from './ChatMessage';

// 테스트용 메시지 생성 (날짜 조정 가능)
const createTestMessage = (
    role: 'user' | 'assistant',
    content: string,
    minutesAgo = 0
): Message => {
    const msg = createMessage(role, content);
    msg.timestamp = Date.now() - minutesAgo * 60 * 1000;
    return msg;
};

// 다른 날짜의 메시지 생성
const createMessageOnDate = (
    role: 'user' | 'assistant',
    content: string,
    daysAgo: number
): Message => {
    const msg = createMessage(role, content);
    msg.timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    return msg;
};

const meta = {
    title: 'Features/Chat/ChatMessageList',
    component: ChatMessageList,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <RecoilRoot>
                <StreamingAnimationProvider>
                    <div className="max-w-2xl mx-auto h-[500px] overflow-y-auto bg-white p-4 rounded-lg border">
                        <Story />
                    </div>
                </StreamingAnimationProvider>
            </RecoilRoot>
        ),
    ],
} satisfies Meta<typeof ChatMessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 빈 상태
 */
export const Empty: Story = {
    args: {
        messages: [],
    },
};

/**
 * 기본 대화
 */
export const BasicConversation: Story = {
    args: {
        messages: [
            createTestMessage('user', '안녕하세요!', 5),
            createTestMessage('assistant', '안녕하세요! 무엇을 도와드릴까요? 😊', 4),
            createTestMessage('user', '오늘 날씨가 어떤가요?', 3),
            createTestMessage(
                'assistant',
                '오늘 서울의 날씨는 맑고 기온은 약 15도입니다. 외출하시기 좋은 날씨네요!',
                2
            ),
        ],
    },
};

/**
 * 날짜 구분선 포함
 */
export const WithDateDivider: Story = {
    args: {
        messages: [
            createMessageOnDate('user', '어제의 대화입니다.', 1),
            createMessageOnDate('assistant', '네, 어제 나눈 대화예요.', 1),
            createTestMessage('user', '오늘의 대화입니다.', 2),
            createTestMessage('assistant', '맞아요, 오늘 새로운 대화를 시작했네요!', 1),
        ],
    },
};

/**
 * 스트리밍 중
 */
export const Streaming: Story = {
    args: {
        messages: [
            createTestMessage('user', 'AI에 대해 설명해주세요.', 2),
        ],
        streamingMessage: '인공지능(AI)은 인간의 학습 능력, 추론 능력, 지각 능력을 인공적으로 구현한 컴퓨터 시스템입니다...',
        isLoading: true,
    },
};

/**
 * 로딩 중 (스트리밍 시작 전)
 */
export const Loading: Story = {
    args: {
        messages: [
            createTestMessage('user', '질문을 입력했습니다.', 1),
        ],
        isLoading: true,
    },
};

/**
 * 마크다운 대화
 */
export const MarkdownConversation: Story = {
    args: {
        messages: [
            createTestMessage('user', '건강 관리 팁을 알려주세요.', 3),
            createTestMessage(
                'assistant',
                `## 건강 관리 팁 🏃‍♂️

1. **규칙적인 운동**
   - 하루 30분 이상 걷기
   - 주 3회 이상 유산소 운동

2. **균형 잡힌 식단**
   - 채소와 과일 충분히 섭취
   - 단백질 적절히 섭취

3. **충분한 수면**
   - 7-8시간 수면 권장
   - 규칙적인 수면 시간 유지

> "건강은 가장 큰 재산입니다."

더 자세한 정보가 필요하시면 말씀해주세요!`,
                2
            ),
            createTestMessage('user', '운동 루틴 추천해주세요.', 1),
        ],
    },
};

/**
 * 긴 대화
 */
export const LongConversation: Story = {
    args: {
        messages: [
            createTestMessage('user', '첫 번째 질문입니다.', 20),
            createTestMessage('assistant', '첫 번째 답변입니다.', 19),
            createTestMessage('user', '두 번째 질문입니다.', 15),
            createTestMessage('assistant', '두 번째 답변입니다.', 14),
            createTestMessage('user', '세 번째 질문입니다.', 10),
            createTestMessage('assistant', '세 번째 답변입니다.', 9),
            createTestMessage('user', '네 번째 질문입니다.', 5),
            createTestMessage('assistant', '네 번째 답변입니다.', 4),
            createTestMessage('user', '다섯 번째 질문입니다.', 2),
            createTestMessage('assistant', '다섯 번째 답변입니다. 이렇게 긴 대화도 잘 표시됩니다!', 1),
        ],
    },
};
