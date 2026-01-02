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
