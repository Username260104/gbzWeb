import Link from 'next/link';
import localFont from 'next/font/local';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/server';
import { EVENT_STATUS } from '@/lib/constants';
import { formatDateKR } from '@/lib/utils';

const ribsans = localFont({
  src: '../font/Ribsans.otf',
  display: 'swap',
});

/**
 * 루트 페이지 — 활성 러닝 이벤트 노출
 */
export default async function Home() {
  const supabase = await createClient();

  const { data: activeEvent } = await supabase
    .from('events')
    .select('id, title, date, location, capacity')
    .eq('status', EVENT_STATUS.OPEN)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <main className={styles.main}>
      <div className={`${styles.hero} ${ribsans.className}`}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>GBZ</span>
          <br />
          Running Tribe
        </h1>

        {activeEvent && (
          <section className={styles.activeEventCard}>
            <p className={styles.activeEventBadge}>지금 신청 가능</p>
            <h2 className={styles.activeEventTitle}>{activeEvent.title}</h2>
            <p className={styles.activeEventMeta}>{formatDateKR(activeEvent.date)}</p>
            <p className={styles.activeEventMeta}>{activeEvent.location}</p>
            {activeEvent.capacity > 0 && (
              <p className={styles.activeEventMeta}>정원 {activeEvent.capacity}명</p>
            )}
            <Link href={`/run/${activeEvent.id}`} className={styles.applyLink}>
              신청하러 가기
            </Link>
          </section>
        )}

        <footer className={styles.footer}>
          <Link href="/admin/login" className={styles.adminLink}>
            *
          </Link>
        </footer>
      </div>
    </main>
  );
}
