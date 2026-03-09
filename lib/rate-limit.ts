type Bucket = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSec: 0 };
    }

    if (current.count >= limit) {
        const retryAfterSec = Math.ceil((current.resetAt - now) / 1000);
        return { allowed: false, retryAfterSec };
    }

    current.count += 1;
    buckets.set(key, current);
    return { allowed: true, retryAfterSec: 0 };
}
