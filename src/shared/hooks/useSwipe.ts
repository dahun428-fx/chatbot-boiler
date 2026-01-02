import { useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 50;

interface UseSwipeProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight }: UseSwipeProps) => {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;
    isSwipingRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const sx = startXRef.current;
    const sy = startYRef.current;
    if (sx == null || sy == null) return;

    const t = e.touches[0];
    const dx = t.clientX - sx;
    const dy = t.clientY - sy;

    if (!isSwipingRef.current && Math.abs(dx) > Math.abs(dy)) {
      isSwipingRef.current = true;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const sx = startXRef.current;
      const sy = startYRef.current;
      if (sx == null || sy == null) return;

      const t = e.changedTouches[0];
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;

      if (isSwipingRef.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= SWIPE_THRESHOLD) {
        if (dx < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }

      startXRef.current = null;
      startYRef.current = null;
      isSwipingRef.current = false;
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
};
