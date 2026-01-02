// src/features/chat/ui/MessageBubble.tsx
import { memo } from 'react';

import { MessageKeyFactory } from '@/entities/message-set/lib/messageKeyFactory';
import type { MessageKey } from '@/entities/message-set/types/messageKey';
import { MessageType } from '@/shared/constants/enum/message.enum';

import ChatbotBubble from './ChatbotBubble';
import SpacerBubble from './SpacerBubble';
import UserBubble from './UserBubble';

type TProps = {
  message?: string;
  isUser?: boolean;
  loading?: boolean;
  className?: string;
  id: string;
  messageKey?: MessageKey;
  prevNode?: React.ReactNode | null;
  isLastMessage?: boolean;
  messageType?: MessageType;
  meta?: { spacer?: boolean; height?: number } | null; // ✅ 추가
};

const MessageBubble = ({
  message = '',
  isUser = false,
  loading = false,
  className = '',
  id,
  messageKey,
  prevNode,
  messageType,
  meta,
}: TProps) => {
  // ✅ spacer면 고정 높이만 렌더
  if (meta?.spacer)
    return <SpacerBubble id={id} height={meta.height ?? 48} className={className} />;

  const isStreaming =
    messageKey?.action === MessageKeyFactory.chatbot.streaming().action ||
    messageKey?.action === MessageKeyFactory.chatbot.streaming_prefix().action;
  if (isUser) return <UserBubble id={id} message={message} className={className} />;

  const isStreamingPrefix =
    messageKey?.module === MessageKeyFactory.chatbot.streaming_prefix().module &&
    messageKey?.action === MessageKeyFactory.chatbot.streaming_prefix().action;
  // LLM 메시지인지 여부 판단 (messageType이 usertext인 경우 LLM 메시지로 간주)

  const isLLMMessage = MessageType.usertext === messageType;

  return (
    <ChatbotBubble
      id={id}
      isLLMMessage={isLLMMessage}
      message={message}
      className={className}
      loading={loading}
      isStreamingPrefix={isStreamingPrefix}
      isStreaming={isStreaming}
      prevNode={prevNode}
    />
  );
};

export default memo(MessageBubble);
