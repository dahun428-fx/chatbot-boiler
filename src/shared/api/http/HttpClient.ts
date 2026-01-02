/**
 * HTTP Client
 *
 * 순수 RESTful API 통신을 위한 HTTP 클라이언트
 *
 * @example
 * ```typescript
 * const http = new HttpClient({ baseUrl: '/api' });
 *
 * // GET
 * const users = await http.get<User[]>('/users');
 *
 * // POST
 * const newUser = await http.post<User>('/users', { name: 'John' });
 *
 * // PUT
 * await http.put('/users/1', { name: 'Jane' });
 *
 * // PATCH
 * await http.patch('/users/1', { name: 'Jane' });
 *
 * // DELETE
 * await http.delete('/users/1');
 * ```
 */

import { HttpError, NetworkError, TimeoutError } from './types';
import type { HttpClientConfig, HttpResponse, RequestOptions } from './types';

export class HttpClient {
    private config: HttpClientConfig;

    constructor(config: HttpClientConfig = {}) {
        this.config = {
            timeout: 30000,
            ...config,
        };
    }

    /** GET 요청 */
    async get<T>(url: string, options?: RequestOptions): Promise<T> {
        const response = await this.request<T>('GET', url, undefined, options);
        return response.data;
    }

    /** POST 요청 */
    async post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
        const response = await this.request<T>('POST', url, body, options);
        return response.data;
    }

    /** PUT 요청 */
    async put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
        const response = await this.request<T>('PUT', url, body, options);
        return response.data;
    }

    /** PATCH 요청 */
    async patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
        const response = await this.request<T>('PATCH', url, body, options);
        return response.data;
    }

    /** DELETE 요청 */
    async delete<T>(url: string, options?: RequestOptions): Promise<T> {
        const response = await this.request<T>('DELETE', url, undefined, options);
        return response.data;
    }

    /** 전체 응답 객체가 필요한 경우 */
    async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        url: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<HttpResponse<T>> {
        const { params, headers, timeout, signal, responseType = 'json' } = options || {};

        // URL 구성
        const fullUrl = this.buildUrl(url, params);

        // 헤더 구성
        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...this.config.headers,
            ...headers,
        };

        // fetch 옵션
        let fetchOptions: RequestInit = {
            method,
            headers: requestHeaders,
            body: body != null ? JSON.stringify(body) : undefined,
        };

        // 요청 인터셉터
        if (this.config.onRequest) {
            fetchOptions = await this.config.onRequest(fullUrl, fetchOptions);
        }

        // AbortController (타임아웃 + 외부 signal)
        const controller = new AbortController();
        const timeoutMs = timeout ?? this.config.timeout ?? 30000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        if (signal) {
            signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        fetchOptions.signal = controller.signal;

        try {
            const fetchResponse = await fetch(fullUrl, fetchOptions);
            clearTimeout(timeoutId);

            // 에러 응답
            if (!fetchResponse.ok) {
                const errorData = await this.parseResponse(fetchResponse, 'json').catch(() => null);
                const error = new HttpError(
                    (errorData as Record<string, string>)?.message ||
                    (errorData as Record<string, string>)?.error ||
                    `HTTP ${fetchResponse.status}`,
                    fetchResponse.status,
                    fetchResponse.statusText,
                    errorData
                );

                if (this.config.onError) {
                    this.config.onError(error);
                }

                throw error;
            }

            // 응답 파싱
            const data = await this.parseResponse<T>(fetchResponse, responseType);

            let response: HttpResponse<T> = {
                data,
                status: fetchResponse.status,
                statusText: fetchResponse.statusText,
                headers: fetchResponse.headers,
            };

            // 응답 인터셉터
            if (this.config.onResponse) {
                response = await this.config.onResponse(response) as HttpResponse<T>;
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof HttpError) {
                throw error;
            }

            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new TimeoutError(timeoutMs);
            }

            if (error instanceof TypeError) {
                throw new NetworkError('Network error', error);
            }

            throw error;
        }
    }

    /** 설정 업데이트 */
    setConfig(config: Partial<HttpClientConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /** 헤더 추가 */
    setHeader(key: string, value: string): void {
        this.config.headers = { ...this.config.headers, [key]: value };
    }

    /** 인증 토큰 설정 */
    setAuthToken(token: string, type: 'Bearer' | 'Basic' | string = 'Bearer'): void {
        this.setHeader('Authorization', `${type} ${token}`);
    }

    /** 인증 토큰 제거 */
    clearAuthToken(): void {
        if (this.config.headers) {
            delete this.config.headers['Authorization'];
        }
    }

    // ============ Private Methods ============

    private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
        const baseUrl = this.config.baseUrl || '';
        const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
        let fullUrl = isAbsolute ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
            }
        }

        return fullUrl;
    }

    private async parseResponse<T>(response: Response, type: 'json' | 'text' | 'blob' | 'arrayBuffer'): Promise<T> {
        switch (type) {
            case 'json':
                return response.json();
            case 'text':
                return response.text() as Promise<T>;
            case 'blob':
                return response.blob() as Promise<T>;
            case 'arrayBuffer':
                return response.arrayBuffer() as Promise<T>;
            default:
                return response.json();
        }
    }
}

/** 기본 HTTP 클라이언트 인스턴스 */
let defaultHttpClient: HttpClient | null = null;

export function getHttpClient(config?: HttpClientConfig): HttpClient {
    if (!defaultHttpClient) {
        defaultHttpClient = new HttpClient(config);
    }
    return defaultHttpClient;
}

export function createHttpClient(config?: HttpClientConfig): HttpClient {
    return new HttpClient(config);
}
