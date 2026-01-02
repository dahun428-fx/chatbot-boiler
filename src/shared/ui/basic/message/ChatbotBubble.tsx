// src/features/chat/ui/ChatbotBubble.tsx
import { memo, ReactNode, useMemo } from 'react';

import { useStreamingAnimation } from '@/shared/context/StreamingAnimationContext';
import { cn } from '@/shared/lib/common';

import LoadingIcon from '../../icons/LoadingIcon';
import LogoIcon from '../../icons/LogoIcon';
import MarkdownContent from '../../MarkdownContent';
import { StreamingText } from '../../StreamingText';

import MessageBubbleWrapper from './MessageBubbleWrapper';

type Props = {
  id: string;
  message: string;
  loading?: boolean;
  isStreaming?: boolean;
  className?: string;
  prevNode?: ReactNode | null;
  isLLMMessage?: boolean;
  isStreamingPrefix?: boolean;
};

const ChatbotBubble = ({
  id,
  message,
  loading = false,
  isStreaming = false,
  className = '',
  prevNode,
  isLLMMessage = false,
  isStreamingPrefix = false,
}: Props) => {
  const { animationType } = useStreamingAnimation();
  const bubbleClasses = useMemo(
    () => cn('break-all', 'text-gray-800 text-black', 'pb-3 pt-1', className),
    [className]
  );

  return (
    <MessageBubbleWrapper id={id}>
      <div className="mb-[6px]" aria-hidden>
        {loading || isStreaming ? <LoadingIcon /> : <LogoIcon />}
      </div>
      {/* {isLLMMessage && <div className="mt-4 text-xs text-gray-500">AI가 직접 작성했어요</div>} */}

      {prevNode}

      <div
        className={bubbleClasses}
        aria-live="polite"
        aria-busy={loading || isStreaming || undefined}
      >
        {isStreaming && animationType === 'fade-in' ? (
          <StreamingText
            className={cn(
              'prose max-w-none',
              isStreamingPrefix ? 'animate-pulse text-[14px]' : 'text-[16px]'
            )}
            text={message}
          />
        ) : (
          <MarkdownContent
            className={cn(
              'prose max-w-none',
              isStreamingPrefix ? 'animate-pulse text-[14px]' : 'text-[16px]'
            )}
            markdownContent={message}
          />
        )}
      </div>
    </MessageBubbleWrapper>
  );
};

export default memo(ChatbotBubble);
