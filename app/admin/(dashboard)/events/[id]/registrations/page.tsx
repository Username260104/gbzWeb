import { createAdminClient } from '@/lib/supabase/server';
import { formatDateKR } from '@/lib/utils';
import RegistrationList from '@/components/admin/registrations/RegistrationList';
import Link from 'next/link';

export const metadata = {
    title: '참가자 명단 | GBZ Web Service',
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventRegistrationsPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = createAdminClient();
    const eventId = params.id;

    // 1. 이벤트 기본 정보 조회
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('title, date, capacity, status')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        return (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
                이벤트를 찾을 수 없습니다.
            </div>
        );
    }

    // 2. 해당 이벤트의 전체 신청 내역 조회 (최신 신청순)
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
        .order('created_at', { ascending: false });

    if (regError) {
        console.error('Failed to fetch registrations:', regError);
        return (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
                참가자 명단 데이터를 불러오는데 실패했습니다.
            </div>
        );
    }

    // 총 신청자 수 계산 (상태 무관 전체 건수)
    const totalApplicants = registrations?.length || 0;

    // 확정자 수 계산
    const confirmedCount = registrations?.filter(r => r.status === 'confirmed').length || 0;

    return (
        <div style={{ maxWidth: 'var(--max-width-xl)', margin: '0 auto', width: '100%' }}>
            {/* 상단 헤더 및 뒤로가기 버튼 */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <Link
                    href="/admin/events"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        marginBottom: 'var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)'
                    }}
                >
                    ← 이벤트 목록으로 돌아가기
                </Link>

                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                    {event.title} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xl)' }}>참가자 명단</span>
                </h1>

                <div style={{ display: 'flex', gap: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span>🗓️</span> <span>{formatDateKR(event.date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span>👥</span>
                        <span>
                            정원: {event.capacity === 0 ? '무제한' : `${event.capacity}명`}
                            <span style={{ color: 'var(--color-primary)', marginLeft: '6px', fontWeight: 'var(--font-bold)' }}>
                                (확정: {confirmedCount}명 / 총 신청: {totalApplicants}명)
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            {/* 클라이언트 컴포넌트 마운트 */}
            <RegistrationList eventId={eventId} initialRegistrations={registrations || []} />

        </div>
    );
}
