// Mock useTrack hook - 분석 기능 비활성화
export const useTrack = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (_eventName: string, _properties?: Record<string, unknown>) => {
    // No-op: 분석 비활성화
  };
};
