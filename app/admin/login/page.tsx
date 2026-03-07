'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

/**
 * 관리자 로그인 페이지
 * - Supabase Auth 이메일/비밀번호 인증
 * - 성공 시 /admin/events로 리다이렉트
 */
export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            setLoading(false);
            return;
        }

        // 로그인 성공 — 관리자 대시보드로 이동
        window.location.href = '/admin/events';
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.logo}>🏃</div>
                        <h1 className={styles.title}>GBZ</h1>
                        <p className={styles.subtitle}>관리자 로그인</p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.field}>
                            <label htmlFor="email" className="label">
                                이메일
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="input"
                                placeholder="admin@gbz.kr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="password" className="label">
                                비밀번호
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner" />
                            ) : (
                                '로그인'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
