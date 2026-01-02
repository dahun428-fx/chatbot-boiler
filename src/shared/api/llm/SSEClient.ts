/**
 * SSE (Server-Sent Events) 클라이언트
 * LLM 스트리밍 응답을 처리하기 위한 유틸리티
 */

export interface SSEOptions {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: unknown;
    signal?: AbortSignal;
    onMessage?: (data: string) => void;
    onError?: (error: Error) => void;
    onClose?: () => void;
}

/**
 * SSE 스트림을 AsyncGenerator로 변환
 */
export async function* createSSEStream(options: SSEOptions): AsyncGenerator<string, void, unknown> {
    const { url, method = 'POST', headers = {}, body, signal } = options;

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal,
    });

    if (!response.ok) {
        throw new Error(`SSE request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
        throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // SSE 이벤트 파싱
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    // [DONE] 시그널 처리
                    if (data === '[DONE]') {
                        return;
                    }

                    yield data;
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * SSE 이벤트 파싱 헬퍼
 */
export function parseSSEEvent(data: string): unknown {
    try {
        return JSON.parse(data);
    } catch {
        return data;
    }
}

/**
 * 재시도 가능한 SSE 스트림
 */
export async function* createRetryableSSEStream(
    options: SSEOptions,
    maxRetries = 3,
    retryDelay = 1000
): AsyncGenerator<string, void, unknown> {
    let retries = 0;

    while (retries <= maxRetries) {
        try {
            yield* createSSEStream(options);
            return;
        } catch (error) {
            retries++;

            if (retries > maxRetries) {
                throw error;
            }

            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, retries - 1)));
        }
    }
}
