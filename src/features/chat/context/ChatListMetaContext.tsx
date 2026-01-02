// src/features/chat/context/ChatListMetaContext.tsx
import { createContext, useContext } from 'react';

type ChatListMeta = {
  latestUserMessageId: string | null;
  lastMessageId: string | null; // 원하면 isLastMessage도 없앨 수 있음
  headerOffset: number; // 컨테이너 상단 여백 (고정 헤더 높이)
};

// eslint-disable-next-line react-refresh/only-export-components
const ChatListMetaContext = createContext<ChatListMeta | null>(null);

export const ChatListMetaProvider = ({
  value,
  children,
}: {
  value: ChatListMeta;
  children: React.ReactNode;
}) => <ChatListMetaContext.Provider value={value}>{children}</ChatListMetaContext.Provider>;
// eslint-disable-next-line react-refresh/only-export-components
export const useChatListMeta = () => {
  const ctx = useContext(ChatListMetaContext);
  if (!ctx) throw new Error('useChatListMeta must be used within ChatListMetaProvider');
  return ctx;
};
