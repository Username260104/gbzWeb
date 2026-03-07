import { createBrowserClient } from '@supabase/ssr';

/**
 * 브라우저(클라이언트 사이드)에서 사용하는 Supabase 클라이언트 생성
 * - anon key 사용 (RLS 적용)
 * - 싱글톤이 아니므로 컴포넌트에서 필요 시 호출
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
