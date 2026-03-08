import Link from 'next/link';
import { formatDateKR } from '@/lib/utils';
import { EVENT_STATUS } from '@/lib/constants';
import { getTemplateByType } from '@/lib/event-templates';

type EventData = {
    id: string;
    title: string;
    date: string;
    location: string;
    course?: string | null;
    distance_km?: number | null;
    after_activity?: string | null;
    template_type: string;
    status: string;
    capacity: number;
};

export default function EventCard({ event }: { event: EventData }) {

    // 상태별 라벨 및 색상 클래스
    const getStatusBadge = (status: string) => {
        switch (status) {
            case EVENT_STATUS.DRAFT:
                return <span className="badge badge-draft">초안</span>;
            case EVENT_STATUS.OPEN:
                return <span className="badge badge-open">접수 중</span>;
            case EVENT_STATUS.CLOSED:
                return <span className="badge badge-closed">마감</span>;
            case EVENT_STATUS.CANCELLED:
                return <span className="badge badge-cancelled">취소됨</span>;
            default:
                return null;
        }
    };

    return (
        <div className="card card-hover" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        {getStatusBadge(event.status)}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {getTemplateByType(event.template_type)?.badgeLabel ?? '일반 이벤트'}
                        </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                        {event.title}
                    </h3>
                </div>
            </div>

            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'grid', gridTemplateColumns: '76px 1fr', gap: '6px var(--space-2)' }}>
                <span>일시</span>
                <span>{formatDateKR(event.date)}</span>
                <span>집결지</span>
                <span>{event.location}</span>
                <span>거리</span>
                <span>{event.distance_km ? `${event.distance_km}km` : '미정'}</span>
                <span>코스</span>
                <span>{event.course || '미정'}</span>
                <span>기타 사항</span>
                <span>{event.after_activity || '없음'}</span>
                <span>정원</span>
                <span>{event.capacity === 0 ? '무제한' : `${event.capacity}명`}</span>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-light)', display: 'flex', gap: 'var(--space-3)' }}>
                <Link
                    href={`/admin/events/${event.id}/registrations`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                >
                    참가자 명단
                </Link>
                {/* 추후 구현될 이벤트 수정 폼 대비 진입점 */}
                <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="btn btn-secondary btn-sm"
                >
                    수정
                </Link>
            </div>
        </div>
    );
}
