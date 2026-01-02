import camelcaseKeys from 'camelcase-keys';

import { SaveUserChatResponse } from '@/entities/chat/api/SaveUserChatResponse';
import { HttpClient } from '@/shared/api/http';
import { removeEmpty } from '@/shared/lib/common';
import { Message } from '@/shared/types/message.type';

const chatApi = new HttpClient({
  baseUrl: '/api',
  headers: {
    'user-token': sessionStorage.getItem('userToken') ?? '',
  },
  onResponse: async (response) => ({
    ...response,
    data: camelcaseKeys(response.data as Record<string, unknown>, { deep: true }),
  }),
});

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

  const res = await chatApi.post<SaveUserChatResponse>('', requestBody, { params: { job: 'saveUserChat' } });

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
