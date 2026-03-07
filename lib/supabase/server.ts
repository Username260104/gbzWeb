import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * 서버 사이드(Server Component, API Route)에서 사용하는 Supabase 클라이언트 생성
 * - 쿠키 기반 인증 세션 관리
 * - anon key 사용 (RLS 적용, 관리자 세션에 따라 권한 변동)
 */
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component에서 호출 시 쿠키 설정 불가 — 무시
                    }
                },
            },
        }
    );
}

/**
 * 서버 전용 관리 클라이언트 (SERVICE_ROLE_KEY 사용)
 * - RLS 우회, 관리 작업용
 * - 절대 클라이언트에 노출 금지
 */
export function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}
