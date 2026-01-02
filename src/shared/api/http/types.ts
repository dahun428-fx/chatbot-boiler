/**
 * HTTP Client 타입 정의
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** HTTP 요청 옵션 */
export interface RequestOptions {
    /** URL 쿼리 파라미터 */
    params?: Record<string, string | number | boolean | undefined>;
    /** 요청 헤더 */
    headers?: Record<string, string>;
    /** 타임아웃 (ms) */
    timeout?: number;
    /** AbortSignal */
    signal?: AbortSignal;
    /** 응답 타입 */
    responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

/** HTTP 응답 */
export interface HttpResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

/** HTTP Client 설정 */
export interface HttpClientConfig {
    /** 기본 URL */
    baseUrl?: string;
    /** 기본 헤더 */
    headers?: Record<string, string>;
    /** 기본 타임아웃 (ms) */
    timeout?: number;
    /** 요청 전 인터셉터 */
    onRequest?: (url: string, options: RequestInit) => RequestInit | Promise<RequestInit>;
    /** 응답 후 인터셉터 - 데이터 변환 시 any 타입 허용 */
    onResponse?: (response: HttpResponse<unknown>) => HttpResponse<unknown> | Promise<HttpResponse<unknown>>;
    /** 에러 핸들러 */
    onError?: (error: HttpError) => void;
}

/** HTTP 에러 */
export class HttpError extends Error {
    readonly status: number;
    readonly statusText: string;
    readonly data?: unknown;

    constructor(message: string, status: number, statusText: string, data?: unknown) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }

    get isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    get isServerError(): boolean {
        return this.status >= 500;
    }

    get isAuthError(): boolean {
        return this.status === 401 || this.status === 403;
    }
}

/** 네트워크 에러 */
export class NetworkError extends Error {
    constructor(message: string, public readonly cause?: Error) {
        super(message);
        this.name = 'NetworkError';
    }
}

/** 타임아웃 에러 */
export class TimeoutError extends Error {
    constructor(public readonly timeoutMs: number) {
        super(`Request timed out after ${timeoutMs}ms`);
        this.name = 'TimeoutError';
    }
}
