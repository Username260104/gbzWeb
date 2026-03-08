'use client';

import { useState } from 'react';
import Link from 'next/link';
import EventCard from './EventCard';

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

export default function EventList({ initialEvents }: { initialEvents: EventData[] }) {
    const [filter, setFilter] = useState('all');

    // 필터링 로직
    const filteredEvents = initialEvents.filter(event => {
        if (filter === 'all') return true;
        return event.status === filter;
    });

    const filterOptions = [
        { label: '전체', value: 'all' },
        { label: '초안', value: 'draft' },
        { label: '접수 중', value: 'open' },
        { label: '마감', value: 'closed' },
        { label: '취소됨', value: 'cancelled' },
    ];

    return (
        <div>
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                {/* 필터 탭 */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`btn btn-sm ${filter === option.value ? 'btn-secondary' : 'btn-ghost'}`}
                            style={{
                                backgroundColor: filter === option.value ? 'var(--color-surface)' : 'transparent',
                                borderColor: filter === option.value ? 'var(--color-border)' : 'transparent',
                                color: filter === option.value ? 'var(--color-text)' : 'var(--color-text-secondary)',
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <Link href="/admin/events/new" className="btn btn-primary">
                    + 새 이벤트 생성
                </Link>
            </div>

            {/* List */}
            {filteredEvents.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>조건에 맞는 이벤트가 없습니다.</p>
                    <p style={{ fontSize: 'var(--text-sm)' }}>우측 상단의 버튼을 눌러 새 이벤트를 만들어보세요.</p>
                </div>
            ) : (
                <div
                    className="animate-fade-in"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 'var(--space-6)'
                    }}
                >
                    {filteredEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
