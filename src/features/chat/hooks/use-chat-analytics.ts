import { useCallback, useRef } from 'react';

/**
 * 채팅 분석 이벤트 훅 (Simplified - no external analytics)
 */
export function useChatAnalytics() {
  /** 추천 질문 플래그 */
  const recommendQuestionFlagRef = useRef<boolean>(false);

  /**
   * 추천 질문 플래그 설정
   */
  const setRecommendQuestionFlag = useCallback((value: boolean) => {
    recommendQuestionFlagRef.current = value;
  }, []);

  /**
   * 추천 질문 플래그 반환
   */
  const getRecommendQuestionFlag = useCallback(() => {
    return recommendQuestionFlagRef.current;
  }, []);

  /**
   * 사용자 텍스트 질문 이벤트 추적 (no-op)
   */
  const trackUserTextInquired = useCallback(
    (_from: string, _message: string, _intent: string) => {
      // No-op: analytics tracking disabled
    },
    []
  );

  /**
   * 추천 질문 플래그 초기화
   */
  const resetRecommendQuestionFlag = useCallback(() => {
    recommendQuestionFlagRef.current = false;
  }, []);

  return {
    recommendQuestionFlag: recommendQuestionFlagRef.current,
    setRecommendQuestionFlag,
    getRecommendQuestionFlag,
    trackUserTextInquired,
    resetRecommendQuestionFlag,
  };
}
