import { NextResponse } from "next/server";

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

type RateLimitOptions = {
    key: string;
    limit: number;
    windowMs: number;
    message: string;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function pruneExpiredEntries(now: number) {
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt <= now) {
            rateLimitStore.delete(key);
        }
    }
}

export function getRateLimitIp(request: Request) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const firstIp = forwardedFor.split(",")[0]?.trim();
        if (firstIp) return firstIp;
    }

    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;

    return "unknown";
}

export function buildRateLimitKey(parts: Array<string | null | undefined>) {
    return parts
        .map((part) => (part || "").trim().toLowerCase())
        .filter(Boolean)
        .join(":");
}

export function enforceRateLimit(options: RateLimitOptions) {
    const now = Date.now();
    pruneExpiredEntries(now);

    const existing = rateLimitStore.get(options.key);
    if (!existing || existing.resetAt <= now) {
        rateLimitStore.set(options.key, {
            count: 1,
            resetAt: now + options.windowMs,
        });
        return null;
    }

    if (existing.count >= options.limit) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        return NextResponse.json(
            { error: options.message },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfterSeconds),
                },
            }
        );
    }

    existing.count += 1;
    rateLimitStore.set(options.key, existing);
    return null;
}

export function resetRateLimitStore() {
    rateLimitStore.clear();
}
