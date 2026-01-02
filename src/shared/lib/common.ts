import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import {
  CommonAnswerType,
  ContentAnswerType,
  DefaultAnswerTextType,
  FAQAnswerType,
} from '@/shared/types/message.type';

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

export function isDefaultAnswerTextType(
  text:
    | CommonAnswerType
    | DefaultAnswerTextType
    | ContentAnswerType
    | FAQAnswerType
    | string
): text is DefaultAnswerTextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof text === 'object' && text !== null && Array.isArray((text as any).options);
}

export function getDisplayText(
  answerText?:
    | CommonAnswerType
    | DefaultAnswerTextType
    | ContentAnswerType
    | FAQAnswerType
    | string
): string {
  if (answerText == null) {
    return '';
  }

  if (typeof answerText === 'string') {
    return answerText;
  }

  if (isDefaultAnswerTextType(answerText)) {
    const opts = answerText.options;
    if (opts.length === 0) {
      return '';
    }
    const last = opts[opts.length - 1];
    return last.answerLabel ?? '';
  }

  return '';
}

export function safeParseJSON(text?: string | object | null) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function normalizeToDefaultAnswerText(
  optionText?: string | object | null
): { options: unknown[] } | null {
  if (!optionText) return null;

  // 이미 파싱된 객체인 경우
  if (typeof optionText === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.isArray((optionText as any).options) ? (optionText as { options: unknown[] }) : null;
  }

  // 문자열인 경우 파싱 시도
  try {
    const parsed = JSON.parse(optionText);
    return Array.isArray(parsed.options) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseOptionText<T>(optionText?: string | object | null): T | null {
  if (!optionText) return null;
  if (typeof optionText === 'object') return optionText as T;
  try {
    return JSON.parse(optionText) as T;
  } catch {
    return null;
  }
}

export function getBotDomId(chatRoomId?: string, id?: string): string {
  return `bot-${chatRoomId ?? 'room'}-${id ?? 'unknown'}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * DOM ID로 메시지 버블 높이 측정
 */
export function measureBubbleHeightById(domId: string): number {
  const element = document.getElementById(domId);
  if (!element) return 0;
  return element.getBoundingClientRect().height;
}
