// src/shared/lib/isEmpty.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 다양한 타입을 "비어 있음"으로 판정하는 유틸리티
 *
 * - null/undefined → empty
 * - string → trim 후 길이 0이면 empty
 * - number → NaN 이면 empty (0은 empty 아님)
 * - boolean → 항상 not empty
 * - Date → Invalid Date 이면 empty
 * - Array/TypedArray → length === 0 이면 empty
 * - DataView → byteLength === 0 이면 empty
 * - ArrayBuffer → byteLength === 0 이면 empty
 * - Map/Set → size === 0 이면 empty
 * - Plain Object → own enumerable keys 가 0개면 empty
 * - Blob/File(브라우저) → size === 0 이면 empty
 */
export function isEmpty(value: unknown): boolean {
  // null/undefined
  if (value == null) return true;

  // 문자열
  if (typeof value === 'string') return value.trim().length === 0;

  // 숫자
  if (typeof value === 'number') return Number.isNaN(value);

  // 불리언
  if (typeof value === 'boolean') return false;

  // 함수
  if (typeof value === 'function') return false;

  // Date
  if (value instanceof Date) return Number.isNaN(value.getTime());

  // 배열
  if (Array.isArray(value)) return value.length === 0;

  // TypedArray / DataView
  if (ArrayBuffer.isView(value)) {
    const view: any = value as any;
    // 대부분 TypedArray는 length를 가짐, DataView는 byteLength 사용
    if (typeof view.length === 'number') return view.length === 0;
    if (typeof view.byteLength === 'number') return view.byteLength === 0;
    return false;
  }

  // ArrayBuffer
  if (value instanceof ArrayBuffer) return value.byteLength === 0;

  // Map / Set
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  // Blob/File (DOM 환경만 해당) - DOM 타입이 없어도 안전하게 체크
  const BlobCtor = (globalThis as any)?.Blob;
  if (BlobCtor && value instanceof BlobCtor) return (value as any).size === 0;
  // Plain Object (own enumerable keys 기준)
  if (typeof value === 'object') {
    // 객체지만 배열/맵/셋/버퍼류는 위에서 걸러짐
    return Object.keys(value as Record<string, unknown>).length === 0;
  }

  // 그 외는 empty 아님
  return false;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
