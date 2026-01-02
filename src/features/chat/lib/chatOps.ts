import type { Message } from '@/shared/types/message.type';

/** 메시지 추가: 새 배열 반환 */
export const addChatToList = (list: Message[] = [], msg: Message): Message[] => {
  return [...list, msg];
};

/** 메시지 업데이트: id로 찾은 1개만 교체 */
export const updateChatInList = (
  list: Message[] = [],
  id: string,
  updater: (m: Message) => Message
): Message[] => {
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return list;
  const next = list.slice();
  next[idx] = updater(next[idx]);
  return next;
};

/** 메시지 삭제: id로 1개만 제거 */
export const deleteChatFromList = (list: Message[] = [], id: string): Message[] =>
  list.filter((m) => m.id !== id);
