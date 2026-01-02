// src/features/chat/hooks/useIntelligentScroll.ts
import { useCallback, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';

import { isStreamingState } from '../atom/chat';

type Opts = {
  containerRef: React.RefObject<HTMLElement | null> | null | undefined;
  lastMessageId: string | null | undefined;
  latestUserMessageId?: string | null;
  headerOffset?: number;
  behavior?: ScrollBehavior; // 기존: 1·2단계 스크롤 동작
  minScrollPx?: number;
  /** 새 사용자 메시지 입력 직후 바닥으로 먼저 스냅할지 */
  snapToBottomOnNewUser?: boolean;
  /** 새 사용자 메시지 시의 스크롤 동작 (없으면 'auto') */
  newUserScrollBehavior?: ScrollBehavior;
};

export function useIntelligentScroll({
  containerRef,
  lastMessageId,
  latestUserMessageId,
  headerOffset = 56,
  behavior = 'smooth',
  minScrollPx = 100,
  snapToBottomOnNewUser = true,
  newUserScrollBehavior = 'auto',
}: Opts) {
  const isStreaming = useRecoilValue(isStreamingState);
  const wasStreamingRef = useRef(isStreaming);

  const prevScrollHeightRef = useRef<number | null>(null);
  const pendingScrollForIdRef = useRef<string | null>(null);

  const getContainer = useCallback(
    () => (containerRef && 'current' in containerRef ? containerRef.current : null),
    [containerRef]
  );

  const getLatestUserEl = () => {
    const el = getContainer();
    if (!el || !latestUserMessageId) return null;
    return el.querySelector<HTMLElement>(`[data-bubble-id="${latestUserMessageId}"]`);
  };

  useEffect(() => {
    const el = getContainer();
    if (!el) return;
    prevScrollHeightRef.current = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  // ✅ 새 사용자 메시지 직후: 먼저 바닥으로 스냅
  useEffect(() => {
    if (!snapToBottomOnNewUser) return;
    if (!latestUserMessageId) return;
    const el = getContainer();
    if (!el) return;

    // 최하단으로 이동
    el.scrollTo({ top: el.scrollHeight, behavior: newUserScrollBehavior });

    // 이후 성장량 계산의 기준을 현재 높이로 갱신
    prevScrollHeightRef.current = el.scrollHeight;
    // 여기서 바로 pendingScrollForIdRef를 만지지 않는 이유:
    // 스트리밍 1/2단계 로직은 bot 메시지 렌더 확장 때 동작하게 유지
  }, [latestUserMessageId, snapToBottomOnNewUser, newUserScrollBehavior, getContainer]);

  useEffect(() => {
    if (lastMessageId) {
      pendingScrollForIdRef.current = lastMessageId;
    }
  }, [lastMessageId]);

  useEffect(() => {
    const streamingJustStarted = !wasStreamingRef.current && isStreaming;
    const streamingJustEnded = wasStreamingRef.current && !isStreaming;

    if (pendingScrollForIdRef.current) {
      if (streamingJustStarted) {
        performFirstPhaseMinScroll();
      } else if (streamingJustEnded) {
        performSecondPhaseGrowthScroll();
        pendingScrollForIdRef.current = null;
      }
    }

    wasStreamingRef.current = isStreaming;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  const performFirstPhaseMinScroll = () => {
    const el = getContainer();
    if (!el) return;
    let delta = minScrollPx;
    const userEl = getLatestUserEl();
    if (userEl) {
      const uTop = userEl.getBoundingClientRect().top;
      const allowedByHeader = Math.max(0, uTop - headerOffset);
      delta = Math.min(delta, allowedByHeader);
    }
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    const allowedByBottom = Math.max(0, maxScrollTop - el.scrollTop);
    delta = Math.min(delta, allowedByBottom);
    if (delta > 0) {
      el.scrollTo({ top: el.scrollTop + delta, behavior });
    }
  };

  const performSecondPhaseGrowthScroll = () => {
    const el = getContainer();
    if (!el) return;
    const now = el.scrollHeight;
    const prev = prevScrollHeightRef.current ?? now;
    const growth = Math.max(0, now - prev);
    let desired = growth;
    const userEl = getLatestUserEl();
    if (userEl) {
      const uTop = userEl.getBoundingClientRect().top;
      const allowedByHeader = Math.max(0, uTop - headerOffset);
      desired = Math.min(desired, allowedByHeader);
    }
    const maxScrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
    const allowedByBottom = Math.max(0, maxScrollTop - el.scrollTop);
    desired = Math.min(desired, allowedByBottom);
    if (desired > 0) {
      el.scrollTo({ top: el.scrollTop + desired, behavior });
    }
    prevScrollHeightRef.current = now;
  };

  return {};
}
