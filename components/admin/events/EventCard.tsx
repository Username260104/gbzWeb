import Link from 'next/link';
import { formatDateKR } from '@/lib/utils';
import { EVENT_STATUS, TEMPLATE_TYPE } from '@/lib/constants';

type EventData = {
    id: string;
    title: string;
    date: string;
    location: string;
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

    // 템플릿별 표시
    const getTemplateLabel = (type: string) => {
        switch (type) {
            case TEMPLATE_TYPE.REGULAR: return '🏃 정기런';
            case TEMPLATE_TYPE.SPEED: return '⚡ 스피드 세션';
            case TEMPLATE_TYPE.COLLAB: return '🤝 외부 협업';
            case TEMPLATE_TYPE.RACE: return '🏆 레이스 참가';
            default: return '📍 일반 이벤트';
        }
    };

    return (
        <div className="card card-hover" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        {getStatusBadge(event.status)}
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            {getTemplateLabel(event.template_type)}
                        </span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                        {event.title}
                    </h3>
                </div>
            </div>

            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>🗓️</span> <span>{formatDateKR(event.date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>📍</span> <span>{event.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span>👥</span> <span>정원: {event.capacity === 0 ? '무제한' : `${event.capacity}명`}</span>
                </div>
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
