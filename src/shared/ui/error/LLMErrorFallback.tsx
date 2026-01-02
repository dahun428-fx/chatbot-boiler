import { LLMError } from '@/shared/api/llm';

import type { FallbackProps } from './ErrorBoundary';

interface LLMErrorFallbackProps extends FallbackProps {
    /** 재시도 가능한 에러인 경우 true */
    canRetry?: boolean;
}

/**
 * LLM 에러 전용 Fallback 컴포넌트
 *
 * LLM API 호출 중 발생한 에러를 사용자 친화적으로 표시합니다.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(props) => <LLMErrorFallback {...props} />}
 * >
 *   <ChatRoom />
 * </ErrorBoundary>
 * ```
 */
export function LLMErrorFallback({ error, resetError, canRetry = true }: LLMErrorFallbackProps) {
    const isLLMError = error instanceof LLMError;

    const getErrorInfo = () => {
        if (!isLLMError) {
            return {
                title: '오류가 발생했습니다',
                description: error.message || '알 수 없는 오류가 발생했습니다.',
                icon: '⚠️',
                showRetry: canRetry,
            };
        }

        switch (error.type) {
            case 'auth_error':
                return {
                    title: '인증 오류',
                    description: 'API 키가 유효하지 않거나 권한이 없습니다. 설정을 확인해주세요.',
                    icon: '🔐',
                    showRetry: false,
                };

            case 'rate_limit':
                return {
                    title: '요청 한도 초과',
                    description: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
                    icon: '⏱️',
                    showRetry: true,
                };

            case 'invalid_request':
                return {
                    title: '잘못된 요청',
                    description: '요청 형식이 올바르지 않습니다.',
                    icon: '❌',
                    showRetry: false,
                };

            case 'network_error':
                return {
                    title: '네트워크 오류',
                    description: '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
                    icon: '📡',
                    showRetry: true,
                };

            case 'timeout':
                return {
                    title: '응답 시간 초과',
                    description: '서버 응답이 너무 오래 걸립니다. 다시 시도해주세요.',
                    icon: '⏰',
                    showRetry: true,
                };

            default:
                return {
                    title: 'AI 서비스 오류',
                    description: error.message || '일시적인 문제가 발생했습니다.',
                    icon: '🤖',
                    showRetry: true,
                };
        }
    };

    const errorInfo = getErrorInfo();

    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-gray-50 p-6">
            <div className="text-4xl">{errorInfo.icon}</div>

            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{errorInfo.title}</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-600">{errorInfo.description}</p>
            </div>

            {isLLMError && error.statusCode && (
                <p className="text-xs text-gray-400">오류 코드: {error.statusCode}</p>
            )}

            {errorInfo.showRetry && (
                <button
                    onClick={resetError}
                    className="rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                    다시 시도
                </button>
            )}

            {!errorInfo.showRetry && (
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                    페이지 새로고침
                </button>
            )}
        </div>
    );
}
