// src/features/chat/template/createLlmOptions.ts

import { SenderType, AnswerType, OptionTextType } from '@/shared/constants/enum/message.enum';
import { MessageSet } from '@/shared/types/messageSet.type';

import { MessageKeyFactory } from '../messageKeyFactory';

import { makeBotMessage } from './common';

/**
 * LLM 종료 구문 메시지 생성
 */
export function createLlmEndingPhrase(messageText?: string): MessageSet {
  return {
    messages: [
      makeBotMessage(MessageKeyFactory.llm.endingPhrase(), {
        senderType: SenderType.chatbot,
        messageText,
        answerText: '더 알고 싶은 내용을 입력해주세요.',
        answerType: AnswerType.defaultHorizontal,
        optionType: OptionTextType.DefaultAnswerText,
        optionText: {
          options: [
            {
              id: '1',
              label: '종료하기',
              goTo: MessageKeyFactory.chatbot.feedback(),
            },
            {
              id: '2',
              label: '처음으로',
              goTo: MessageKeyFactory.chatbot.start(),
            },
          ],
        },
      }),
    ],
  };
}

/**
 * LLM 재질문 메시지 생성
 */
export function createLlmAskAgain(messageText?: string): MessageSet {
  return {
    messages: [
      makeBotMessage(MessageKeyFactory.llm.askAgain(), {
        senderType: SenderType.chatbot,
        messageText,
        answerText: '궁금한게 있으시면 언제든지 편하게 저에게 물어보세요!',
      }),
    ],
  };
}

export function createLlmError(messageText?: string): MessageSet {
  return {
    messages: [
      makeBotMessage(MessageKeyFactory.llm.error(), {
        senderType: SenderType.chatbot,
        messageText,
        answerText: '요청하신 내용을 처리하지 못했습니다. 다시 시도해주세요.',
        answerType: AnswerType.llmError,
        optionType: OptionTextType.DefaultAnswerText,
        optionText: {
          options: [
            {
              id: '1',
              label: '답변 재생성',
            },
          ],
        },
      }),
    ],
  };
}
