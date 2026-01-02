// src/features/chat/ui/UserBubble.tsx
import { memo, useMemo } from 'react';

import { cn } from '@/shared/lib/common';

import MessageBubbleWrapper from './MessageBubbleWrapper';

type Props = {
  id: string;
  message: string;
  className?: string;
};

const UserBubble = ({ id, message, className = '' }: Props) => {
  const bubbleClasses = useMemo(
    () =>
      cn(
        'whitespace-pre-wrap break-all',
        'rounded-bl-2xl rounded-br-[4px] rounded-t-2xl',
        'bg-gray-50 text-gray-900 ml-auto mr-0 w-fit h-fit max-w-[80%]',
        'py-3',
        'px-5',
        className
      ),
    [className]
  );

  return (
    <MessageBubbleWrapper id={id}>
      <div className={bubbleClasses}>{message}</div>
    </MessageBubbleWrapper>
  );
};

export default memo(UserBubble);
