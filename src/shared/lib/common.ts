import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export function isIOS() {
  if (typeof window === 'undefined') return false;
  const isIOSDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent);
  return isIOSDevice;
}

export function isMobile() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Mobi|Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeEmpty = (obj: Record<string, any>) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

export const delay = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export function safeParseJSON(text?: string | object | null) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 마크다운 텍스트의 줄바꿈을 정규화합니다.
 * - JSON 문자열 파싱
 * - 이스케이프 복원 (\n, \")
 * - CRLF -> LF 변환
 * - 과도한 개행 정리
 * - blockquote 내 리스트 변환
 */
export function replaceNewlineWithBr(text: string): string {
  if (!text) return '';

  let s = text;

  // 1) 따옴표로 감싼 JSON 문자열이면 파싱해서 내부 이스케이프를 복원
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    try {
      s = JSON.parse(t);
    } catch {
      // 무시
    }
  }

  s = s
    .replace(/\\"/g, '"') // \" -> "
    .replace(/\r\n/g, '\n') // CRLF → LF
    .replace(/\\n/g, '\n') // 문자열 "\n" → 실제 개행
    .replace(/\n{2,}/g, '\n\n') // 과도 개행 정리
    .replace(/~/g, '-');

  // blockquote 안의 리스트를 중첩 리스트로 변환
  s = s.replace(/^\s*>\s*-\s+/gm, '  - ').replace(/^\s*>\s*(\d+)\.\s+/gm, '  $1. ');

  return s;
}
