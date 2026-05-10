import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { withRequestObservability } from "@/lib/observability/route";

export async function GET(req: Request) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    return withRequestObservability(req, async () => {
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") ?? "50");

        const logs = await prisma.auditLog.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return NextResponse.json({ logs });
    }, {
        event: "admin.audit.get",
        user,
    });
}
