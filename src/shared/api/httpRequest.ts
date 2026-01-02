// http.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  useFetch?: boolean;
  streaming?: boolean;
  signal?: AbortSignal;
  onStreamChunk?: (chunk: string) => void;
  instanceType?: 'default' | 'chatDirect';
  responseType?: AxiosRequestConfig['responseType'];
  timeoutMs?: number;
  suppressGlobalError?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  data: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// ------------- Axios 인스턴스
const axiosDefault: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 6000,
  headers: { 'Content-Type': 'application/json' },
});

axiosDefault.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status || 500;
    throw new ApiError(err.message || 'API Error', status, err.response?.data);
  }
);

const axiosChatDirect: AxiosInstance = axios.create({
  baseURL: `/api/setChatDialog`,
  headers: { 'Content-Type': 'application/json' },
});

axiosChatDirect.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status || 500;
    throw new ApiError(err.message || 'API Error', status, err.response?.data);
  }
);

// ------------- 통합 요청
async function httpRequest<T>(config: RequestConfig): Promise<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    params,
    body,
    useFetch = false,
    streaming = false,
    signal,
    onStreamChunk,
    instanceType = 'default',
    responseType,
    timeoutMs = 15000,
  } = config;

  const queryString = params
    ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : '';
  const fullUrl = url + queryString;

  // --- fetch (스트리밍 포함)
  if (useFetch || streaming) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

    try {
      const res = await fetch(fullUrl, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body != null ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new ApiError(`HTTP ${res.status}`, res.status, await res.text());
      }

      if (streaming && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { done: streamDone, value } = await reader.read();
          done = streamDone;
          if (value) onStreamChunk?.(decoder.decode(value, { stream: true }));
        }
        return undefined as unknown as T;
      }

      const ctype = res.headers.get('content-type') || '';
      if (ctype.includes('application/json')) {
        return (await res.json()) as T;
      }

      return (await res.text()) as unknown as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError((err as Error).message || 'Network error', 0, err);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // --- axios
  const axiosOpts: AxiosRequestConfig = {
    url: fullUrl,
    method,
    headers,
    data: body,
    ...(responseType ? { responseType } : {}),
    signal,
    timeout: timeoutMs,
  };

  const instance = instanceType === 'chatDirect' ? axiosChatDirect : axiosDefault;
  const response = await instance.request<T>(axiosOpts);
  return response.data;
}

export async function httpClient<T>(config: RequestConfig): Promise<T> {
  try {
    return await httpRequest<T>(config);
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}
