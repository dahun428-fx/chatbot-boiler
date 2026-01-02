import { SaveUserChatResponse } from '@/entities/chat/api/SaveUserChatResponse';
import { apiCaller } from '@/shared/api';
import { ApiBody } from '@/shared/api/api.types';
import { removeEmpty } from '@/shared/lib/common';
import { Message } from '@/shared/types/message.type';

/**
 * 사용자가 보낸 채팅 메시지를 서버에 저장하는 API 호출 함수
 */
export const saveToChat = async (message: Omit<Message, 'id' | 'messageKey'>) => {
  const requestBody = removeEmpty({
    chatRoomId: message.chatRoomId,
    senderType: message.senderType,
    messageText: message.messageText,
    messageType: message.messageType ?? 0,
    answerType: message?.answerType ?? undefined,
    answerText: setAnswerText(message),
    optionType: message.optionType,
    optionText: setOptionText(message),
  });

  const res: SaveUserChatResponse = await apiCaller(
    'saveUserChat',
    undefined,
    requestBody as ApiBody<'saveUserChat'>
  );

  return { ...res.data, id: res.data?.id ?? '' };
};

const setAnswerText = (message: Omit<Message, 'id' | 'messageKey'>) => {
  if (message.answerText) {
    return JSON.stringify(message.answerText);
  }
  return undefined;
};

const setOptionText = (message: Omit<Message, 'id' | 'messageKey'>) => {
  if (message.optionText) {
    return JSON.stringify(message.optionText);
  }
  return undefined;
};
