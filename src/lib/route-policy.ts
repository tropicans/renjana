import type { SessionUser } from "@/lib/auth-utils";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { buildRateLimitKey, enforceRateLimit, getRateLimitIp } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/request-security";

type RoutePolicyOptions = {
    roles?: string[];
    sameOrigin?: boolean;
    rateLimit?: {
        keyParts: Array<string | null | undefined>;
        limit: number;
        windowMs: number;
        message: string;
    };
};

type RoutePolicyResult =
    | { ok: true; user: SessionUser }
    | { ok: false; response: Response };

export async function requireApiAuthPolicy(request: Request, options: RoutePolicyOptions = {}): Promise<RoutePolicyResult> {
    const authResult = options.roles?.length
        ? await requireRole(...options.roles)
        : await requireAuth();

    if (authResult.error || !authResult.user) {
        return { ok: false, response: authResult.error as Response };
    }

    if (options.sameOrigin) {
        const sameOriginError = assertSameOrigin(request);
        if (sameOriginError) {
            return { ok: false, response: sameOriginError };
        }
    }

    if (options.rateLimit) {
        const rateLimitResponse = enforceRateLimit({
            key: buildRateLimitKey([...options.rateLimit.keyParts, getRateLimitIp(request), authResult.user.id]),
            limit: options.rateLimit.limit,
            windowMs: options.rateLimit.windowMs,
            message: options.rateLimit.message,
        });

        if (rateLimitResponse) {
            return { ok: false, response: rateLimitResponse };
        }
    }

    return { ok: true, user: authResult.user };
}
