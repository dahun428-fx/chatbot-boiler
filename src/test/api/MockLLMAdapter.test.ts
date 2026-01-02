/**
 * MockLLMAdapter Unit Tests
 *
 * TDD 테스트: Mock LLM Adapter 유닛 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';

import { LLMError } from '@/shared/api/llm/direct/types';
import type { LLMRequest } from '@/shared/api/llm/direct/types';
import { MockLLMAdapter, createMockLLM } from '@/test/mocks/MockLLMAdapter';

describe('MockLLMAdapter', () => {
    let mockLLM: MockLLMAdapter;

    beforeEach(() => {
        mockLLM = new MockLLMAdapter();
    });

    describe('기본 설정', () => {
        it('기본 이름이 "mock"이어야 한다', () => {
            expect(mockLLM.name).toBe('mock');
        });

        it('createMockLLM 헬퍼가 인스턴스를 생성해야 한다', () => {
            const instance = createMockLLM();
            expect(instance).toBeInstanceOf(MockLLMAdapter);
            expect(instance.name).toBe('mock');
        });
    });

    describe('chat() 메서드', () => {
        it('기본 응답을 반환해야 한다', async () => {
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '안녕하세요' }],
            };

            const response = await mockLLM.chat(request);

            expect(response.content).toBe('Mock LLM 응답입니다.');
            expect(response.model).toBe('mock-model');
        });

        it('커스텀 기본 응답을 반환해야 한다', async () => {
            const customMock = new MockLLMAdapter({
                defaultResponse: '커스텀 응답입니다.',
            });
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            const response = await customMock.chat(request);

            expect(response.content).toBe('커스텀 응답입니다.');
        });

        it('setNextResponse로 설정한 응답을 반환해야 한다', async () => {
            mockLLM.setNextResponse('다음 응답');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '질문' }],
            };

            const response = await mockLLM.chat(request);

            expect(response.content).toBe('다음 응답');
        });

        it('setNextResponse 응답은 한 번만 사용되어야 한다', async () => {
            mockLLM.setNextResponse('일회성 응답');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '질문' }],
            };

            const response1 = await mockLLM.chat(request);
            const response2 = await mockLLM.chat(request);

            expect(response1.content).toBe('일회성 응답');
            expect(response2.content).toBe('Mock LLM 응답입니다.');
        });

        it('usage 정보를 포함해야 한다', async () => {
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            const response = await mockLLM.chat(request);

            expect(response.usage).toEqual({
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30,
            });
        });

        it('finishReason이 "stop"이어야 한다', async () => {
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            const response = await mockLLM.chat(request);

            expect(response.finishReason).toBe('stop');
        });

        it('지연 시간을 시뮬레이션해야 한다', async () => {
            const delayedMock = new MockLLMAdapter({ delay: 100 });
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            const start = Date.now();
            await delayedMock.chat(request);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(90); // 약간의 오차 허용
        });
    });

    describe('에러 시뮬레이션', () => {
        it('setError로 인증 에러를 발생시켜야 한다', async () => {
            mockLLM.setError('auth_error');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            await expect(mockLLM.chat(request)).rejects.toThrow(LLMError);
            await expect(mockLLM.chat(request)).resolves.toBeDefined(); // 에러는 한 번만
        });

        it('setError로 rate_limit 에러를 발생시켜야 한다', async () => {
            mockLLM.setError('rate_limit');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            try {
                await mockLLM.chat(request);
                expect.fail('에러가 발생해야 합니다');
            } catch (error) {
                expect(error).toBeInstanceOf(LLMError);
                expect((error as LLMError).type).toBe('rate_limit');
            }
        });

        it('setError로 network_error를 발생시켜야 한다', async () => {
            mockLLM.setError('network_error');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            try {
                await mockLLM.chat(request);
                expect.fail('에러가 발생해야 합니다');
            } catch (error) {
                expect(error).toBeInstanceOf(LLMError);
                expect((error as LLMError).message).toBe('Network error');
            }
        });

        it('clearError로 에러를 초기화해야 한다', async () => {
            mockLLM.setError('auth_error');
            mockLLM.clearError();

            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            await expect(mockLLM.chat(request)).resolves.toBeDefined();
        });

        it('shouldError 설정으로 항상 에러를 발생시켜야 한다', async () => {
            const errorMock = new MockLLMAdapter({ shouldError: true });
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            await expect(errorMock.chat(request)).rejects.toThrow(LLMError);
            await expect(errorMock.chat(request)).rejects.toThrow(LLMError);
        });
    });

    describe('호출 히스토리', () => {
        it('getCallHistory로 호출 기록을 가져와야 한다', async () => {
            const request1: LLMRequest = {
                messages: [{ role: 'user', content: '첫번째' }],
            };
            const request2: LLMRequest = {
                messages: [{ role: 'user', content: '두번째' }],
            };

            await mockLLM.chat(request1);
            await mockLLM.chat(request2);

            const history = mockLLM.getCallHistory();
            expect(history).toHaveLength(2);
            expect(history[0].messages[0].content).toBe('첫번째');
            expect(history[1].messages[0].content).toBe('두번째');
        });

        it('getLastCall로 마지막 호출을 가져와야 한다', async () => {
            await mockLLM.chat({ messages: [{ role: 'user', content: '첫번째' }] });
            await mockLLM.chat({ messages: [{ role: 'user', content: '마지막' }] });

            const lastCall = mockLLM.getLastCall();
            expect(lastCall?.messages[0].content).toBe('마지막');
        });

        it('getCallCount로 호출 횟수를 가져와야 한다', async () => {
            expect(mockLLM.getCallCount()).toBe(0);

            await mockLLM.chat({ messages: [{ role: 'user', content: '1' }] });
            await mockLLM.chat({ messages: [{ role: 'user', content: '2' }] });
            await mockLLM.chat({ messages: [{ role: 'user', content: '3' }] });

            expect(mockLLM.getCallCount()).toBe(3);
        });

        it('clearHistory로 히스토리를 초기화해야 한다', async () => {
            await mockLLM.chat({ messages: [{ role: 'user', content: '테스트' }] });
            expect(mockLLM.getCallCount()).toBe(1);

            mockLLM.clearHistory();

            expect(mockLLM.getCallCount()).toBe(0);
            expect(mockLLM.getCallHistory()).toEqual([]);
        });

        it('reset으로 전체 상태를 초기화해야 한다', async () => {
            mockLLM.setNextResponse('커스텀');
            await mockLLM.chat({ messages: [{ role: 'user', content: '테스트' }] });

            mockLLM.reset();

            expect(mockLLM.getCallCount()).toBe(0);
            const response = await mockLLM.chat({ messages: [{ role: 'user', content: '새로운' }] });
            expect(response.content).toBe('Mock LLM 응답입니다.');
        });
    });

    describe('stream() 메서드', () => {
        it('응답을 청크로 스트리밍해야 한다', async () => {
            mockLLM.setNextResponse('안녕 하세요');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '인사해줘' }],
            };

            const chunks: string[] = [];
            for await (const chunk of mockLLM.stream(request)) {
                chunks.push(chunk.content);
            }

            expect(chunks.join('')).toBe('안녕 하세요');
        });

        it('마지막 청크의 done이 true여야 한다', async () => {
            mockLLM.setNextResponse('테스트');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            let lastChunk = { content: '', done: false };
            for await (const chunk of mockLLM.stream(request)) {
                lastChunk = chunk;
            }

            expect(lastChunk.done).toBe(true);
        });

        it('스트리밍 호출도 히스토리에 기록되어야 한다', async () => {
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '스트리밍 테스트' }],
            };

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const _ of mockLLM.stream(request)) {
                // 청크 소비
            }

            expect(mockLLM.getCallCount()).toBe(1);
            expect(mockLLM.getLastCall()?.messages[0].content).toBe('스트리밍 테스트');
        });

        it('AbortSignal로 스트리밍을 취소할 수 있어야 한다', async () => {
            const longMock = new MockLLMAdapter({
                defaultResponse: '매우 긴 응답 메시지 입니다 청크가 많이 생깁니다',
                streamDelay: 50,
            });

            const controller = new AbortController();
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
                signal: controller.signal,
            };

            const chunks: string[] = [];
            try {
                for await (const chunk of longMock.stream(request)) {
                    chunks.push(chunk.content);
                    if (chunks.length >= 2) {
                        controller.abort();
                    }
                }
            } catch (error) {
                expect((error as Error).name).toBe('AbortError');
            }

            // 중간에 취소되었으므로 전체 메시지보다 적어야 함
            expect(chunks.length).toBeLessThan(10);
        });

        it('스트리밍 중 에러가 발생해야 한다', async () => {
            mockLLM.setError('rate_limit');
            const request: LLMRequest = {
                messages: [{ role: 'user', content: '테스트' }],
            };

            await expect(async () => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                for await (const _ of mockLLM.stream(request)) {
                    // 청크 소비
                }
            }).rejects.toThrow(LLMError);
        });
    });
});
