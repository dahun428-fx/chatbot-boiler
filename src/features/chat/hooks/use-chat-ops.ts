// use-chat-ops.ts
import { startTransition, useCallback, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { chatState } from '@/features/chat';
import type { Message } from '@/shared/types/message.type';

import { addChatToList, updateChatInList, deleteChatFromList } from '../lib/chatOps';

type Options = { useTransition?: boolean };

export function useChatOps(options?: Options) {
  const useTransition = options?.useTransition ?? true;
  const setChats = useSetRecoilState(chatState);

  const run = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      if (useTransition) startTransition(() => setChats(updater));
      else setChats(updater);
    },
    [setChats, useTransition]
  );

  const addChat = useCallback(
    (msg: Message) => {
      const id = msg.id;
      run((prev) => addChatToList(prev, msg));
      return id;
    },
    [run]
  );

  const updateChat = useCallback(
    (id: string, updater: (m: Message) => Message) => {
      run((prev) => updateChatInList(prev, id, updater));
    },
    [run]
  );

  const deleteChat = useCallback(
    (id: string) => {
      run((prev) => deleteChatFromList(prev, id));
    },
    [run]
  );

  return useMemo(() => ({ addChat, updateChat, deleteChat }), [addChat, updateChat, deleteChat]);
}
