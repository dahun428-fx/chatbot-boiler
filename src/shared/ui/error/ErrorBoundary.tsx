import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

export interface FallbackProps {
    error: Error;
    errorInfo?: ErrorInfo | null;
    resetError: () => void;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    /** 에러 발생 시 표시할 컴포넌트 */
    fallback?: ReactNode | ((props: FallbackProps) => ReactNode);
    /** 에러 발생 시 호출되는 콜백 */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** 에러 로깅을 위한 컨텍스트 정보 */
    context?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary 컴포넌트
 *
 * 자식 컴포넌트에서 발생하는 JavaScript 에러를 포착하고
 * fallback UI를 표시합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // 함수형 fallback (에러 정보 접근)
 * <ErrorBoundary
 *   fallback={({ error, resetError }) => (
 *     <div>
 *       <p>오류: {error.message}</p>
 *       <button onClick={resetError}>다시 시도</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // 에러 로깅
 * <ErrorBoundary
 *   context="ChatRoom"
 *   onError={(error, info) => trackError(error, info)}
 * >
 *   <ChatRoom />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        const { onError, context } = this.props;

        // 에러 콜백 호출
        if (onError) {
            onError(error, errorInfo);
        }

        // 콘솔 로깅
        console.error(`[ErrorBoundary${context ? `:${context}` : ''}] Error caught:`, error);
        console.error('Component stack:', errorInfo.componentStack);
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallback } = this.props;

        if (hasError && error) {
            // 함수형 fallback
            if (typeof fallback === 'function') {
                return fallback({
                    error,
                    errorInfo,
                    resetError: this.resetError,
                });
            }

            // 노드 fallback
            if (fallback) {
                return fallback;
            }

            // 기본 fallback
            return (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg bg-red-50 p-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-red-800">오류가 발생했습니다</h3>
                        <p className="mt-1 text-sm text-red-600">{error.message}</p>
                    </div>
                    <button
                        onClick={this.resetError}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        다시 시도
                    </button>
                </div>
            );
        }

        return children;
    }
}
