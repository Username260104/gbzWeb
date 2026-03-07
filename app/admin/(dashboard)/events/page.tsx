import { createClient } from '@/lib/supabase/server';
import EventList from '@/components/admin/events/EventList';

export const metadata = {
    title: '이벤트 관리 | GBZ Web Service',
};

export default async function EventsPage() {
    const supabase = await createClient();

    // 서버 사이드에서 이벤트를 가져옴 (최신 순)
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Failed to fetch events:', error);
        return (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
                이벤트를 불러오는데 실패했습니다.
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 'var(--max-width-xl)', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                    이벤트 관리
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    러닝 세션을 생성하고 참가자를 관리합니다.
                </p>
            </div>

            <EventList initialEvents={events || []} />
        </div>
    );
}
