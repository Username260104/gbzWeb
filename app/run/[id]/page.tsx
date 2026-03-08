import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GuestForm from '@/components/run/GuestForm';
import { EVENT_STATUS } from '@/lib/constants';
import { formatDateKR } from '@/lib/utils';
import { getTemplateByType } from '@/lib/event-templates';

interface RunPageProps {
    params: {
        id: string;
    };
}

export default async function RunPage({ params }: RunPageProps) {
    const supabase = await createClient();

    const { data: event, error } = await supabase
        .from('events')
        .select('id, title, date, location, course, distance_km, after_activity, template_type, status, capacity')
        .eq('id', params.id)
        .single();

    if (error || !event) notFound();

    // 마감 또는 비공개 상태
    if (event.status !== EVENT_STATUS.OPEN) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-6)',
            }}>
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-12)',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🏁</div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                        {event.status === EVENT_STATUS.CLOSED ? '신청 마감' : '신청 불가'}
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
                        <strong>{event.title}</strong> 이벤트는<br />
                        현재 신청을 받고 있지 않습니다.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            padding: 'var(--space-6) var(--space-4)',
        }}>
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>

                {/* 헤더 */}
                <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        marginBottom: 'var(--space-4)',
                        letterSpacing: '0.05em',
                    }}>
                        🏃 러닝 게스트 신청
                    </div>

                    {/* 이벤트 정보 카드 */}
                    <div style={{
                        background: 'var(--color-secondary)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-6)',
                        color: 'var(--color-text-inverse)',
                        marginBottom: 'var(--space-2)',
                    }}>
                        <h1 style={{
                            fontSize: 'var(--text-2xl)',
                            fontWeight: 'var(--font-bold)',
                            marginBottom: 'var(--space-2)',
                            lineHeight: '1.3',
                        }}>
                            {event.title}
                        </h1>
                        <div style={{
                            display: 'grid',
                            gap: 'var(--space-2)',
                            fontSize: 'var(--text-sm)',
                            color: 'rgba(255,255,255,0.7)',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                            }}>
                                <span>🗓️</span>
                                <span>{formatDateKR(event.date)}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px var(--space-2)' }}>
                                <span>📌 유형</span>
                                <span>{getTemplateByType(event.template_type || '')?.badgeLabel ?? '일반 이벤트'}</span>
                                <span>📍 집결지</span>
                                <span>{event.location}</span>
                                <span>🛣️ 코스</span>
                                <span>{event.course || '미정'}</span>
                                <span>📏 거리</span>
                                <span>{event.distance_km ? `${event.distance_km}km` : '미정'}</span>
                                <span>☕ 뒷풀이</span>
                                <span>{event.after_activity || '없음'}</span>
                                <span>👥 정원</span>
                                <span>{event.capacity > 0 ? `${event.capacity}명` : '무제한'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 폼 카드 */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-6)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    border: '1px solid var(--color-border-light)',
                }}>
                    <GuestForm event={event} />
                </div>

                <p style={{
                    textAlign: 'center',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--space-4)',
                }}>
                    GBZ Running Crew
                </p>
            </div>
        </div>
    );
}
