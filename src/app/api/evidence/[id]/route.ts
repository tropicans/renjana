import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { writeSecurityAuditLog } from "@/lib/audit";
import { withRequestObservability } from "@/lib/observability/route";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withRequestObservability(req, async () => {
        const { user: actor, error } = await requireRole("INSTRUCTOR", "ADMIN");
        if (error) return error;

        const { id } = await params;
        const body = await req.json().catch(() => null);
        const rating = body && typeof body.rating === "number" ? body.rating : Number(body?.rating);
        const comment = typeof body?.comment === "string" ? body.comment.trim() : null;

        if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
        }

        const evidenceExists = await prisma.evidence.findUnique({
            where: { id },
        });

        if (!evidenceExists) {
            return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
        }

        const evidence = await prisma.evidence.update({
            where: { id },
            data: { rating, comment },
        });

        await writeSecurityAuditLog(prisma, {
            userId: actor.id,
            action: "GRADE_EVIDENCE",
            entity: "EVIDENCE",
            entityId: evidence.id,
            metadata: { rating, comment },
        });

        return NextResponse.json({ evidence });
    }, {
        event: "instructor.evidence.grade",
        getUser: async () => {
            const { user } = await requireRole("INSTRUCTOR", "ADMIN");
            return user ?? undefined;
        },
    });
}
