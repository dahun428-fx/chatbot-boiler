// src/shared/hooks/useVariableListController.ts
import { useRef, useCallback } from 'react';
import type { VariableSizeList } from 'react-window';

export function useVariableListController<T>(
  estimated: number | ((index: number, item?: T) => number)
) {
  const sizeMapRef = useRef(new Map<number, number>());
  const itemsRef = useRef<readonly T[]>([]);
  const listRef = useRef<VariableSizeList>(null);

  /** 현재 리스트 아이템을 저장(추정 함수에서 활용) */
  const setItems = useCallback((items: readonly T[]) => {
    itemsRef.current = items;
  }, []);

  /** index별 높이: 캐시 → 가변 추정 → 고정 추정 순 */
  const getItemSize = useCallback(
    (index: number) => {
      const cached = sizeMapRef.current.get(index);
      if (cached != null) return cached;

      if (typeof estimated === 'function') {
        try {
          const guess = (estimated as (i: number, it?: T) => number)(
            index,
            itemsRef.current[index]
          );
          return Math.max(1, Math.ceil(guess));
        } catch {
          // no-op
        }
      }
      return estimated as number;
    },
    [estimated]
  );

  /** 실측값 반영 */
  const setItemSize = useCallback((index: number, size: number) => {
    const prev = sizeMapRef.current.get(index);
    if (prev == null || Math.abs(prev - size) > 1) {
      sizeMapRef.current.set(index, size);
      listRef.current?.resetAfterIndex(index);
    }
  }, []);

  /** 데이터 바뀔 때 캐시 초기화 */
  const clearCache = useCallback(() => {
    sizeMapRef.current.clear();
    listRef.current?.resetAfterIndex(0, true);
  }, []);

  return { listRef, getItemSize, setItemSize, clearCache, setItems };
}
