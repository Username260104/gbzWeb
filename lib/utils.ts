/**
 * 유틸리티 함수 모음
 */

/**
 * 전화번호를 010-XXXX-XXXX 형식으로 정규화한다.
 * 숫자만 추출 후 포맷팅하며, 유효하지 않은 번호는 null을 반환한다.
 */
export function normalizePhone(raw: string): string | null {
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 11 && digits.startsWith('010')) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }

    if (digits.length === 10 && digits.startsWith('01')) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return null;
}

/**
 * 전화번호를 마스킹 처리한다. (로그 출력용)
 * 예: 010-1234-5678 → 010-****-5678
 */
export function maskPhone(phone: string): string {
    return phone.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
}

/**
 * 입력값에 하이픈을 자동 삽입한다. (실시간 포맷팅용)
 * 예: 01012345678 → 010-1234-5678
 */
export function formatPhoneInput(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/**
 * 날짜를 한국어 형식으로 포맷한다.
 * 예: 2026-03-06T07:00:00Z → 2026년 3월 6일 (토) 오전 7:00
 */
export function formatDateKR(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * 클래스명을 조건부로 결합한다.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
    return classes.filter(Boolean).join(' ');
}
