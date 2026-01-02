import { useCallback, useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';

import { MessageKeyFactory } from '@/entities/message-set/lib/messageKeyFactory';
import { makeBotMessage } from '@/entities/message-set/lib/template/common';
import { SenderType } from '@/shared/constants/enum/message.enum';
import type { Message } from '@/shared/types/message.type';

import { saveToChat } from '../api/save-user-chat';
import { isShowStopButtonState, isStreamingState } from '../atom/chat';
import { cancellableDelay, ensureAlive } from '../lib/cancellableDelay';
import {
  abortSession,
  deleteSession,
  SessionEntry,
  setSession,
  streamRegistry,
} from '../lib/sessionEntry';

import { useChatOps } from './use-chat-ops';
import { useChatRoomActions } from './use-init-chat-room-id';

const CHAR_DELAY = 22;
const MESSAGE_DELAY = 150;

const tokenizeHtml = (html: string): string[] => html.match(/(<[^>]+>|[^<]+)/g) || [];

type StreamOpts = {
  slotId?: string;
  typingSuffix?: string | null;
  chunkSize?: number;
  delay?: number;
  fullOutput?: boolean;
};

type UseProcessOptions = {
  useTransition?: boolean;
};

/**
 * 메시지 스트리밍 처리를 위한 커스텀 훅
 */
export const useProcessMessagesWithDelay = (options?: UseProcessOptions) => {
  const { addChat, updateChat } = useChatOps({ useTransition: options?.useTransition ?? true });
  const setIsStreaming = useSetRecoilState(isStreamingState);
  const setIsShowStopButton = useSetRecoilState(isShowStopButtonState);
  const { chatRoomId } = useChatRoomActions();

  const chatRoomIdRef = useRef(chatRoomId);
  const startChatTimeRef = useRef<number>(0);
  const accumulatedTextRef = useRef('');

  useEffect(() => {
    chatRoomIdRef.current = chatRoomId;
  }, [chatRoomId]);

  /**
   * 단일 메시지를 스트리밍 방식으로 출력합니다.
   */
  const streamText = useCallback(
    async (message: Message, opts?: StreamOpts) => {
      setIsStreaming(true);
      startChatTimeRef.current = Date.now();
      accumulatedTextRef.current = '';

      // 스트리밍 메시지는 중지 버튼 표시
      if (
        message.messageKey.action === MessageKeyFactory.chatbot.streaming().action &&
        message.messageKey.module === MessageKeyFactory.chatbot.streaming().module
      ) {
        setIsShowStopButton(true);
      } else {
        setIsShowStopButton(false);
      }

      const controller = new AbortController();
      const { signal } = controller;

      let fullOutput = opts?.fullOutput ?? false;
      let suffix: string | null = opts?.typingSuffix ?? '●';
      let chunkSize = Math.max(1, opts?.chunkSize ?? 1);
      let delay = opts?.delay ?? CHAR_DELAY;

      if (fullOutput) {
        suffix = null;
      }

      let targetId: string;

      // 1) 스트리밍 슬롯 준비
      targetId = prepareTargetMessage(message, opts, { addChat, updateChat });

      const cancelKey = message.id as string;
      const entry: SessionEntry = { controller, targetId, messageId: cancelKey };
      setSession(cancelKey, entry);
      setSession(targetId, entry);

      try {
        await executeStreamingLoop({
          message,
          targetId,
          tokens: tokenizeHtml(message.answerText ?? ''),
          signal,
          opts: { chunkSize, delay, fullOutput, suffix },
          updateChat,
          accumulatedTextRef,
        });

        // 정상 완료
        updateChat(targetId, () => ({ ...message, messageText: '' }));
        if (message.messageKey.action !== MessageKeyFactory.chatbot.feedback().action) {
          await saveToChat({ ...message, chatRoomId: chatRoomIdRef.current });
        }
      } catch (e: any) {
        await handleStreamingError({
          error: e,
          message,
          targetId,
          startChatTime: startChatTimeRef.current,
          accumulatedText: accumulatedTextRef.current,
          chatRoomId: chatRoomIdRef.current,
          updateChat,
        });
      } finally {
        deleteSession(cancelKey);
        deleteSession(targetId);
        setIsStreaming(false);
      }
    },
    [addChat, updateChat, setIsStreaming, setIsShowStopButton]
  );

  /**
   * 여러 메시지를 순차적으로 딜레이를 두고 스트리밍합니다.
   */
  const processMessagesWithDelay = useCallback(
    async (messages: Message[], opts?: StreamOpts) => {
      for (const msg of messages) {
        await new Promise((r) => setTimeout(r, MESSAGE_DELAY));
        await streamText(msg, opts);
      }
    },
    [streamText]
  );

  const setLoadingChat = () => {
    addChat(
      makeBotMessage(MessageKeyFactory.chatbot.streaming(), {
        senderType: SenderType.chatbot,
        messageText: '',
      })
    );
  };

  const cancelFor = useCallback((chatId: string) => {
    if (streamRegistry.has(chatId)) {
      abortSession(chatId);
      return;
    }
    for (const [key, entry] of streamRegistry.entries()) {
      if (entry.targetId === chatId || entry.messageId === chatId) {
        abortSession(key);
        return;
      }
    }
  }, []);

  return { processMessagesWithDelay, setLoadingChat, cancelFor };
};

// --- Helper Functions ---

const prepareTargetMessage = (
  message: Message,
  opts: StreamOpts | undefined,
  actions: {
    addChat: (msg: Message) => string;
    updateChat: (id: string, updater: (prev: Message) => Message) => void;
  }
): string => {
  if (opts?.slotId && opts.slotId.trim().length > 0) {
    const targetId = opts.slotId;
    actions.updateChat(targetId, (old) => ({
      ...old,
      messageKey: MessageKeyFactory.chatbot.streaming(),
      senderType: message.senderType ?? SenderType.chatbot,
      messageText: '',
      answerText: '',
      meta: undefined,
    }));
    return targetId;
  } else {
    const streaming = makeBotMessage(MessageKeyFactory.chatbot.streaming(), {
      senderType: message.senderType ?? SenderType.chatbot,
      messageText: '',
    });
    return actions.addChat(streaming);
  }
};

type StreamingLoopParams = {
  message: Message;
  targetId: string;
  tokens: string[];
  signal: AbortSignal;
  opts: {
    chunkSize: number;
    delay: number;
    fullOutput: boolean;
    suffix: string | null;
  };
  updateChat: (id: string, updater: (prev: Message) => Message) => void;
  accumulatedTextRef: React.MutableRefObject<string>;
};

const executeStreamingLoop = async ({
  message,
  targetId,
  tokens,
  signal,
  opts,
  updateChat,
  accumulatedTextRef,
}: StreamingLoopParams) => {
  const { chunkSize, delay, fullOutput, suffix } = opts;
  const addSuffix = (s: string) => (suffix ? s + suffix : s);
  let built = '';

  if (fullOutput) {
    ensureAlive(signal);
    updateChat(targetId, (prev) => ({
      ...prev,
      answerText: addSuffix(message.answerText ?? ''),
    }));
    await cancellableDelay(delay, signal);
    accumulatedTextRef.current = message.answerText ?? '';
  } else {
    for (const token of tokens) {
      ensureAlive(signal);

      if (token.startsWith('<')) {
        built += token;
        updateChat(targetId, (prev) => ({
          ...prev,
          answerText: addSuffix(built),
        }));
        await cancellableDelay(0, signal);
      } else {
        for (let i = 0; i < token.length; i += chunkSize) {
          ensureAlive(signal);
          built += token.slice(i, i + chunkSize);
          updateChat(targetId, (prev) => ({
            ...prev,
            answerText: addSuffix(built),
          }));
          await cancellableDelay(delay, signal);
          accumulatedTextRef.current = built;
        }
      }
    }
  }
};

type ErrorHandlerParams = {
  error: any;
  message: Message;
  targetId: string;
  startChatTime: number;
  accumulatedText: string;
  chatRoomId: string;
  updateChat: (id: string, updater: (prev: Message) => Message) => void;
};

const handleStreamingError = async ({
  error,
  message,
  targetId,
  chatRoomId,
  updateChat,
}: ErrorHandlerParams) => {
  if (error?.name === 'AbortError') {
    updateChat(targetId, (prev) => ({
      ...message,
      messageText: '',
      answerText: (prev.answerText ?? '').replace(/●$/, ''),
      documents: [],
      suggestQuestions: [],
    }));
    if (message.messageKey.action !== MessageKeyFactory.chatbot.feedback().action) {
      await saveToChat({ ...message, chatRoomId });
    }
  } else {
    throw error;
  }
};
