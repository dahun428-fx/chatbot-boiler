import { v4 as uuidv4 } from 'uuid';

import { Message } from '@/shared/types/message.type';

import { MessageKey } from '../../types/messageKey';

export function fillTemplate(
  template: string,
  data: Record<string, string | number | undefined>,
  fallback: Record<string, string | number> = {}
): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    const value = data[trimmedKey];
    if (value === undefined || value === null || value === '') {
      return fallback[trimmedKey]?.toString() ?? '';
    }
    return value.toString();
  });
}

/**
 * Bot 메시지 생성 헬퍼
 */
export function makeBotMessage(
  messageKey: MessageKey,
  payload: Omit<Message, 'id' | 'chatBotId' | 'messageKey'> & { id?: string }
): Message {
  const { id, ...rest } = payload;
  return {
    ...rest,
    id: id ?? uuidv4(),
    messageKey: messageKey,
  };
}
