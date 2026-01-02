/**
 * 메시지 관련 설정 상수
 */
export const MESSAGE_CONFIG = {
    /** API 타임아웃 (30초) */
    TIMEOUT_MS: 30_000,
    /** 세션 TTL (60분) */
    SESSION_TTL_MS: 60 * 60 * 1000,
} as const;

/**
 * 병원 인텐트 코드
 */
export const INTENT_CODES = {
    HOSPITAL: 'INT016',
} as const;
