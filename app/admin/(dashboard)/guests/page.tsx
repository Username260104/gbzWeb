import { createClient } from '@/lib/supabase/server';
import GuestList from '@/components/admin/guests/GuestList';
import styles from '../events/page.module.css';

export const metadata = {
    title: '게스트 이력 관리 | GBZ Web Service',
};

export default async function GuestsPage() {
    const supabase = await createClient();

    // 전체 게스트 조회 (누적 확정 횟수 내림차순 정렬)
    const { data: guests, error } = await supabase
        .from('guests')
        .select('*')
        .order('visit_count', { ascending: false })
        .order('last_seen', { ascending: false, nullsFirst: false });

    if (error) {
        console.error('Failed to fetch guests:', error);
        return (
            <div className={styles.container}>
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-error)' }}>
                    게스트 데이터를 불러오는데 실패했습니다.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>게스트 이력</h1>
                <p className={styles.subtitle}>게스트 참가 이력을 조회합니다</p>
            </div>

            <GuestList initialGuests={guests || []} />
        </div>
    );
}
