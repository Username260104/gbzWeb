'use client';

import { useState } from 'react';
import { REGISTRATION_STATUS } from '@/lib/constants';
import RegistrationCard, { RegistrationData } from './RegistrationCard';

interface RegistrationListProps {
    eventId: string;
    initialRegistrations: RegistrationData[];
}

export default function RegistrationList({ eventId, initialRegistrations }: RegistrationListProps) {
    const [registrations, setRegistrations] = useState<RegistrationData[]>(initialRegistrations);
    const [filter, setFilter] = useState<string>('all');
    const [isExporting, setIsExporting] = useState(false);
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 필터링된 목록
    const filteredRegistrations = registrations.filter(reg => {
        if (filter === 'all') return true;
        return reg.status === filter;
    });

    // 참가자 상태 변경 핸들러
    const handleStatusChange = async (registrationId: string, newStatus: string) => {
        // 낙관적 업데이트를 위해 이전 상태 백업
        const previousRegistrations = [...registrations];

        // UI 즉각 반영 (Optimistic Update)
        setRegistrations(prev =>
            prev.map(reg =>
                reg.id === registrationId ? { ...reg, status: newStatus } : reg
            )
        );
        setUpdatingIds(prev => new Set(prev).add(registrationId));
        setErrorMsg(null);

        try {
            const res = await fetch(`/api/registrations/${registrationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || '상태 변경 처리 중 오류가 발생했습니다.');
            }

            // 성공 시 백그라운드에서 아무것도 하지 않아도 UI는 이미 반영됨
        } catch (error: unknown) {
            // 실패 시 롤백 및 에러 표시
            setRegistrations(previousRegistrations);
            // 에러 메시지는 CONVENTIONS.md 에 따라 사용자에게 그대로 표시
            if (error instanceof Error) setErrorMsg(error.message);
            else setErrorMsg('상태 변경 중 예기치 않은 오류가 발생했습니다.');
        } finally {
            setUpdatingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(registrationId);
                return newSet;
            });
        }
    };

    // CSV 내보내기 핸들러
    const handleExportCSV = async () => {
        setIsExporting(true);
        setErrorMsg(null);

        try {
            // API 라우트로 이동하여 다운로드 처리 (a 태그 클릭 효과)
            const exportUrl = `/api/events/${eventId}/registrations/export`;

            // 직접 브라우저 이동을 통해 다운로드 트리거
            window.location.href = exportUrl;

        } catch (error: unknown) {
            if (error instanceof Error) setErrorMsg(error.message);
            else setErrorMsg('CSV 내보내기 중 예기치 않은 오류가 발생했습니다.');
        } finally {
            // 브라우저 다운로드는 페이지 이동을 유발하지 않으므로 
            // 짧은 지연 후 로딩 상태 해제
            setTimeout(() => setIsExporting(false), 1000);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* 상단 컨트롤 영역 (필터 및 CSV) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter('all')}
                    >
                        전체
                    </button>
                    <button
                        className={`btn ${filter === REGISTRATION_STATUS.PENDING ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(REGISTRATION_STATUS.PENDING)}
                    >
                        대기
                    </button>
                    <button
                        className={`btn ${filter === REGISTRATION_STATUS.CONFIRMED ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(REGISTRATION_STATUS.CONFIRMED)}
                    >
                        확정
                    </button>
                    <button
                        className={`btn ${filter === REGISTRATION_STATUS.CHECKED_IN ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(REGISTRATION_STATUS.CHECKED_IN)}
                    >
                        출석
                    </button>
                    <button
                        className={`btn ${filter === REGISTRATION_STATUS.CANCELLED ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setFilter(REGISTRATION_STATUS.CANCELLED)}
                    >
                        취소됨
                    </button>
                </div>

                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleExportCSV}
                    disabled={isExporting || registrations.length === 0}
                >
                    {isExporting ? '다운로드 중...' : '📥 참가자 명단 CSV 내보내기'}
                </button>
            </div>

            {/* 에러 메시지 노출 */}
            {errorMsg && (
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-error)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                    {errorMsg}
                </div>
            )}

            {/* 카드 리스트 영역 */}
            {filteredRegistrations.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                    {filteredRegistrations.map(reg => (
                        <RegistrationCard
                            key={reg.id}
                            registration={reg}
                            onStatusChange={handleStatusChange}
                            isUpdating={updatingIds.has(reg.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>📭</div>
                    해당되는 참가자가 없습니다.
                </div>
            )}

        </div>
    );
}
