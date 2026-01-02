// src/lib/messageSets/error.ts

import { AnswerType, SenderType } from '@/shared/constants/enum/message.enum';
import { MessageSet } from '@/shared/types/messageSet.type';

import { MessageKeyFactory } from '../messageKeyFactory';

import { makeBotMessage } from './common';

/**
 * 오류 발생 시 사용자에게 보여줄 메시지 생성
 */
export const createErrorOptions = (messageText?: string): MessageSet => ({
  messages: [
    makeBotMessage(MessageKeyFactory.error.start(), {
      senderType: SenderType.chatbot,
      messageText,
      answerText: '요청하신 내용을 처리하지 못했습니다. 다시 시도해주세요.',
      answerType: AnswerType.error,
    }),
  ],
});
