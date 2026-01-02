/**
 * 자동 스크롤 훅
 *
 * 메시지 변경 시 자동으로 스크롤을 하단으로 이동합니다.
 */
import { useCallback, useEffect, useRef } from 'react';

/**
 * 자동 스크롤 훅
 * @param dependencies - 스크롤 트리거 의존성 배열
 * @returns containerRef - 스크롤 컨테이너에 연결할 ref
 */
export const useAutoScroll = <T extends unknown[]>(dependencies: T) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return {
        containerRef,
        scrollToBottom,
    };
};
