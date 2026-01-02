import { v4 as uuidv4 } from 'uuid';

import { MessageKeyFactory } from '@/entities/message-set/lib/messageKeyFactory';
import { makeBotMessage } from '@/entities/message-set/lib/template/common';
import { AnswerType, MessageType, OptionTextType, SenderType } from '@/shared/constants/enum/message.enum';
import { Message } from '@/shared/types/message.type';

/**
 * 사용자 메시지 생성
 */
export function createUserMessage(text: string): Message {
  return makeBotMessage(MessageKeyFactory.chatbot.text_stream(), {
    id: uuidv4(),
    messageText: text,
    senderType: SenderType.user,
    messageType: MessageType.usertext,
    optionType: OptionTextType.LLMAnswer,
  });
}

/**
 * 스트리밍 메시지 생성
 */
export function createStreamingMessage(): Message {
  return makeBotMessage(MessageKeyFactory.chatbot.streaming(), {
    senderType: SenderType.chatbot,
    messageText: '',
    answerText: '',
  });
}

/**
 * API 응답 변환
 */
export function transformApiResponse(params: {
  response: {
    intentSlots?: { intent?: string };
    suggestQuestions?: string[];
    answer?: string;
  };
  userMessage: string;
  user: unknown;
  hasRecommendQuestion: boolean;
}): { messages: Message[] } {
  const { response, userMessage } = params;

  const answerText = response.answer || '응답을 생성하지 못했습니다.';

  const messages: Message[] = [
    makeBotMessage(MessageKeyFactory.llm.askAgain(), {
      senderType: SenderType.chatbot,
      messageText: userMessage,
      answerText,
      answerType: AnswerType.default,
      messageType: MessageType.usertext,
      optionType: OptionTextType.LLMAnswer,
      suggestQuestions: response.suggestQuestions,
    }),
  ];

  return { messages };
}
