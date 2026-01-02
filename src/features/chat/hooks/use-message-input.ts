import { useCallback, useImperativeHandle, useRef } from 'react';

import { isEmpty } from '@/shared/lib/isEmpty';

import { createMessageTimestamp, sendChatMessage } from '../lib/message-api';
import {
  createStreamingMessage,
  createUserMessage,
  transformApiResponse,
} from '../lib/message-transformer';
import type { MessageInputHandle, SendMessageParams } from '../types/message-input.types';

// Re-export for backward compatibility
export type { SendMessageParams } from '../types/message-input.types';

import { useChatAnalytics } from './use-chat-analytics';
import { useChatSession } from './use-chat-session';
import { useMessageForm } from './use-message-form';
import { useStreamingState } from './use-streaming-state';

/**
 * 메시지 입력 통합 훅
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useMessageInput = (ref: React.Ref<any>) => {
  const submittingRef = useRef(false);

  // 분리된 훅들 조합
  const form = useMessageForm();
  const session = useChatSession();
  const streaming = useStreamingState();
  const analytics = useChatAnalytics();

  /**
   * 메시지 제출 핵심 로직
   */
  const doSubmit = useCallback(
    async ({ msg: message, dontShowUserMsg, nextMsg, from }: SendMessageParams) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      // 1) 세션 갱신 & 스트리밍 시작
      await session.throttledRefetch();
      streaming.startStreaming();
      form.clearMessage();

      // 2) 사용자 메시지 추가
      const userMsg = createUserMessage(message);
      if (!dontShowUserMsg) {
        streaming.addChat(userMsg);
      }
      streaming.remember(userMsg.id);

      // 3) 로딩 메시지 표시
      const streamingMsg = createStreamingMessage();
      streaming.showThinking(streamingMsg);

      // 4) API 요청
      const controller = session.createController();

      try {
        const response = await sendChatMessage(
          {
            chatRoomId: session.getActiveChatRoomId(),
            msgTimestamp: createMessageTimestamp(),
            msgTypeCd: 'Q',
            msgDc: message,
          },
          controller.signal
        );

        // 5) 로딩 → spacer 변환
        streaming.convertToSpacer();
        streaming.stopStreaming();

        // 6) 응답 변환
        const { messages } = transformApiResponse({
          response,
          userMessage: message,
          user: null,
          hasRecommendQuestion: analytics.getRecommendQuestionFlag(),
        });

        // 7) 메시지 스트리밍 출력
        await streaming.processMessagesWithDelay(messages, {
          slotId: streaming.getSpacerMsgId() ?? undefined,
        });

        // 8) 추가 메시지 처리 (dontShowUserMsg 케이스)
        if (dontShowUserMsg && !isEmpty(nextMsg)) {
          await streaming.processMessagesWithDelay(nextMsg!);
        }

        // 9) spacer 제거
        streaming.clearSpacer();

        // 10) 분석 이벤트
        analytics.trackUserTextInquired(from || 'llm', message, response.intentSlots?.intent);
      } catch (error) {
        console.error(error);
        streaming.deleteLastAddedChat();
        streaming.stopStreaming();
      } finally {
        session.clearController();
        analytics.resetRecommendQuestionFlag();
        submittingRef.current = false;
      }
    },
    [analytics, form, session, streaming]
  );

  /**
   * 폼 제출 핸들러
   */
  const onSubmit = form.handleSubmit(async ({ message }) => {
    await doSubmit({
      msg: message,
      idx: undefined,
      dontShowUserMsg: false,
      nextMsg: undefined,
      from: 'llm',
    });
  });

  /**
   * 즉시 중지 버튼 핸들러
   */
  const onStop = useCallback(() => {
    if (!streaming.isLoading) return;

    // 네트워크 중단
    session.abortRequest();

    // 마지막 메시지 삭제
    streaming.deleteLastAddedChat();
    streaming.stopStreaming();

    // ref 초기화
    streaming.resetRefs();
    analytics.resetRecommendQuestionFlag();
    submittingRef.current = false;
  }, [analytics, session, streaming]);

  /**
   * 외부에서 호출 가능한 메서드 노출
   */
  useImperativeHandle(ref, () => ({
    sendMessage: async (params: SendMessageParams) => {
      const { msg, idx, dontShowUserMsg, nextMsg, from } = params;
      analytics.setRecommendQuestionFlag(true);
      await doSubmit({
        msg,
        idx,
        dontShowUserMsg,
        nextMsg,
        from: from || 'suggested_question_1',
      });
    },
    deleteLastAddedChat: streaming.deleteLastAddedChat,
  } as MessageInputHandle));

  return {
    register: form.register,
    onSubmit,
    isValid: form.isValid,
    isLoading: streaming.isLoading,
    formRef: form.formRef,
    onStop,
    deleteLastAddedChat: streaming.deleteLastAddedChat,
  };
};
