/**
 * Mock LLM Adapter for Testing
 *
 * 테스트에서 실제 API 호출 없이 LLM 응답을 시뮬레이션합니다.
 */
import type { LLMAdapter, LLMRequest, LLMResponse, LLMStreamChunk } from '@/shared/api/llm/direct/types';
import { LLMError } from '@/shared/api/llm/direct/types';

export interface MockLLMConfig {
    /** 기본 응답 메시지 */
    defaultResponse?: string;
    /** 응답 지연 시간 (ms) */
    delay?: number;
    /** 스트리밍 청크 지연 시간 (ms) */
    streamDelay?: number;
    /** 에러 발생 시뮬레이션 */
    shouldError?: boolean;
    /** 에러 타입 */
    errorType?: 'auth_error' | 'rate_limit' | 'network_error' | 'timeout';
}

/**
 * 테스트용 Mock LLM Adapter
 *
 * @example
 * ```typescript
 * const mockLLM = new MockLLMAdapter({
 *   defaultResponse: '안녕하세요! 무엇을 도와드릴까요?',
 *   delay: 100,
 * });
 *
 * // 응답 설정
 * mockLLM.setNextResponse('커스텀 응답입니다.');
 *
 * // 에러 시뮬레이션
 * mockLLM.setError('rate_limit');
 * ```
 */
export class MockLLMAdapter implements LLMAdapter {
    readonly name = 'mock';

    private config: MockLLMConfig;
    private nextResponse: string | null = null;
    private nextError: LLMError | null = null;
    private callHistory: LLMRequest[] = [];

    constructor(config: MockLLMConfig = {}) {
        this.config = {
            defaultResponse: 'Mock LLM 응답입니다.',
            delay: 0,
            streamDelay: 10,
            shouldError: false,
            ...config,
        };
    }

    /**
     * 다음 응답 설정
     */
    setNextResponse(response: string): void {
        this.nextResponse = response;
        this.nextError = null;
    }

    /**
     * 에러 시뮬레이션 설정
     */
    setError(type: 'auth_error' | 'rate_limit' | 'network_error' | 'timeout'): void {
        const errorMessages = {
            auth_error: 'Invalid API key',
            rate_limit: 'Rate limit exceeded',
            network_error: 'Network error',
            timeout: 'Request timeout',
        };
        this.nextError = new LLMError(errorMessages[type], type, type === 'auth_error' ? 401 : 500);
        this.nextResponse = null;
    }

    /**
     * 에러 초기화
     */
    clearError(): void {
        this.nextError = null;
    }

    /**
     * 호출 히스토리 가져오기
     */
    getCallHistory(): LLMRequest[] {
        return [...this.callHistory];
    }

    /**
     * 마지막 호출 가져오기
     */
    getLastCall(): LLMRequest | undefined {
        return this.callHistory[this.callHistory.length - 1];
    }

    /**
     * 호출 횟수
     */
    getCallCount(): number {
        return this.callHistory.length;
    }

    /**
     * 히스토리 초기화
     */
    clearHistory(): void {
        this.callHistory = [];
    }

    /**
     * 전체 초기화
     */
    reset(): void {
        this.nextResponse = null;
        this.nextError = null;
        this.callHistory = [];
    }

    /**
     * 일반 채팅 요청
     */
    async chat(request: LLMRequest): Promise<LLMResponse> {
        this.callHistory.push(request);

        // 지연 시뮬레이션
        if (this.config.delay && this.config.delay > 0) {
            await this.delay(this.config.delay);
        }

        // 에러 시뮬레이션
        if (this.nextError) {
            const error = this.nextError;
            this.nextError = null;
            throw error;
        }

        if (this.config.shouldError) {
            throw new LLMError('Mock error', this.config.errorType || 'unknown');
        }

        // 응답 생성
        const content = this.nextResponse ?? this.config.defaultResponse ?? '';
        this.nextResponse = null;

        return {
            content,
            model: 'mock-model',
            usage: {
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30,
            },
            finishReason: 'stop',
        };
    }

    /**
     * 스트리밍 채팅 요청
     */
    async *stream(request: LLMRequest): AsyncGenerator<LLMStreamChunk, void, unknown> {
        this.callHistory.push(request);

        // 에러 시뮬레이션
        if (this.nextError) {
            const error = this.nextError;
            this.nextError = null;
            throw error;
        }

        if (this.config.shouldError) {
            throw new LLMError('Mock error', this.config.errorType || 'unknown');
        }

        // 응답을 청크로 분할
        const content = this.nextResponse ?? this.config.defaultResponse ?? '';
        this.nextResponse = null;

        const words = content.split(' ');

        for (let i = 0; i < words.length; i++) {
            // AbortSignal 체크
            if (request.signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            // 스트리밍 지연
            if (this.config.streamDelay && this.config.streamDelay > 0) {
                await this.delay(this.config.streamDelay);
            }

            const isLast = i === words.length - 1;
            yield {
                content: words[i] + (isLast ? '' : ' '),
                done: isLast,
            };
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

/**
 * Mock LLM 생성 헬퍼
 */
export const createMockLLM = (config?: MockLLMConfig): MockLLMAdapter => {
    return new MockLLMAdapter(config);
};
