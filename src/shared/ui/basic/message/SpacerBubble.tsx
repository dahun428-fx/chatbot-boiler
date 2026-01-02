// src/features/chat/ui/SpacerBubble.tsx
import { memo } from 'react';

import MessageBubbleWrapper from './MessageBubbleWrapper';

type Props = { id: string; height: number; className?: string };

const SpacerBubble = ({ id, height, className }: Props) => {
  return (
    <MessageBubbleWrapper id={id} className={className}>
      <div style={{ height }} aria-hidden />
    </MessageBubbleWrapper>
  );
};

export default memo(SpacerBubble);
