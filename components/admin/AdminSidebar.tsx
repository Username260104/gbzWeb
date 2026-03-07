'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './AdminSidebar.module.css';
import { cn } from '@/lib/utils';

/**
 * 관리자 사이드바 컴포넌트
 * - 네비게이션 메뉴 (이벤트, 게스트)
 * - 로그아웃 기능
 * - 모바일 반응형 (햄버거 메뉴)
 */

interface NavItem {
    label: string;
    href: string;
    icon: string;
}

const NAV_ITEMS: NavItem[] = [
    { label: '이벤트 관리', href: '/admin/events', icon: '📅' },
    { label: '게스트 이력', href: '/admin/guests', icon: '👥' },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/admin/login';
    };

    return (
        <>
            {/* 모바일 햄버거 버튼 */}
            <button
                className={styles.mobileToggle}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="메뉴 열기"
            >
                <span className={styles.hamburger} />
            </button>

            {/* 오버레이 (모바일) */}
            {mobileOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={cn(styles.sidebar, mobileOpen && styles.open)}>
                {/* 로고 */}
                <div className={styles.brand}>
                    <span className={styles.brandIcon}>🏃</span>
                    <span className={styles.brandText}>GBZ</span>
                </div>

                {/* 네비게이션 */}
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                styles.navItem,
                                pathname.startsWith(item.href) && styles.active
                            )}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* 하단: 사용자 정보 + 로그아웃 */}
                <div className={styles.footer}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userEmail}>{userEmail}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`${styles.logoutBtn} btn btn-ghost btn-sm`}
                    >
                        로그아웃
                    </button>
                </div>
            </aside>
        </>
    );
}
