/**
 * 채팅 에러 관련 타입 정의
 */

/**
 * 에러 타입
 */
export type ChatErrorType =
    | 'network' // 네트워크 오류
    | 'timeout' // 타임아웃
    | 'api' // API 오류 (4xx, 5xx)
    | 'validation' // 유효성 검사 실패
    | 'abort' // 사용자 취소
    | 'unknown'; // 알 수 없는 오류

/**
 * 채팅 에러 인터페이스
 */
export interface ChatError {
    /** 에러 타입 */
    type: ChatErrorType;
    /** 에러 메시지 */
    message: string;
    /** HTTP 상태 코드 (있는 경우) */
    statusCode?: number;
    /** 재시도 가능 여부 */
    retryable: boolean;
    /** 원본 에러 */
    originalError?: unknown;
}

/**
 * 에러 생성 헬퍼
 */
export const createChatError = (error: unknown): ChatError => {
    // AbortError (사용자 취소)
    if (error instanceof DOMException && error.name === 'AbortError') {
        return {
            type: 'abort',
            message: '요청이 취소되었습니다.',
            retryable: false,
        };
    }

    // TypeError (네트워크 오류)
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
            type: 'network',
            message: '네트워크 연결을 확인해주세요.',
            retryable: true,
            originalError: error,
        };
    }

    // HTTP 에러 응답
    if (error instanceof Response || (error as { status?: number })?.status) {
        const status = (error as { status: number }).status;
        return createHttpError(status, error);
    }

    // 일반 Error
    if (error instanceof Error) {
        // 타임아웃
        if (error.message.toLowerCase().includes('timeout')) {
            return {
                type: 'timeout',
                message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
                retryable: true,
                originalError: error,
            };
        }

        return {
            type: 'unknown',
            message: error.message || '알 수 없는 오류가 발생했습니다.',
            retryable: true,
            originalError: error,
        };
    }

    // 알 수 없는 타입
    return {
        type: 'unknown',
        message: '알 수 없는 오류가 발생했습니다.',
        retryable: true,
        originalError: error,
    };
};

/**
 * HTTP 상태 코드별 에러 생성
 */
const createHttpError = (status: number, originalError: unknown): ChatError => {
    const baseError = {
        statusCode: status,
        originalError,
    };

    if (status === 401 || status === 403) {
        return {
            ...baseError,
            type: 'api',
            message: '인증에 실패했습니다. API 키를 확인해주세요.',
            retryable: false,
        };
    }

    if (status === 429) {
        return {
            ...baseError,
            type: 'api',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            retryable: true,
        };
    }

    if (status >= 500) {
        return {
            ...baseError,
            type: 'api',
            message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            retryable: true,
        };
    }

    return {
        ...baseError,
        type: 'api',
        message: `요청 처리 중 오류가 발생했습니다. (${status})`,
        retryable: status >= 500,
    };
};

/**
 * 에러 메시지 표시용 텍스트
 */
export const getErrorDisplayMessage = (error: ChatError): string => {
    switch (error.type) {
        case 'network':
            return '네트워크가 불안정합니다. 연결을 확인 후 다시 시도해주세요.';
        case 'timeout':
            return '응답 시간이 초과되었습니다. 다시 시도해주세요.';
        case 'abort':
            return '요청이 취소되었습니다.';
        case 'validation':
            return error.message;
        case 'api':
            return error.message;
        default:
            return '요청하신 내용을 처리하지 못했습니다. 다시 시도해주세요.';
    }
};
