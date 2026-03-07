import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 미들웨어
 * - /admin/* 경로에 대해 Supabase 인증 세션을 검증한다.
 * - 비인증 사용자는 /admin/login으로 리다이렉트한다.
 * - 인증된 상태에서 /admin/login 접근 시 /admin/events로 리다이렉트한다.
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // 관리자 로그인 페이지는 비인증 접근 허용
    if (pathname === '/admin/login') {
        if (user) {
            // 이미 로그인된 사용자는 대시보드로 이동
            const url = request.nextUrl.clone();
            url.pathname = '/admin/events';
            return NextResponse.redirect(url);
        }
        return supabaseResponse;
    }

    // /admin/* 경로 비인증 접근 차단
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: ['/admin/:path*'],
};
