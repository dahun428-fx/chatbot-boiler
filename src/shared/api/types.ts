/**
 * API 기본 응답 타입
 */
export interface ApiBasicResponse {
    status?: string;
    statusCode?: number;
    error?: string;
    message?: string;
    [key: string]: unknown;
}
