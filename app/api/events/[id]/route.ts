
import { createClient } from '@/lib/supabase/server';
import { HTTP_STATUS, API_ERROR_MSG, DB_ERROR_CODE } from '@/lib/constants';
import { apiResponse, apiError, handleApiError } from '@/lib/api-error';
import { requireAdminUser } from '@/lib/admin-auth';

const EVENT_UPDATE_FIELDS = [
    'title',
    'date',
    'location',
    'template_type',
    'capacity',
    'course',
    'distance_km',
    'after_activity',
    'status',
] as const;

type EventUpdateField = (typeof EVENT_UPDATE_FIELDS)[number];

function buildEventUpdatePayload(body: Record<string, unknown>) {
    const payload: Partial<Record<EventUpdateField, unknown>> = {};

    for (const field of EVENT_UPDATE_FIELDS) {
        if (body[field] !== undefined) {
            payload[field] = body[field];
        }
    }

    if (payload.capacity !== undefined) {
        const capacity = Number(payload.capacity);
        if (!Number.isFinite(capacity) || capacity < 0) {
            return { error: apiError('capacity는 0 이상의 숫자여야 합니다.', HTTP_STATUS.BAD_REQUEST) };
        }
        payload.capacity = capacity;
    }

    if (payload.distance_km !== undefined) {
        if (payload.distance_km === null || payload.distance_km === '') {
            payload.distance_km = null;
        } else {
            const distance = Number(payload.distance_km);
            if (!Number.isFinite(distance) || distance < 0) {
                return { error: apiError('distance_km은 0 이상의 숫자여야 합니다.', HTTP_STATUS.BAD_REQUEST) };
            }
            payload.distance_km = distance;
        }
    }

    if (Object.keys(payload).length === 0) {
        return { error: apiError('업데이트할 필드가 없습니다.', HTTP_STATUS.BAD_REQUEST) };
    }

    return { payload };
}

async function requireAdminSession() {
    const supabase = await createClient();
    const {
        data: { session },
        error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
        return {
            supabase: null,
            error: apiError(API_ERROR_MSG.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED),
        };
    }
    const adminError = requireAdminUser(session.user);
    if (adminError) {
        return {
            supabase: null,
            error: adminError,
        };
    }

    return { supabase, error: null };
}

/**
 * GET /api/events/[id]
 * - 단일 이벤트 조회
 * - 로그인된 사용자(관리자)는 모두 볼 수 있음
 * - 일반/익명 사용자는 `status != draft` 이벤트만 볼 수 있음 (RLS 통해 걸러짐)
 */
export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === DB_ERROR_CODE.NO_ROWS_FOUND) {
            return apiError(API_ERROR_MSG.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }
        handleApiError(error, 'Fetch Single Event');
        return apiError(API_ERROR_MSG.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return apiResponse(event);
}

/**
 * PATCH /api/events/[id]
 * - 기존 이벤트 수정 (상태 변경 등)
 * - 관리자 전용 (세션 확인)
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const adminResult = await requireAdminSession();
    if (adminResult.error) {
        return adminResult.error;
    }
    const { supabase } = adminResult;
    if (!supabase) {
        return apiError(API_ERROR_MSG.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    try {
        const body = await request.json() as Record<string, unknown>;
        const updateBuildResult = buildEventUpdatePayload(body);
        if (updateBuildResult.error) {
            return updateBuildResult.error;
        }
        const { payload } = updateBuildResult;

        // 업데이트 쿼리
        const { data: updatedEvent, error: updateError } = await supabase
            .from('events')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            handleApiError(updateError, 'Update Event');
            return apiError(API_ERROR_MSG.DB_UPDATE_FAIL, HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }

        return apiResponse(updatedEvent, HTTP_STATUS.OK);
    } catch (e) {
        return handleApiError(e, 'PATCH Event Exception');
    }
}

/**
 * DELETE /api/events/[id]
 * - 이벤트 삭제 (또는cancelled 처리)
 * - 관리자 전용
 */
export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const adminResult = await requireAdminSession();
    if (adminResult.error) {
        return adminResult.error;
    }
    const { supabase } = adminResult;
    if (!supabase) {
        return apiError(API_ERROR_MSG.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    // 실제 레코드를 삭제하거나 status를 cancelled로 변경
    // PRD 4.1 상태 머신에서 "cancelled: 이벤트 취소 (삭제 대신 사용)" 라 했음
    // 그러나 RLS 정책 상 실제 삭제 기능도 제공 가능
    const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (deleteError) {
        handleApiError(deleteError, 'Delete Event');
        return apiError(API_ERROR_MSG.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return apiResponse({ message: 'Event successfully deleted' }, HTTP_STATUS.OK);
}
