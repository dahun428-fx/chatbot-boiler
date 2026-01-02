import dayjs from 'dayjs';

import { Message } from '@/shared/types/message.type';

import 'dayjs/locale/ko';

dayjs.locale('ko');

const DateDivider = ({ chat, prevChat }: TProps) => {
  // // 현재 채팅과 이전 채팅의 날짜를 'yyyy년 M월 D일 dddd' 형식으로 변환
  const currentChatDate = dayjs(chat.createTime).format('YYYY년 M월 D일 dddd');
  const prevChatDate = prevChat ? dayjs(prevChat.createTime).format('YYYY년 M월 D일 dddd') : null;
  // ✅ 날짜가 바뀌는 첫 순간에만 표시
  const isNewDate = currentChatDate !== prevChatDate;

  if (!isNewDate) return null;

  return (
    <div className="mb-6 flex h-fit justify-center text-center text-gray-350">
      <p className="bg-gray-100 rounded-full px-2.5 py-1 text-xs font-medium text-gray-500">{currentChatDate}</p>
    </div>
  );
};

export { DateDivider };

type TProps = {
  chat: Message;
  prevChat: Message | null;
};
