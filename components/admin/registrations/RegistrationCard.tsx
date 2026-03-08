import { formatDateKR, maskPhone } from '@/lib/utils';
import { REGISTRATION_STATUS } from '@/lib/constants';

type Guest = {
    name: string;
    phone: string;
    visit_count: number;
};

export type RegistrationData = {
    id: string;
    course: string;
    pace: string;
    status: string;
    created_at: string;
    guests: Guest[] | Guest;
};

interface RegistrationCardProps {
    registration: RegistrationData;
    onStatusChange: (id: string, newStatus: string) => Promise<void>;
    isUpdating: boolean;
}

export default function RegistrationCard({ registration, onStatusChange, isUpdating }: RegistrationCardProps) {
    const { guests, course, pace, status, created_at } = registration;
    const guest = Array.isArray(guests) ? guests[0] : guests;

    // 상태 배지 컴포넌트
    const StatusBadge = () => {
        switch (status) {
            case REGISTRATION_STATUS.PENDING:
                return <span className="badge badge-draft">대기</span>;
            case REGISTRATION_STATUS.CONFIRMED:
                return <span className="badge badge-open">확정</span>;
            case REGISTRATION_STATUS.CANCELLED:
                return <span className="badge badge-cancelled">취소됨</span>;
            default:
                return <span className="badge">{status}</span>;
        }
    };

    return (
        <div className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', opacity: isUpdating ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
                        {guest?.name || '알 수 없음'}
                    </span>
                    {(guest?.visit_count ?? 0) >= 3 && (
                        <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                            단골
                        </span>
                    )}
                </div>
                <StatusBadge />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                <div>📞 {guest ? maskPhone(guest.phone) : '번호 없음'}</div>
                <div>⏱️ {pace}</div>
                <div>📍 {course}</div>
                <div>🏃 누적 {guest?.visit_count ?? 0}회</div>
                <div style={{ gridColumn: 'span 2', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                    신청 일시: {formatDateKR(created_at)}
                </div>
            </div>

            {/* 액션 버튼 영역 */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', borderTop: '1px solid var(--color-border-light)', paddingTop: 'var(--space-3)' }}>
                {status === REGISTRATION_STATUS.PENDING && (
                    <>
                        <button
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => onStatusChange(registration.id, REGISTRATION_STATUS.CONFIRMED)}
                            disabled={isUpdating}
                        >
                            확정
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => onStatusChange(registration.id, REGISTRATION_STATUS.CANCELLED)}
                            disabled={isUpdating}
                        >
                            취소
                        </button>
                    </>
                )}

                {status === REGISTRATION_STATUS.CONFIRMED && (
                    <button
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => onStatusChange(registration.id, REGISTRATION_STATUS.CANCELLED)}
                        disabled={isUpdating}
                    >
                        참가 취소 처리
                    </button>
                )}

                {status === REGISTRATION_STATUS.CANCELLED && (
                    <button
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => onStatusChange(registration.id, REGISTRATION_STATUS.PENDING)}
                        disabled={isUpdating}
                    >
                        다시 대기 상태로 변경
                    </button>
                )}
            </div>
        </div>
    );
}
