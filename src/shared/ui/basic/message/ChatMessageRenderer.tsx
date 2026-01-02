// src/features/chat/ui/ChatMessageRenderer.tsx
import { memo, useMemo } from 'react';

import { getBotDomId } from '@/shared/lib/common';
import { Message } from '@/shared/types/message.type';

import MessageBubble from './MessageBubble';

type Props = {
  chat: Message;
  loading?: boolean;
  prevNode?: React.ReactNode | null; // chatbot 상단 노드
};

const ChatMessageRenderer = ({ chat, loading, prevNode }: Props) => {
  const userId = useMemo(() => `${chat.id}`, [chat]);
  const botId = useMemo(() => getBotDomId(chat.chatRoomId, chat.id), [chat]);
  const userMsg = chat.messageText?.trim();
  const botMsg = chat.answerText?.trim();

  return (
    <>
      {userMsg && <MessageBubble id={userId} message={userMsg} isUser />}

      {(botMsg || chat.meta?.spacer) && (
        <MessageBubble
          id={botId}
          message={botMsg ?? ''}
          messageType={chat.messageType}
          messageKey={chat.messageKey}
          loading={loading}
          prevNode={prevNode}
          meta={chat.meta ?? null} // ✅ spacer 전달
        />
      )}
    </>
  );
};

export default memo(ChatMessageRenderer);
