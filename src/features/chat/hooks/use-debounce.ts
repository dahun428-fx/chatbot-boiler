import { useEffect, useRef } from 'react';

type EffectReturn = void | (() => void) | Promise<void | (() => void)>;
type EffectCallback = () => EffectReturn;

/**
 * useDebouncedEffect
 * - effect: 동기/비동기 함수 모두 허용
 * - effect가 cleanup(동기/비동기)을 반환해도 안전 처리
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedEffect(effect: EffectCallback, deps: any[], delay: number) {
  const cleanupRef = useRef<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    if (typeof effect !== 'function') {
      if (process.env.NODE_ENV !== 'production') {
        // 개발 중 즉시 원인 파악
        // eslint-disable-next-line no-console
        console.error('useDebouncedEffect: effect must be a function, got:', effect);
      }
      return;
    }

    let canceled = false;

    const timer = setTimeout(() => {
      // effect는 동기/비동기 모두 가능
      Promise.resolve(effect())
        .then((ret) => {
          if (canceled) return;
          if (typeof ret === 'function') {
            cleanupRef.current = ret;
          } else {
            cleanupRef.current = null;
          }
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error('useDebouncedEffect error:', e);
        });
    }, delay);

    return () => {
      canceled = true;
      clearTimeout(timer);

      // cleanup이 동기/비동기여도 안전하게 처리
      const fn = cleanupRef.current;
      cleanupRef.current = null;
      if (typeof fn === 'function') {
        try {
          const maybePromise = fn();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (maybePromise && typeof (maybePromise as any).then === 'function') {
            (maybePromise as Promise<void>).catch(() => {
              /* noop */
            });
          }
        } catch {
          /* noop */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
