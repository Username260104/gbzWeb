import { apiError } from '@/lib/api-error';
import { API_ERROR_MSG, HTTP_STATUS } from '@/lib/constants';

type UserLike = {
    email?: string | null;
};

function getAdminAllowlist() {
    const raw = process.env.ADMIN_EMAIL_ALLOWLIST || '';
    return new Set(
        raw
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
    );
}

/**
 * 미래 일반 사용자 도입 대비:
 * - ADMIN_EMAIL_ALLOWLIST가 설정되면 해당 이메일만 관리자 허용
 * - 미설정이면 기존 동작 유지(로그인 사용자 전체 허용)
 */
export function isAdminUser(user: UserLike | null | undefined) {
    if (!user) return false;

    const allowlist = getAdminAllowlist();
    if (allowlist.size === 0) return true;

    const email = (user.email || '').trim().toLowerCase();
    return email.length > 0 && allowlist.has(email);
}

export function requireAdminUser(user: UserLike | null | undefined) {
    if (!user) {
        return apiError(API_ERROR_MSG.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    if (!isAdminUser(user)) {
        return apiError('관리자 권한이 필요합니다.', HTTP_STATUS.FORBIDDEN);
    }

    return null;
}
