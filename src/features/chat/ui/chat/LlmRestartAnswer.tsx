import { FC, useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { SenderType } from '@/shared/constants/enum/message.enum';
import { Message } from '@/shared/types/message.type';
import ReplayIcon from '@/shared/ui/icons/ReplayIcon';

import { chatState } from '../../atom/chat';
import { useChatOps } from '../../hooks/use-chat-ops';
import { SendMessageParams } from '../../hooks/use-message-input';

type Props = {
  chat: Message;
  sendMessage: (params: SendMessageParams) => void;
};

const LlmRestartAnswer: FC<Props> = ({ chat, sendMessage }) => {
  const chats = useRecoilValue(chatState);
  const { deleteChat } = useChatOps({ useTransition: true }); // 기본 on

  const onClickHandler = useCallback(() => {
    // 마지막 사용자 메시지 찾기
    let lastUserText = '';
    for (let i = chats.length - 1; i >= 0; i--) {
      if (chats[i].senderType === SenderType.user) {
        lastUserText = chats[i].messageText ?? '';
        break;
      }
    }

    // 현재(에러 안내) 버블만 정확히 제거
    if (chat?.id) {
      deleteChat(chat.id);
    }

    // 마지막 사용자 메시지를 재전송
    if (lastUserText) {
      sendMessage({ msg: lastUserText });
    }
  }, [chats, chat?.id, deleteChat, sendMessage]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <p className="text-[12px] text-gray-300">
        요청하신 내용을 처리하지 못했습니다. 다시 시도해주세요.
      </p>
      <button
        onClick={onClickHandler}
        className="mt-5 flex items-center gap-1 rounded-md bg-original-400 px-3 py-2 text-sm text-white hover:bg-original-500"
      >
        <span>
          <ReplayIcon />
        </span>
        답변 재생성
      </button>
    </div>
  );
};

export default LlmRestartAnswer;
LlmRestartAnswer.displayName = 'LlmRestartAnswer';
