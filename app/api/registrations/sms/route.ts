import { createClient } from '@/lib/supabase/server';
import { apiError, apiResponse, handleApiError } from '@/lib/api-error';
import { requireAdminUser } from '@/lib/admin-auth';
import { HTTP_STATUS, REGISTRATION_STATUS } from '@/lib/constants';
import { isSmsConfigured, sendSms } from '@/lib/sms';

type SmsFilter = 'all' | 'confirmed' | 'pending';

const ALLOWED_FILTERS = new Set<SmsFilter>(['all', 'confirmed', 'pending']);
const MAX_SMS_LENGTH = 90;

// POST: 특정 이벤트 참가자에게 일괄 문자 발송
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const eventId = typeof body.eventId === 'string' ? body.eventId : '';
        const filter = typeof body.filter === 'string' ? body.filter : '';
        const message = typeof body.message === 'string' ? body.message.trim() : '';

        if (!eventId || !filter || !message) {
            return apiError('eventId, filter, message는 필수입니다.', HTTP_STATUS.BAD_REQUEST);
        }

        if (!ALLOWED_FILTERS.has(filter as SmsFilter)) {
            return apiError('유효하지 않은 필터입니다.', HTTP_STATUS.BAD_REQUEST);
        }

        if (message.length > MAX_SMS_LENGTH) {
            return apiError(`문자 내용은 ${MAX_SMS_LENGTH}자 이하여야 합니다.`, HTTP_STATUS.BAD_REQUEST);
        }
        if (!isSmsConfigured()) {
            return apiError('SMS 발송 설정이 누락되었습니다. SMS_API_URL, SMS_SENDER를 확인해주세요.', HTTP_STATUS.BAD_REQUEST);
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const adminError = requireAdminUser(user);
        if (adminError) return adminError;

        let query = supabase
            .from('registrations')
            .select(`
                id,
                status,
                guests (
                    name,
                    phone
                )
            `)
            .eq('event_id', eventId);

        if (filter === 'confirmed') {
            query = query.eq('status', REGISTRATION_STATUS.CONFIRMED);
        }
        if (filter === 'pending') {
            query = query.eq('status', REGISTRATION_STATUS.PENDING);
        }

        const { data: registrations, error: regError } = await query;

        if (regError) {
            return apiError('문자 대상 조회에 실패했습니다.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        const targets = (registrations || [])
            .map((reg: Record<string, unknown>) => {
                const guest = reg.guests as { name?: string; phone?: string } | { name?: string; phone?: string }[] | null;
                const guestInfo = Array.isArray(guest) ? guest[0] : guest;

                return {
                    registrationId: String(reg.id || ''),
                    name: guestInfo?.name?.trim() || '참가자',
                    phone: guestInfo?.phone?.trim() || '',
                };
            })
            .filter((item) => item.registrationId && item.phone);

        if (targets.length === 0) {
            return apiResponse({
                success: true,
                sentCount: 0,
                failedCount: 0,
                failures: [],
            });
        }

        const failures: Array<{ registrationId: string; name: string; reason: string }> = [];
        let sentCount = 0;

        for (const target of targets) {
            const personalized = message.replaceAll('{이름}', target.name);

            try {
                await sendSms({
                    to: target.phone,
                    text: personalized,
                });
                sentCount += 1;
            } catch (error) {
                const reason = error instanceof Error ? error.message : '알 수 없는 오류';
                failures.push({
                    registrationId: target.registrationId,
                    name: target.name,
                    reason,
                });
            }
        }

        return apiResponse({
            success: true,
            sentCount,
            failedCount: failures.length,
            failures,
        });

    } catch (error) {
        return handleApiError(error, 'Bulk SMS POST Error');
    }
}
