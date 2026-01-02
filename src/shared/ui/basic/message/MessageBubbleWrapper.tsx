// src/features/chat/ui/MessageBubbleWrapper.tsx
import { memo, ReactNode, useRef } from 'react';

type Props = {
  id?: string;
  children: ReactNode;
  /** 외부 스크롤 컨테이너가 있으면 주입 */
  scrollParentRef?: React.RefObject<HTMLDivElement>;
  className?: string;

  /** 유저가 위로 스크롤 중일 때 자동 스크롤을 멈출지 여부 */
  pauseAutoScroll?: boolean;

  /** 스크롤 애니메이션 */
  behavior?: ScrollBehavior;

  /** 이미지/폰트 등 늦게 커지는 높이 보정 시간(ms) */
  maxAdjustMs?: number;
};

const MessageBubbleWrapper = ({
  id,
  children,
  scrollParentRef,
  className = '',
  pauseAutoScroll = false,
  behavior = 'smooth',
  maxAdjustMs = 600,
}: Props) => {
  const bubbleRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={bubbleRef} data-bubble-id={id} tabIndex={-1} className={className}>
      {children}
    </div>
  );
};

export default memo(MessageBubbleWrapper);
