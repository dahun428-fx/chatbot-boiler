// hooks/useAlertToStreaming.ts
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useRecoilValue } from 'recoil';

import { isStreamingState } from '../atom/chat';

/**
 * 스트리밍 중일 때 호출을 막고 토스트 알림을 띄워주는 훅
 * @returns alertToStreaming: 호출 시 스트리밍 중이면 알림 후 true, 아니면 false
 */
export function useAlertToStreaming() {
  const isStreaming = useRecoilValue(isStreamingState);
  const alertToStreaming = useCallback(async (): Promise<boolean> => {
    if (isStreaming) {
      toast.info('응답이 끝날 때까지 기다려주세요!', { autoClose: 1000 });
      return true;
    }
    return false;
  }, [isStreaming]);

  return { alertToStreaming };
}
