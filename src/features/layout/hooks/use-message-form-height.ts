// src/lib/hooks/useBindFormHeightToAtom.ts
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { SetterOrUpdater } from 'recoil';

type Options = {
  extraOffset?: number; // 여유 여백(px)
  initialMeasureDelayMs?: number; // 초기 측정 지연(포탈/트랜지션 대응)
  observeWhenHidden?: boolean; // display: none 상태에서도 관찰 시도 (기본 false)
};

export function useBindFormHeightToAtom<T extends HTMLElement>(
  setAtom: SetterOrUpdater<number>,
  { extraOffset = 0, initialMeasureDelayMs = 0, observeWhenHidden = false }: Options = {}
) {
  const ref = useRef<T | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  const measure = () => {
    const el = ref.current;
    if (!el) {
      setAtom(0);
      return;
    }
    // 숨김 상태면 0 처리(옵션으로 무시 가능)
    const style = window.getComputedStyle(el);
    if (!observeWhenHidden && (style.display === 'none' || style.visibility === 'hidden')) {
      setAtom(0);
      return;
    }

    const rect = el.getBoundingClientRect();
    const h = Math.max(0, Math.round(rect.height + extraOffset));
    setAtom(h);
  };

  // 최초 1회 + 딜레이 보정
  useLayoutEffect(() => {
    if (initialMeasureDelayMs > 0) {
      const t = window.setTimeout(measure, initialMeasureDelayMs);
      return () => window.clearTimeout(t);
    }
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ResizeObserver로 실시간 반영
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    });
    ro.observe(el);
    roRef.current = ro;

    // 뷰포트 변화 대응
    const onViewport = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onViewport, { passive: true });
    window.addEventListener('scroll', onViewport, { passive: true });

    return () => {
      ro.disconnect();
      roRef.current = null;
      window.removeEventListener('resize', onViewport);
      window.removeEventListener('scroll', onViewport);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref; // 이 ref를 <form>에 연결
}
