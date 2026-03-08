
import { createAdminClient } from '@/lib/supabase/server';
import { REGISTRATION_STATUS, HTTP_STATUS, API_ERROR_MSG, DB_ERROR_CODE } from '@/lib/constants';
import { normalizePhone } from '@/lib/utils';
import { apiResponse, apiError, handleApiError } from '@/lib/api-error';

// POST: 게스트 신청 처리 (guests upsert + registrations insert)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventId, name, phone, course, pace, consentGiven } = body;

        // 필수 필드 검사
        if (!eventId || !name || !phone || !pace || !consentGiven) {
            return apiError(API_ERROR_MSG.MISSING_PARAMS, HTTP_STATUS.BAD_REQUEST);
        }

        // 전화번호 정규화 처리
        const normalizedPhone = normalizePhone(phone);
        if (!normalizedPhone) {
            return apiError('유효하지 않은 전화번호 형식입니다.', HTTP_STATUS.BAD_REQUEST);
        }

        // 서비스 역할 키를 사용하는 클라이언트로 변경 (RLS 바이패스 또는 권한 획득 목적) 
        // 외부 사용자(익명)가 guests 테이블에 upsert 하고 registrations에 insert 해야 하므로
        // public RLS를 허용하거나, service_role 클라이언트를 사용해야 한다.
        // SPEC에 익명 사용자의 읽기가 제한된다고 되어 있으므로, 신청 과정은 시스템 권한으로 처리.
        // 이부분은 환경변수 설정과 연계되어야 함을 유의.
        const supabase = createAdminClient();

        // 0. 코스 보정
        // - 신청 폼에서 코스 입력을 제거했으므로, 이벤트 기본 코스를 우선 사용한다.
        // - 이벤트 코스도 비어있으면 DB NOT NULL 제약을 만족하도록 기본값을 사용한다.
        let resolvedCourse = typeof course === 'string' && course.trim() ? course.trim() : '';
        if (!resolvedCourse) {
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select('course')
                .eq('id', eventId)
                .single();

            if (eventError) {
                handleApiError(eventError, 'Registration API - Event Course Fetch');
                return apiError(API_ERROR_MSG.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
            }

            resolvedCourse = eventData?.course?.trim() || '미정';
        }

        // 1. guests 테이블 Upsert (전화번호 기준)
        const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .upsert(
                { phone: normalizedPhone, name },
                { onConflict: 'phone' } // phone을 기준으로 충돌 시 업데이트되도록
            )
            .select()
            .single();

        if (guestError) {
            handleApiError(guestError, 'Registration API - Guest Upsert');
            return apiError(API_ERROR_MSG.DB_INSERT_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const guestId = guestData.id;

        // 2. registrations 테이블 Insert
        const { error: regError } = await supabase
            .from('registrations')
            .insert({
                event_id: eventId,
                guest_id: guestId,
                course: resolvedCourse,
                pace,
                status: REGISTRATION_STATUS.PENDING, // 기본 상태
                consent_given: consentGiven,
                // 특이사항은 DB 스키마에 notes 컬럼이 없으면 저장할 수 없으나, SPEC에 특이사항이 기술되어있음.
                // init_schema.sql 확인 필요. 만약 없으면 무시.
            });

        if (regError) {
            // 중복 신청 에러 처리 (UNIQUE 제약)
            if (regError.code === DB_ERROR_CODE.UNIQUE_VIOLATION) {
                return apiError(API_ERROR_MSG.DUPLICATE_REGISTRATION, HTTP_STATUS.CONFLICT);
            }
            // 트리거 정원 초과 예외 처리
            if (regError.message && regError.message.includes('capacity')) {
                return apiError(API_ERROR_MSG.CAPACITY_FULL, HTTP_STATUS.BAD_REQUEST);
            }

            handleApiError(regError, 'Registration API - Insert');
            return apiError(API_ERROR_MSG.DB_INSERT_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return apiResponse({ success: true }, HTTP_STATUS.CREATED);

    } catch (error) {
        return handleApiError(error, 'Registration API');
    }
}
