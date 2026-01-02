// src/features/chat/ui/Chat.tsx
import { FC, memo } from 'react';

import { SenderType, AnswerType } from '@/shared/constants/enum/message.enum';
import type { Message } from '@/shared/types/message.type';

import { SendMessageParams } from '../hooks/use-message-input';
import DefaultAnswer from './chat/DefaultAnswer';
import LlmRestartAnswer from './chat/LlmRestartAnswer';

type Props = {
  chat: Message;
  onRecommendClick: (params: SendMessageParams) => void;
  loading?: boolean;
};

/**
 * ChatComponent: 단일 메시지를 렌더링하는 컴포넌트
 */
const ChatComponent: FC<Props> = ({ chat, onRecommendClick, loading }) => {
  const answerType = String(chat.answerType);

  // LLM 에러 발생 시 재시도 UI
  if (answerType === AnswerType.llmError) {
    return <LlmRestartAnswer chat={chat} sendMessage={onRecommendClick} />;
  }

  // 채팅 종료 메시지
  if (answerType === AnswerType.chatFinished) {
    return (
      <p className="my-2 text-center text-label text-gray-400">
        {chat.messageText}
      </p>
    );
  }

  // 에러 메시지
  if (answerType === AnswerType.error) {
    return (
      <div className="my-2 text-center text-red-500">
        {chat.messageText}
      </div>
    );
  }

  // 기본 답변 렌더링
  return <DefaultAnswer chat={chat} loading={loading} />;
};

const Chat = memo(ChatComponent);

export { Chat };
