import { cn } from '@/shared/lib/common';
import { Message } from '@/shared/types/message.type';

import { SendMessageParams } from '../hooks/use-message-input';

import { Chat } from './Chat';
import { DateDivider } from './DateDivider';

interface ChatListItemProps {
  chat: Message;
  prevChat: Message | null;
  onRecommendClick: (params: SendMessageParams) => void;
  isLast: boolean;
}

export const ChatListItem = ({
  chat,
  prevChat,
  onRecommendClick,
  isLast,
}: ChatListItemProps) => {
  return (
    <div className={cn('mb-6')}>
      <DateDivider chat={chat} prevChat={prevChat} />
      <div className="mb-2">
        <Chat chat={chat} onRecommendClick={onRecommendClick} />
      </div>
    </div>
  );
};
