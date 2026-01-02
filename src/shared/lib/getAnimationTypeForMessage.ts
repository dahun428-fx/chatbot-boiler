import { Module } from '@/entities/message-set/types/messageKey';
import { StreamingAnimationType } from '@/shared/context/StreamingAnimationContext';
import { Message } from '@/shared/types/message.type';

/**
 * 메시지 유형에 따라 적절한 애니메이션 타입을 반환합니다.
 */
export const getAnimationTypeForMessage = (
  message: Message
): StreamingAnimationType => {
  const { module } = message.messageKey;

  // LLM 답변 → 페이드인
  if (module === Module.LLM) {
    return 'fade-in';
  }

  // 챗봇 시작 → 타이핑
  if (module === Module.CHATBOT) {
    return 'typing';
  }

  // 기본값: 페이드인
  return 'fade-in';
};
