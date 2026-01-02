// hooks/useChatController.ts
import { useCallback } from 'react';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

import { fetchChatRoomHistoryRaw } from '@/entities/chat';
import { MessageKeyFactory } from '@/entities/message-set/lib/messageKeyFactory';
import { OptionTextType, SenderType } from '@/shared/constants/enum/message.enum';

import { chatState, currentMessageSetIdState } from '../atom/chat';

type StartChatConfig = {
  chatRoomId: string;
  startInitialMessages: boolean;
};

export interface ChatController {
  startChat: (param: StartChatConfig) => Promise<void>;
  startNewChat: () => Promise<void>;
  fetchChatHistory: (chatRoomId: string) => Promise<void>;
}

/**
 * useChatController 훅
 */
export const useChatController = (): ChatController => {
  const setCurrentMessageSetId = useSetRecoilState(currentMessageSetIdState);
  const setChats = useSetRecoilState(chatState);
  const resetChats = useResetRecoilState(chatState);
  const resetCurrentMessageSetId = useResetRecoilState(currentMessageSetIdState);

  /**
   * 채팅룸 이력 조회
   */
  const fetchChatHistory = useCallback(
    async (chatRoomId: string) => {
      try {
        const data = await fetchChatRoomHistoryRaw(chatRoomId);
        if (data && data?.status === 'SUCCESS' && Array.isArray(data.messages)) {
          const parsedMessages = data.messages.map((chat) => ({
            id: chat.id,
            messageType: chat.messageType,
            messageKey: chat.messageKey,
            messageText: chat.messageText,
            senderType: chat.senderType,
            createTime: chat.createTime,
            answerType: chat.answerType,
            answerText: chat.answerText,
            optionType: chat.optionType,
            optionText: chat.optionText,
          }));

          setChats(parsedMessages);
        }
      } catch (error) {
        console.error('fetchChatHistory 에러:', error);
      }
    },
    [setChats]
  );

  /**
   * 새로운 챗 세트를 설정하는 내부 함수
   */
  const setNewChat = useCallback(() => {
    const startKey = MessageKeyFactory.chatbot.start();
    setCurrentMessageSetId({
      messageSetId: startKey.action,
      messageKey: startKey,
      messageText: undefined,
    });
  }, [setCurrentMessageSetId]);

  /**
   * 챗봇 대화를 시작
   */
  const startChat = useCallback(
    async (param: StartChatConfig) => {
      const { chatRoomId, startInitialMessages } = param;

      resetCurrentMessageSetId();

      if (chatRoomId) {
        await fetchChatHistory(chatRoomId);
      }

      if (startInitialMessages) {
        setNewChat();
      }
    },
    [fetchChatHistory, setNewChat, resetCurrentMessageSetId]
  );

  /**
   * 챗봇 새대화 시작
   */
  const startNewChat = useCallback(async () => {
    resetCurrentMessageSetId();
    resetChats();
    setNewChat();
  }, [resetChats, resetCurrentMessageSetId, setNewChat]);

  return {
    startChat,
    startNewChat,
    fetchChatHistory,
  };
};
