import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { getRecentErrors } from "@/lib/observability/error-monitor";
import { withRequestObservability } from "@/lib/observability/route";

export async function GET(req: Request) {
    return withRequestObservability(req, async () => {
        const { error } = await requireRole("ADMIN");
        if (error) return error;

        const { searchParams } = new URL(req.url);
        const rawLimit = Number(searchParams.get("limit") ?? 20);
        const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, rawLimit)) : 20;

        return NextResponse.json({
            errors: getRecentErrors(limit),
        });
    }, {
        event: "admin.observability.errors.get",
        getUser: async () => {
            const { user } = await requireRole("ADMIN");
            return user ?? undefined;
        },
    });
}
