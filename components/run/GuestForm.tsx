"use client";

import React, { useState } from 'react';
import { EVENT_STATUS, PACE_OPTIONS } from '@/lib/constants';
import { formatPhoneInput } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface GuestFormProps {
    event: {
        id: string;
        title: string;
        date: string;
        status: string;
        capacity: number;
        course?: string | null;
    };
}

export default function GuestForm({ event }: GuestFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        pace: '',
        notes: '',
        consentGiven: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [duplicateChecking, setDuplicateChecking] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);

    if (event.status !== EVENT_STATUS.OPEN) {
        return (
            <div style={{
                padding: 'var(--space-12)',
                textAlign: 'center',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🏁</div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
                    신청이 마감되었습니다
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    현재 이 이벤트는 신청을 받고 있지 않습니다.
                </p>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }
        if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: formatPhoneInput(value) }));
            setIsDuplicate(false);
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneBlur = async () => {
        if (formData.phone.length < 12) return;
        setDuplicateChecking(true);
        setError('');
        try {
            const res = await fetch(`/api/registrations/check?eventId=${event.id}&phone=${encodeURIComponent(formData.phone)}`);
            if (!res.ok) throw new Error('중복 확인 실패');
            const data = await res.json();
            setIsDuplicate(data.exists);
            if (data.exists) setError('이미 신청 완료된 전화번호입니다.');
        } catch (err) {
            console.error('Phone check error', err);
        } finally {
            setDuplicateChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDuplicate) { setError('이미 신청 완료된 전화번호입니다.'); return; }
        if (!formData.name || !formData.phone || !formData.pace || !formData.consentGiven) {
            setError('필수 항목을 모두 입력해주세요.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: event.id, ...formData })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || '신청 처리 중 오류가 발생했습니다.');
            router.push(`/run/${event.id}/success?name=${encodeURIComponent(formData.name)}&pace=${encodeURIComponent(formData.pace)}`);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('신청 처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-2)',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '14px 16px',
        fontSize: 'var(--text-base)',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* 에러 메시지 */}
            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-error)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* 이름 */}
            <div>
                <label style={labelStyle}>
                    이름 <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <input
                    type="text"
                    name="name"
                    required
                    style={inputStyle}
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            {/* 전화번호 */}
            <div>
                <label style={labelStyle}>
                    전화번호 <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                    <input
                        type="tel"
                        name="phone"
                        required
                        style={{
                            ...inputStyle,
                            borderColor: isDuplicate ? 'var(--color-error)' : 'var(--color-border)',
                        }}
                        placeholder="010-0000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handlePhoneBlur}
                    />
                    {duplicateChecking && (
                        <span style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                        }}>
                            확인 중...
                        </span>
                    )}
                </div>
            </div>

            {/* 페이스 선택 */}
            <div>
                <label style={labelStyle}>
                    평균 페이스 <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                    {PACE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, pace: opt.value }))}
                            style={{
                                padding: '12px 8px',
                                borderRadius: 'var(--radius-lg)',
                                border: '1.5px solid',
                                borderColor: formData.pace === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                                background: formData.pace === opt.value ? 'var(--color-primary-light)' : 'var(--color-surface)',
                                color: formData.pace === opt.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontWeight: formData.pace === opt.value ? 'var(--font-bold)' : 'var(--font-medium)',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                textAlign: 'center',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 특이사항 */}
            <div>
                <label style={labelStyle}>
                    특이사항 <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-normal)' }}>(선택)</span>
                </label>
                <textarea
                    name="notes"
                    rows={3}
                    style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                    placeholder="부상 기록, 질문 등 자유롭게 작성해주세요"
                    value={formData.notes}
                    onChange={handleChange}
                />
            </div>

            {/* 개인정보 동의 */}
            <div style={{
                padding: '16px',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-light)',
            }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <div style={{ position: 'relative', marginTop: '2px', flexShrink: 0 }}>
                        <input
                            type="checkbox"
                            name="consentGiven"
                            required
                            checked={formData.consentGiven}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        />
                    </div>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                        개인정보 수집 및 이용에 동의합니다.{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                            자세히 보기
                        </a>
                        <span style={{ color: 'var(--color-primary)', marginLeft: '4px' }}>*</span>
                    </span>
                </label>
            </div>

            {/* 제출 버튼 */}
            <button
                type="button"
                onClick={handleSubmit as unknown as React.MouseEventHandler}
                disabled={isSubmitting || !formData.consentGiven || duplicateChecking || isDuplicate}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: isSubmitting || !formData.consentGiven || duplicateChecking || isDuplicate
                        ? 'var(--color-border)'
                        : 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-bold)',
                    cursor: isSubmitting || !formData.consentGiven ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    marginTop: 'var(--space-2)',
                }}
            >
                {isSubmitting ? '신청 처리 중...' : '참가 신청하기 →'}
            </button>
        </div>
    );
}
