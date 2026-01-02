import { useRef, useCallback, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useRecoilState, useSetRecoilState } from 'recoil';

import {
  Header,
  scrollParentRefState,
  chatStartedState,
} from '@/features/chat';
import { useChatController } from '@/features/chat/hooks/use-chat-controller';
import { SendMessageParams } from '@/features/chat/hooks/use-message-input';
import { ChatList } from '@/features/chat/ui/ChatList';
import { headerHeightState, loadingOverlayState } from '@/features/layout/atom/layout';
import { cn } from '@/shared/lib/common';
import { LoadingOverlay } from '@/shared/ui/basic/LoadingOverlay';
import MessageInputNonStreaming, {
  MessageInputHandle,
} from '@/shared/ui/basic/MessageInputNonStreaming';

const ChatPage = () => {
  const { startChat } = useChatController();

  const [loadingOverlay, setLoadingOverlay] = useRecoilState(loadingOverlayState);
  const [chatStarted, setChatStarted] = useRecoilState(chatStartedState);
  const headerHeight = useRecoilState(headerHeightState)[0];
  const setScrollParentRef = useSetRecoilState(scrollParentRefState);

  const chatboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MessageInputHandle>(null);
  const initializedRef = useRef(false);

  // 메시지 전송 핸들러
  const handleRecommendClick = useCallback(
    async ({ msg: question, idx, dontShowUserMsg, nextMsg, from }: SendMessageParams) => {
      inputRef.current?.sendMessage({
        msg: question,
        idx,
        dontShowUserMsg,
        nextMsg,
        from,
      });
    },
    []
  );

  // 스크롤 하단 이동
  const scrollToBottom = useCallback((smooth = false) => {
    if (chatboxRef.current) {
      const el = chatboxRef.current;
      el.scrollTo({
        top: el.scrollHeight - el.clientHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // 초기화 (한 번만)
  useEffect(() => {
    if (initializedRef.current || chatStarted) return;

    setLoadingOverlay(true);

    (async () => {
      await startChat({ chatRoomId: '', startInitialMessages: true });
      setChatStarted(true);
      initializedRef.current = true;
      setLoadingOverlay(false);
    })();
  }, [chatStarted, startChat, setChatStarted, setLoadingOverlay]);

  // 스크롤 ref 저장
  useEffect(() => {
    setScrollParentRef(chatboxRef);
  }, [setScrollParentRef]);

  return (
    <div className="flex h-[100svh] w-full flex-col">
      <Header />

      <LoadingOverlay
        isLoading={loadingOverlay}
        zIndex={5001}
        withBackground={false}
        headerHeight={headerHeight}
      />

      <div
        ref={chatboxRef}
        className={cn(
          'mt-[3.5rem] flex flex-1 flex-col overflow-y-auto bg-white px-6 pb-6 pt-[14px]'
        )}
        style={{ overscrollBehavior: 'contain', overflowAnchor: 'none' }}
      >
        <div>
          <div className={cn('md:mx-auto md:max-w-tablet', 'lg:mx-auto lg:max-w-desktop')}>
            <ChatList onRecommendClick={handleRecommendClick} />
          </div>
        </div>
        <div style={{ height: 1, overflowAnchor: 'auto' }} />
      </div>

      <div>
        <MessageInputNonStreaming ref={inputRef} isOpenAddressSelect={false} />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/chat')({
  component: ChatPage,
});
