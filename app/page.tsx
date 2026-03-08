import Link from 'next/link';
import localFont from 'next/font/local';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/server';
import { EVENT_STATUS } from '@/lib/constants';
import { formatDateKR } from '@/lib/utils';
import { getTemplateByType } from '@/lib/event-templates';

const ribsans = localFont({
  src: '../font/Ribsans.otf',
  display: 'swap',
});

/**
 * 루트 페이지 — 활성 러닝 이벤트 노출
 */
export default async function Home() {
  const supabase = await createClient();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case EVENT_STATUS.DRAFT:
        return '초안';
      case EVENT_STATUS.OPEN:
        return '접수 중';
      case EVENT_STATUS.CLOSED:
        return '마감';
      case EVENT_STATUS.CANCELLED:
        return '취소됨';
      default:
        return status;
    }
  };

  const { data: activeEvent } = await supabase
    .from('events')
    .select('id, title, date, location, course, distance_km, after_activity, template_type, status, capacity')
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
            <div className={styles.activeEventDetails}>
              <p className={styles.activeEventMeta}>유형: {getTemplateByType(activeEvent.template_type || '')?.badgeLabel ?? '일반 이벤트'}</p>
              <p className={styles.activeEventMeta}>상태: {getStatusLabel(activeEvent.status)}</p>
              <p className={styles.activeEventMeta}>일시: {formatDateKR(activeEvent.date)}</p>
              <p className={styles.activeEventMeta}>집결지: {activeEvent.location}</p>
              <p className={styles.activeEventMeta}>코스: {activeEvent.course || '미정'}</p>
              <p className={styles.activeEventMeta}>거리: {activeEvent.distance_km ? `${activeEvent.distance_km}km` : '미정'}</p>
              <p className={styles.activeEventMeta}>뒷풀이: {activeEvent.after_activity || '없음'}</p>
              <p className={styles.activeEventMeta}>정원: {activeEvent.capacity > 0 ? `${activeEvent.capacity}명` : '무제한'}</p>
            </div>
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
