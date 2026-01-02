// src/utils/naverMap.ts
export const isMobilePlatform = (): boolean =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * nmap:// 과 웹맵 URL 조합을 리턴
 */
export function buildMapUrls(query: string) {
  const encoded = encodeURIComponent(query);
  return {
    deeplink: `nmap://search?query=${encoded}&appname=com.example.myapp`,
    web: `https://m.map.naver.com/search2/search.naver?query=${encoded}&sm=hty&style=v5`,
  };
}

// src/shared/lib/abortableDelay.ts
export function abortableDelay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const id = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}
