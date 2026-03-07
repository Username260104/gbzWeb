/**
 * 프로젝트 전역 상수 정의
 * - 매직 넘버 하드코딩 금지 원칙 (CONVENTIONS.md)
 */

// ── 이벤트 관련 ──
/** 이벤트 상태 값 */
export const EVENT_STATUS = {
    DRAFT: 'draft',
    OPEN: 'open',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
} as const;

/** 이벤트 템플릿 타입 */
export const TEMPLATE_TYPE = {
    REGULAR: 'regular',
    SPEED: 'speed',
    COLLAB: 'collab',
    RACE: 'race',
} as const;

/** 템플릿별 기본 정원 */
export const DEFAULT_CAPACITY: Record<string, number> = {
    [TEMPLATE_TYPE.REGULAR]: 25,
    [TEMPLATE_TYPE.SPEED]: 15,
    [TEMPLATE_TYPE.COLLAB]: 20,
    [TEMPLATE_TYPE.RACE]: 0, // 정원 없음
};

// ── 신청(등록) 관련 ──
/** 신청 상태 값 */
export const REGISTRATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
} as const;

/** 페이스 4단계 선택지 */
export const PACE_OPTIONS = [
    { label: '~5:30', value: '~5:30' },
    { label: '5:30~6:30', value: '5:30~6:30' },
    { label: '6:30~7:30', value: '6:30~7:30' },
    { label: '7:30+', value: '7:30+' },
] as const;

/** 기본 코스 선택지 */
export const DEFAULT_COURSE_OPTIONS = [
    { label: '10km', value: '10km' },
    { label: '5km', value: '5km' },
] as const;

// ── 성능·UX 관련 ──
/** 중복 검사 디바운스 시간 (ms) */
export const DUPLICATE_CHECK_DEBOUNCE_MS = 500;

// ── 개인정보 보호 ──
/** 개인정보 보관 기한 (일) */
export const PRIVACY_RETENTION_DAYS = 365;

/** 페이스·코스 보관 기한 (일) */
export const ACTIVITY_DATA_RETENTION_DAYS = 180;

// ── 데이터베이스 오류 코드 ──
/** PostgreSQL / Supabase 에러 코드 */
export const DB_ERROR_CODE = {
    UNIQUE_VIOLATION: '23505',
    NO_ROWS_FOUND: 'PGRST116',
} as const;

// ── HTTP 상태 코드 ──
/** 자주 사용되는 HTTP 상태 코드 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// ── API 응답 메시지 ──
/** 공통 에러 메시지 */
export const API_ERROR_MSG = {
    MISSING_PARAMS: '필수 항목이 누락되었습니다.',
    UNAUTHORIZED: '인증되지 않은 요청입니다.',
    SERVER_ERROR: '서버 오류가 발생했습니다.',
    DB_INSERT_FAIL: '정보 저장에 실패했습니다.',
    DB_UPDATE_FAIL: '정보 수정에 실패했습니다.',
    DUPLICATE_REGISTRATION: '이미 신청 완료된 이벤트입니다.',
    CAPACITY_FULL: '정원이 마감되어 신청할 수 없습니다.',
    NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
} as const;
