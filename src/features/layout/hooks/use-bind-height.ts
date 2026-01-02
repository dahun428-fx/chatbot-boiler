// src/lib/hooks/useBindHeightToAtom.ts
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SetterOrUpdater } from 'recoil';

export function useBindHeightToAtom<T extends HTMLElement>(setAtom: SetterOrUpdater<number>) {
  const ref = useRef<T | null>(null);

  // SSR 대비 + 첫 렌더 즉시 반영
  useLayoutEffect(() => {
    if (!ref.current) return;
    setAtom(ref.current.offsetHeight);
  }, [setAtom]);

  useEffect(() => {
    if (!ref.current) return;

    // 리사이즈/폰트 변화 등 동적 변화 추적
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      // border-box height 사용
      const box = (entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height) as number;
      setAtom(Math.round(box));
    });

    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [setAtom]);

  return ref;
}
