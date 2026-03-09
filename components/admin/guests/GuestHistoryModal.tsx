'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatDateKR } from '@/lib/utils';
import { REGISTRATION_STATUS } from '@/lib/constants';

type EventData = {
    title: string;
    date: string;
};

type HistoryItem = {
    id: string;
    course: string;
    pace: string;
    status: string;
    created_at: string;
    events: EventData | EventData[] | null;
};

interface GuestHistoryModalProps {
    guestId: string;
    onClose: () => void;
}

export default function GuestHistoryModal({ guestId, onClose }: GuestHistoryModalProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const supabase = createClient();
                const { data, error: fetchError } = await supabase
                    .from('registrations')
                    .select(`
                        id,
                        course,
                        pace,
                        status,
                        created_at,
                        events (
                            title,
                            date
                        )
                    `)
                    .eq('guest_id', guestId)
                    .order('created_at', { ascending: false });

                if (fetchError) {
                    throw new Error(fetchError.message);
                }

                setHistory(data as HistoryItem[] || []);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('이력을 불러오는 데 실패했습니다.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (guestId) {
            fetchHistory();
        }
    }, [guestId]);

    // 배경 클릭 시 모달 닫기
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const attendanceCount = history.filter(
        (item) => item.status === REGISTRATION_STATUS.CONFIRMED || item.status === REGISTRATION_STATUS.CHECKED_IN
    ).length;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--space-4)'
            }}
            onClick={handleBackdropClick}
        >
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--space-6)',
                    animation: 'slideIn 0.3s ease-out'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)' }}>상세 참가 이력</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', fontSize: 'var(--text-xl)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                    >
                        ✕
                    </button>
                </div>

                {isLoading ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        데이터를 불러오는 중입니다...
                    </div>
                ) : error ? (
                    <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)', backgroundColor: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)' }}>
                        {error}
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>총 신청 건수</span>
                                <span style={{ fontWeight: 'var(--font-bold)' }}>{history.length}건</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-secondary)' }}>참가 처리 건수</span>
                                <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>{attendanceCount}건</span>
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingRight: 'var(--space-2)' }}>
                            {history.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--space-4)' }}>
                                    참가 이력이 없습니다.
                                </div>
                            ) : (
                                history.map(item => {
                                    // events가 배열로 내려올 경우를 대비한 방어 코드
                                    const eventItem = Array.isArray(item.events) ? item.events[0] : item.events;

                                    return (
                                        <div key={item.id} style={{ padding: 'var(--space-3)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                                <span style={{ fontWeight: 'var(--font-bold)' }}>
                                                    {eventItem?.title || '알 수 없는 이벤트'}
                                                </span>
                                                <span style={{ fontSize: 'var(--text-sm)' }}>
                                                    {item.status === REGISTRATION_STATUS.CONFIRMED && '✅ 확정'}
                                                    {item.status === REGISTRATION_STATUS.CHECKED_IN && '🟢 출석'}
                                                    {item.status === REGISTRATION_STATUS.PENDING && '⏳ 대기중'}
                                                    {item.status === REGISTRATION_STATUS.CANCELLED && '❌ 취소됨'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px' }}>
                                                <span>🗓️</span> <span>{eventItem?.date ? formatDateKR(eventItem.date) : '-'}</span>
                                                <span>🏃</span> <span>{item.course} / {item.pace}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
