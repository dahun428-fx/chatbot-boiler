import { useEffect, useRef, useState } from 'react';

import { useStreamingAnimation } from '@/shared/context/StreamingAnimationContext';
import { cn } from '@/shared/lib/common';

import MarkdownContent from './MarkdownContent';

interface StreamingTextProps {
  text: string;
  className?: string;
}

/**
 * 스트리밍 텍스트 컴포넌트
 * - 텍스트가 추가될 때마다 새로운 부분에 페이드인 애니메이션을 적용합니다.
 * - MarkdownContent를 사용하여 마크다운을 렌더링합니다.
 * - useStreamingAnimation 훅을 통해 애니메이션 속도/이징을 조절할 수 있습니다.
 */
export const StreamingText = ({ text, className }: StreamingTextProps) => {
  const [displayedText, setDisplayedText] = useState(text);
  const prevTextRef = useRef(text);
  const { animationDuration, animationEasing } = useStreamingAnimation();

  // 텍스트가 변경될 때마다 애니메이션 효과를 위해 상태 업데이트
  useEffect(() => {
    if (text !== prevTextRef.current) {
      setDisplayedText(text);
      prevTextRef.current = text;
    }
  }, [text]);

  // 텍스트를 "기존 부분"과 "새로운 부분"으로 분리하는 것은 마크다운 구조를 깨뜨릴 수 있어 위험함.
  // 대신, 전체 컨테이너에 미세한 타이핑 효과나 끝부분 페이드 효과를 주는 방식을 적용.
  // 여기서는 가장 안전한 방법으로, 전체 텍스트를 렌더링하되
  // CSS 마스크나 애니메이션을 통해 "나타나는" 느낌을 줍니다.

  // 하지만 사용자가 "Fade In"을 원했으므로,
  // 1. 전체 텍스트 렌더링
  // 2. key를 변경하여 매번 새로 그리면 깜빡임이 심함.
  // 3. 따라서, 단순히 MarkdownContent를 렌더링하되,
  //    텍스트가 길어질 때 부드럽게 이어지도록 처리.

  // [개선된 접근]
  // 단순히 텍스트를 보여주는 것보다, 마지막 청크를 감지해서 애니메이션을 주는 것이 이상적이지만,
  // 마크다운 파싱 때문에 어렵습니다.
  // 대안: 텍스트가 업데이트될 때마다 전체 래퍼에 'animate-pulse' 같은 효과를 살짝 주거나,
  // 그냥 MarkdownContent를 그대로 씁니다. (기본적으로 React가 Diff를 통해 업데이트하므로)

  // [사용자 요청 반영 시도]
  // "Fade In 방식"
  // -> 글자가 나타날 때 투명도 0 -> 1
  // -> 이를 위해선 글자 단위 렌더링이 필요하지만 마크다운이라 불가능.
  // -> 차선책: 전체 텍스트 렌더링 + CSS Mask로 끝부분 그라데이션 처리? (복잡함)

  // -> **가장 현실적인 방법**:
  // 그냥 MarkdownContent를 렌더링합니다. React의 재조정(Reconciliation) 덕분에
  // 추가된 텍스트만 DOM에 삽입됩니다.
  // 그 "삽입된 DOM 노드"에 애니메이션을 걸려면 CSS global rule이 필요합니다.
  // 예: `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`
  // 그리고 `p`, `span`, `li` 등 모든 요소가 생성될 때 animation을 먹이도록?
  // -> `* { animation: fadeIn 0.3s ease-in-out; }` (너무 과격함)

  // -> **절충안**:
  // 이 컴포넌트는 단순히 래퍼 역할만 하고,
  // 실제로는 `MarkdownContent` 내부에서 렌더링되는 요소들이 부드럽게 나오도록
  // CSS 클래스를 주입합니다.

  // 애니메이션 시간을 초 단위로 변환
  const durationInSeconds = animationDuration / 1000;

  return (
    <div className={cn('streaming-text-container', className)}>
      <MarkdownContent markdownContent={displayedText} />
      <style>{`
        .streaming-text-container > div > * {
          /* 직계 자식 요소(p, ul 등)가 추가될 때 블러+슬라이드업 애니메이션 */
          animation: perplexityReveal ${durationInSeconds}s ${animationEasing} forwards;
          will-change: transform, opacity, filter;
        }
        @keyframes perplexityReveal {
          0% {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
};
