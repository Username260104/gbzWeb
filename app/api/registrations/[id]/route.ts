
import { createClient } from '@/lib/supabase/server';
import { REGISTRATION_STATUS, HTTP_STATUS, API_ERROR_MSG } from '@/lib/constants';
import { apiResponse, apiError, handleApiError } from '@/lib/api-error';
import { requireAdminUser } from '@/lib/admin-auth';
import { formatDateKR } from '@/lib/utils';
import { isSmsConfigured, sendSms } from '@/lib/sms';

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

        const adminError = requireAdminUser(user);
        if (adminError) return adminError;

        const { data: existing, error: fetchError } = await supabase
            .from('registrations')
            .select(`
                status,
                guests (
                    name,
                    phone
                ),
                events (
                    title,
                    date
                )
            `)
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return apiError(API_ERROR_MSG.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        const previousStatus = existing.status;

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

        const isAutoSmsTarget =
            previousStatus === REGISTRATION_STATUS.PENDING &&
            status === REGISTRATION_STATUS.CONFIRMED;

        if (isAutoSmsTarget) {
            const guest = Array.isArray(existing.guests) ? existing.guests[0] : existing.guests;
            const event = Array.isArray(existing.events) ? existing.events[0] : existing.events;

            const guestName = guest?.name?.trim() || '참가자';
            const guestPhone = guest?.phone?.trim() || '';
            const eventTitle = event?.title?.trim() || '이벤트';
            const eventDate = event?.date ? formatDateKR(event.date) : '-';

            if (guestPhone && isSmsConfigured()) {
                try {
                    await sendSms({
                        to: guestPhone,
                        text: `[GBZ] ${guestName}님, ${eventTitle} 참가가 확정되었습니다! 일시: ${eventDate}`,
                    });
                } catch (smsError) {
                    const reason = smsError instanceof Error ? smsError.message : '알 수 없는 오류';
                    console.error(`[SMS Error: Registration Confirm Auto SMS] ${reason}`);
                }
            }
        }

        return apiResponse({ success: true, status });

    } catch (error) {
        return handleApiError(error, 'Registration PATCH Error');
    }
}
