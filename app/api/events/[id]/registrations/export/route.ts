import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatDateKR } from '@/lib/utils';
import { HTTP_STATUS, API_ERROR_MSG, REGISTRATION_STATUS } from '@/lib/constants';
import { handleApiError } from '@/lib/api-error';

// GET: 특정 이벤트의 전체 참가자 명단을 CSV 형태로 반환
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const getStatusLabel = (status: string) => {
            switch (status) {
                case REGISTRATION_STATUS.PENDING:
                    return '대기';
                case REGISTRATION_STATUS.CONFIRMED:
                    return '확정';
                case REGISTRATION_STATUS.CHECKED_IN:
                    return '출석';
                case REGISTRATION_STATUS.CANCELLED:
                    return '취소됨';
                default:
                    return status;
            }
        };

        const eventId = params.id;

        // 관리자 인증 확인
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse(API_ERROR_MSG.UNAUTHORIZED, { status: HTTP_STATUS.UNAUTHORIZED });
        }

        // 1. 이벤트 기본 정보 조회 (파일명 생성용)
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('title, date')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return new NextResponse(API_ERROR_MSG.NOT_FOUND, { status: HTTP_STATUS.NOT_FOUND });
        }

        // 2. 전체 참가자 데이터 조회 (registrations JOIN guests)
        const { data: registrations, error: regError } = await supabase
            .from('registrations')
            .select(`
                id,
                course,
                pace,
                status,
                created_at,
                guests (
                    name,
                    phone,
                    visit_count
                )
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });

        if (regError) {
            handleApiError(regError, 'CSV Export Registration Query');
            return new NextResponse(API_ERROR_MSG.SERVER_ERROR, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
        }

        // 3. CSV 포맷 변환
        // BOM(Byte Order Mark)을 추가하여 엑셀(Excel)에서 UTF-8 한글이 깨지지 않도록 처리
        const BOM = '\uFEFF';
        let csvContent = BOM + '이름,전화번호,코스,페이스,상태,신청일시,누적참여\n';

        if (registrations && registrations.length > 0) {
            registrations.forEach((reg: Record<string, unknown>) => {
                // 타입 단언 및 옵셔널 체이닝 보정
                const guest = reg.guests as { name?: string; phone?: string; visit_count?: number } | undefined;

                const guestName = guest?.name || '';
                const phone = guest?.phone || '';
                const course = String(reg.course || '');
                const pace = String(reg.pace || '');
                const status = getStatusLabel(String(reg.status || ''));
                const createdAt = reg.created_at ? `"${formatDateKR(String(reg.created_at))}"` : '';
                const visitCount = guest?.visit_count ?? 0;

                // 엑셀에서 전화번호가 수식으로 인식되거나 0이 탈락하는 것을 방지하기 위해 ="x" 형태로 처리하는 방법도 있지만
                // 가장 간단하게 쌍따옴표로 감싸서 문자열로 처리
                csvContent += `"${guestName}","${phone}","${course}","${pace}","${status}",${createdAt},${visitCount}\n`;
            });
        }

        // 4. 응답 헤더 설정 및 반환
        // 파일명: [이벤트명]_참가자명단.csv (공백은 안더스코어로 치환)
        const safeTitle = event.title.replace(/[\s\/\\:*?"<>|]/g, '_');
        const fileName = encodeURIComponent(`${safeTitle}_참가자명단.csv`);

        return new NextResponse(csvContent, {
            status: HTTP_STATUS.OK,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${fileName}"`
            }
        });

    } catch (error) {
        handleApiError(error, 'CSV Export General Error');
        return new NextResponse(API_ERROR_MSG.SERVER_ERROR, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
