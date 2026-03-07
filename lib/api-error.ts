import { NextResponse } from 'next/server';
import { maskPhone } from '@/lib/utils';
import { HTTP_STATUS, API_ERROR_MSG } from '@/lib/constants';

/**
 * API 성공 응답을 생성하는 래퍼 함수
 */
export function apiResponse(data: unknown, status: number = HTTP_STATUS.OK) {
    return NextResponse.json(data, { status });
}

/**
 * API 에러 응답을 생성하는 래퍼 함수
 */
export function apiError(message: string, status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return NextResponse.json({ error: message }, { status });
}

/**
 * API 라우트 catch 블록 관리를 위한 공통 에러 핸들러
 * - 서버 로그 출력 및 안전한 응답 반환 처리
 * - 보안 원칙(Phase 1-F)에 따라 로그 내 전화번호 자동 마스킹 적용
 */
export function handleApiError(error: unknown, context?: string) {
    // 1. 에러를 문자열화하여 전화번호 패턴 검출 및 마스킹된 로그 생성 (보안 조치)
    let errorMessage = '';

    if (error instanceof Error) {
        errorMessage = error.message;
        if ('code' in error && 'details' in error) {
            // Supabase/PostgREST 에러 객체인 경우
            errorMessage += ` | Code: ${(error as { code: string }).code} | Details: ${(error as { details: string }).details}`;
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        try {
            errorMessage = JSON.stringify(error);
        } catch {
            errorMessage = String(error);
        }
    }

    // 마스킹 처리하여 안전한 로그 기록
    const safeLogMessage = maskPhone(errorMessage);
    const prefix = context ? `[API Error: ${context}]` : '[API Error]';
    console.error(`${prefix} ${safeLogMessage}`);

    // 원본 에러 객체 자체를 로깅할 경우 내부 객체 속성에 전화번호가 노출될 수 있으므로,
    // 의도적으로 console.error(error) 형태의 호출을 지양하고 위 safeLogMessage로 대체함.

    // 2. 일관된 HTTP 500 응답 반환 (클라이언트에는 민감 정보 미노출)
    return apiError(API_ERROR_MSG.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
