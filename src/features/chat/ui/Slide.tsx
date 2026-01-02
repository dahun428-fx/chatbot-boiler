import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import { cn } from '@/shared/lib/common';

import { SlideDotButton } from './SlideDotButton';

type TProps = {
  children: React.ReactNode;
  height?: number;
  isDot?: boolean;
  dotCount?: number | undefined;
};

export const Slide = ({ children, height, isDot = true, dotCount = undefined }: TProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 드래그 상태 저장용 refs
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  // ⭐ 초기엔 0번으로 고정하는 락
  const initialLock = useRef(true);

  // children 개수 캐싱
  const count = useMemo(() => {
    if (dotCount !== undefined) {
      return dotCount;
    }
    return React.Children.count(children);
  }, [children, dotCount]);
  // 인덱스로 스크롤
  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;

      const clamped = Math.max(0, Math.min(index, count - 1));
      const slides = el.querySelectorAll<HTMLElement>(':scope > .slide-item');
      const target = slides[clamped];
      if (!target) return;

      // 0이 아닌 곳으로 이동하면 락 해제
      if (clamped !== 0) initialLock.current = false;

      // 컨테이너 기준 좌표로 변환
      const targetLeft =
        target.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;

      el.scrollTo({ left: targetLeft, behavior: 'smooth' });
      setActiveIndex(clamped);
      target.focus({ preventScroll: true });
    },
    [count]
  );

  // 키보드 이동
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        initialLock.current = false; // ⭐ 락 해제
        scrollToIndex(activeIndex + 1);
      }
      if (e.key === 'ArrowLeft') {
        initialLock.current = false; // ⭐ 락 해제
        scrollToIndex(activeIndex - 1);
      }
    },
    [activeIndex, scrollToIndex]
  );

  // 드래그·터치 중
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.clientX - el.getBoundingClientRect().left;
    const walk = x - dragStartX.current;
    el.scrollLeft = scrollStartX.current - walk;
  }, []);

  // 드래그·터치 종료
  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.userSelect = '';
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  // 드래그·터치 시작
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      isDragging.current = true;
      dragStartX.current = e.clientX - el.getBoundingClientRect().left;
      scrollStartX.current = el.scrollLeft;
      document.body.style.userSelect = 'none';

      initialLock.current = false; // ⭐ 사용자 상호작용 시작 → 락 해제

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  // —— 중앙선 기준으로 activeIndex 계산 ——
  const updateActiveByCenter = useCallback(() => {
    // ⭐ 초기 락이 켜져 있으면 계산하지 않음(0번 유지)
    if (initialLock.current) return;

    const el = scrollRef.current;
    if (!el) return;

    const slides = Array.from(el.querySelectorAll<HTMLElement>('.slide-item'));
    if (!slides.length) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;

    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const center = s.offsetLeft + s.offsetWidth / 2;
      const dist = Math.abs(center - containerCenter);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const onScroll = () => {
      // ⭐ 스크롤이 실제로 발생했으면 락 해제
      if (el.scrollLeft > 1) initialLock.current = false;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveByCenter);
    };

    el.addEventListener('scroll', onScroll, { passive: true });

    // ✅ 초기엔 항상 0번째로 강제 고정
    el.scrollTo({ left: 0 });
    setActiveIndex(0);
    // 이 시점에서는 initialLock.current === true 이므로
    // 아래 최초 계산 호출이 있어도 activeIndex는 0으로 유지됨.
    updateActiveByCenter();

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [updateActiveByCenter]);

  // 키보드 이벤트 리스너
  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  return (
    <div className={cn(height ? `h-${height}` : 'h-full', 'w-full')}>
      <div
        ref={scrollRef}
        className={cn(
          'flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth',
          'cursor-grab scrollbar-hide active:cursor-grabbing'
        )}
        onPointerDown={onPointerDown}
      >
        {React.Children.map(children, (child, index) => (
          <div
            key={index}
            className="slide-item flex-shrink-0 snap-start outline-none"
            tabIndex={0}
          >
            {child}
          </div>
        ))}
      </div>

      {isDot && count > 0 && (
        <div className="my-4 flex items-center justify-center gap-[6px]">
          {Array.from({ length: count }).map((_, index) => (
            <SlideDotButton
              key={index}
              index={index}
              isActive={index === activeIndex}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
