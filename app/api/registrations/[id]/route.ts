
import { createClient } from '@/lib/supabase/server';
import { REGISTRATION_STATUS, HTTP_STATUS, API_ERROR_MSG } from '@/lib/constants';
import { apiResponse, apiError, handleApiError } from '@/lib/api-error';

// PATCH: 참가 신청 상태 변경 (확정 / 취소 / 대기)
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        const { status } = body;

        // 상태 유효성 검사
        const validStatuses = Object.values(REGISTRATION_STATUS);
        if (!validStatuses.includes(status)) {
            return apiError('유효하지 않은 상태값입니다.', HTTP_STATUS.BAD_REQUEST);
        }

        // 인증 확인 (관리자만 접근 가능, middleware에서도 검증하지만 2중 검증)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return apiError(API_ERROR_MSG.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
        }

        // 상태 업데이트
        // 참고: visit_count 증가는 DB Trigger(trg_visit_count)에 의해 자동 처리됨
        const { error } = await supabase
            .from('registrations')
            .update({ status })
            .eq('id', id);

        if (error) {
            handleApiError(error, 'Registration Update Status');
            return apiError(API_ERROR_MSG.DB_UPDATE_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return apiResponse({ success: true, status });

    } catch (error) {
        return handleApiError(error, 'Registration PATCH Error');
    }
}
