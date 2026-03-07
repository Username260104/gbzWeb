
import { createClient } from '@/lib/supabase/server';
import { EVENT_STATUS, HTTP_STATUS, API_ERROR_MSG } from '@/lib/constants';
import { apiResponse, apiError, handleApiError } from '@/lib/api-error';

/**
 * GET /api/events
 * 이벤트 목록 전체 조회
 * - 로그인된 관리자는 전체 목록(draft 포함)을 볼 수 있음
 * - 일반/익명 사용자는 `status != draft` 이벤트만 볼 수 있음 (RLS 통해 걸러짐)
 */
export async function GET(request: Request) {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let query = supabase.from('events').select('*').order('date', { ascending: false });

    // 필터를 명시한 경우 조건 추가
    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data: events, error } = await query;

    if (error) {
        handleApiError(error, 'Fetch Events');
        return apiError(API_ERROR_MSG.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return apiResponse(events);
}

/**
 * POST /api/events
 * 신규 이벤트 생성 (관리자 전용)
 */
export async function POST(request: Request) {
    const supabase = await createClient();

    // 관리자 여부 확인 (세션 체크)
    const {
        data: { session },
        error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
        return apiError(API_ERROR_MSG.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    try {
        const body = await request.json();

        // 필수 필드 기본 검증
        const { title, date, location, template_type, capacity, status } = body;

        if (!title || !date || !location || capacity === undefined) {
            return apiError('Missing required fields: title, date, location, capacity', HTTP_STATUS.BAD_REQUEST);
        }

        const { data: newEvent, error: insertError } = await supabase
            .from('events')
            .insert({
                title,
                date,
                location,
                template_type: template_type || null,
                capacity: Number(capacity),
                course: body.course || null,
                distance_km: body.distance_km || null,
                after_activity: body.after_activity || null,
                status: status || EVENT_STATUS.DRAFT, // 기본값 draft
                created_by: session.user.id // 토큰의 user id 참조
            })
            .select()
            .single();

        if (insertError) {
            handleApiError(insertError, 'Insert Event');
            return apiError(API_ERROR_MSG.DB_INSERT_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return apiResponse(newEvent, HTTP_STATUS.CREATED);
    } catch (e) {
        return handleApiError(e, 'POST Event Exception');
    }
}
