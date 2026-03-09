'use client';

import { useState } from 'react';
import { formatDateKR, formatPhoneInput } from '@/lib/utils';
import GuestHistoryModal from './GuestHistoryModal';

export type GuestData = {
    id: string;
    name: string;
    phone: string;
    visit_count: number;
    last_seen: string | null;
    created_at: string;
};

interface GuestListProps {
    initialGuests: GuestData[];
}

export default function GuestList({ initialGuests }: GuestListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

    // 전화번호 검색 필터 로직
    const filteredGuests = initialGuests.filter(guest => {
        if (!searchTerm) return true;
        // 하이픈 제거 후 순수 숫자로만 비교 (입력어와 원본 모두)
        const pureSearchTerm = searchTerm.replace(/\D/g, '');
        const purePhone = guest.phone.replace(/\D/g, '');
        return purePhone.includes(pureSearchTerm);
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 입력 시 전화번호 형식 자동 포맷팅 (UX 목적)
        const formatted = formatPhoneInput(e.target.value);
        setSearchTerm(formatted);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* 검색바 영역 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', maxWidth: '400px' }}>
                <span style={{ fontSize: 'var(--text-xl)' }}>🔍</span>
                <input
                    type="tel"
                    className="input"
                    placeholder="전화번호 뒷자리로 검색 (예: 1234)"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ flex: 1 }}
                />
            </div>

            {/* 게스트 목록 그리드/리스트 */}
            {filteredGuests.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    {filteredGuests.map(guest => (
                        <div
                            key={guest.id}
                            className="card card-hover"
                            style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', cursor: 'pointer' }}
                            onClick={() => setSelectedGuestId(guest.id)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-lg)' }}>
                                        {guest.name}
                                    </span>
                                    {guest.visit_count >= 3 && (
                                        <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                                            단골
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-muted)' }}>›</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                                <div>📞 {guest.phone}</div>
                                <div>🏃 누적 {guest.visit_count}회 확정 참가</div>
                                {guest.last_seen ? (
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                                        마지막 참가: {formatDateKR(guest.last_seen)}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                                        첫 참가 전 (대기/취소 기록만 존재)
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>❓</div>
                    검색 조건에 맞는 게스트가 없습니다.
                </div>
            )}

            {/* 게스트 모달 (나중에 구현) */}
            {selectedGuestId && (
                <GuestHistoryModal
                    guestId={selectedGuestId}
                    onClose={() => setSelectedGuestId(null)}
                />
            )}
        </div>
    );
}
