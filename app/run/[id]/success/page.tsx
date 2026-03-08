import React from 'react';
import Link from 'next/link';

interface SuccessPageProps {
    searchParams: {
        name?: string;
        pace?: string;
    };
    params: {
        id: string; // event id
    }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
    const { name, pace } = searchParams;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-6) var(--space-4)',
            }}
        >
            <div
                className="card animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    padding: 'var(--space-8)',
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-xl)',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto var(--space-6)',
                        borderRadius: 'var(--radius-full)',
                        background: '#E8F8F1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        style={{ color: 'var(--color-success)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h2
                        style={{
                            fontSize: 'var(--text-3xl)',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--color-text)',
                            marginBottom: 'var(--space-2)',
                        }}
                    >
                        신청 완료! 🎉
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
                        성공적으로 참가 신청이 접수되었습니다.
                    </p>
                </div>

                <div
                    style={{
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-6)',
                        textAlign: 'left',
                        border: '1px solid var(--color-border-light)',
                        marginBottom: 'var(--space-6)',
                    }}
                >
                    <h3
                        style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--space-4)',
                            paddingBottom: 'var(--space-2)',
                            borderBottom: '1px solid var(--color-border)',
                        }}
                    >
                        신청 정보 요약
                    </h3>
                    <dl style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {name && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                                <dt style={{ color: 'var(--color-text-secondary)' }}>이름</dt>
                                <dd style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>{name}</dd>
                            </div>
                        )}
                        {pace && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                                <dt style={{ color: 'var(--color-text-secondary)' }}>평균 페이스</dt>
                                <dd style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>{pace}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Link href="/" className="btn btn-secondary">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
