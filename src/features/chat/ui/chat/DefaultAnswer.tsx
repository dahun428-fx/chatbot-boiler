import { FC, memo } from 'react';

import { Message } from '@/shared/types/message.type';
import ChatMessageRenderer from '@/shared/ui/basic/message/ChatMessageRenderer';

type Props = {
  chat: Message;
  loading?: boolean;
};

/**
 * DefaultAnswer - 기본 채팅 답변 UI 컴포넌트
 */
const DefaultAnswer: FC<Props> = ({ chat, loading }) => {
  return <ChatMessageRenderer chat={chat} loading={loading} prevNode={null} />;
};

export default memo(DefaultAnswer);
