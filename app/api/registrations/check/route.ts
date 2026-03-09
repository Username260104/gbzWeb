
import { createAdminClient } from '@/lib/supabase/server';
import { HTTP_STATUS, API_ERROR_MSG, DB_ERROR_CODE } from '@/lib/constants';
import { normalizePhone } from '@/lib/utils';
import { apiResponse, apiError, handleApiError } from '@/lib/api-error';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const phone = searchParams.get('phone');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!eventId || !phone) {
        return apiError(API_ERROR_MSG.MISSING_PARAMS, HTTP_STATUS.BAD_REQUEST);
    }

    // 전화번호 정규화
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
        return apiError('유효하지 않은 전화번호 형식입니다.', HTTP_STATUS.BAD_REQUEST);
    }
    const ipLimit = checkRateLimit(`registration-check:ip:${ip}`, 60, 60_000);
    if (!ipLimit.allowed) {
        return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', HTTP_STATUS.TOO_MANY_REQUESTS);
    }

    try {
        const supabase = createAdminClient();

        // 게스트 ID 조회 (전화번호 기준)
        const { data: guest } = await supabase
            .from('guests')
            .select('id')
            .eq('phone', normalizedPhone)
            .single();

        if (!guest) {
            // 게스트 정보가 없으면 당연히 신청 내역도 없음
            return apiResponse({ exists: false });
        }

        // 해당 이벤트에 이 게스트가 신청했는지 확인
        const { data: registration, error } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', eventId)
            .eq('guest_id', guest.id)
            .single();

        if (error && error.code !== DB_ERROR_CODE.NO_ROWS_FOUND) {
            handleApiError(error, 'Check Registration Duplicate');
            return apiError('Database check failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return apiResponse({ exists: !!registration });
    } catch (error) {
        return handleApiError(error, 'Check Registration Route');
    }
}
