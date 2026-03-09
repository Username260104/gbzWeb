import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import styles from './layout.module.css';
import { isAdminUser } from '@/lib/admin-auth';

/**
 * 관리자 영역 공통 레이아웃
 * - 서버 사이드에서 인증 상태 확인 (미들웨어와 이중 검증)
 * - /admin/login은 별도 처리 (이 레이아웃 미적용)
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }
    if (!isAdminUser(user)) {
        redirect('/');
    }

    return (
        <div className={styles.wrapper}>
            <AdminSidebar userEmail={user.email || ''} />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
