// src/features/chat/ui/ChatList.tsx
import { FC, memo, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { chatState, scrollParentRefState } from '@/features/chat';
import { headerHeightState } from '@/features/layout/atom/layout';
import { SenderType } from '@/shared/constants/enum/message.enum';
import { isEmpty } from '@/shared/lib/isEmpty';

import { ChatListMetaProvider } from '../context/ChatListMetaContext';
import { useIntelligentScroll } from '../hooks/use-intelligent-scroll';
import { SendMessageParams } from '../hooks/use-message-input';

import { ChatListItem } from './ChatListItem';

type Props = {
  onRecommendClick: (params: SendMessageParams) => void;
};

const ChatListComponent: FC<Props> = ({ onRecommendClick }) => {
  const headerHeight = useRecoilValue(headerHeightState);
  const chats = useRecoilValue(chatState);
  const containerRef = useRecoilValue(scrollParentRefState);

  const ordered = useMemo(() => chats ?? [], [chats]);

  const lastChat = ordered.length ? ordered[ordered.length - 1] : null;

  const latestUserMessageId = useMemo(() => {
    for (let i = ordered.length - 1; i >= 0; i--) {
      if (ordered[i].senderType === SenderType.user) {
        return ordered[i].id ?? null;
      }
    }
    return null;
  }, [ordered]);

  const lastMessageId = lastChat?.id ?? null;

  useIntelligentScroll({
    containerRef,
    lastMessageId,
    latestUserMessageId,
    headerOffset: headerHeight,
    minScrollPx: 200,
    behavior: 'smooth',
  });

  if (isEmpty(ordered)) {
    return null;
  }

  return (
    <ChatListMetaProvider value={{ latestUserMessageId, lastMessageId, headerOffset: 20 }}>
      {ordered.map((chat, idx) => {
        const prevChat = ordered[idx - 1] ?? null;
        const isLast = idx === ordered.length - 1;
        return (
          <ChatListItem
            key={chat.id}
            chat={chat}
            prevChat={prevChat}
            onRecommendClick={onRecommendClick}
            isLast={isLast}
          />
        );
      })}
    </ChatListMetaProvider>
  );
};

export const ChatList = memo(ChatListComponent);
