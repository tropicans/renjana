import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { writeSecurityAuditLog } from "@/lib/audit";
import { withRequestObservability } from "@/lib/observability/route";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { unlink } from "fs/promises";
import path from "path";

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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withRequestObservability(req, async () => {
        const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
        if (!policy.ok) return policy.response;

        const { user } = policy;
        const { id } = await params;

        const evidence = await prisma.evidence.findUnique({
            where: { id },
        });

        if (!evidence) {
            return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
        }

        const isOwner = evidence.userId === user.id;
        const isAdmin = user.role === "ADMIN";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (evidence.rating !== null) {
            return NextResponse.json({ error: "Cannot delete graded evidence" }, { status: 400 });
        }

        const fileName = path.basename(evidence.fileUrl);
        const filePath = path.join(process.cwd(), "uploads", "evidence", fileName);
        try {
            await unlink(filePath);
        } catch {
            // Ignore if file is already missing on disk
        }

        await prisma.evidence.delete({
            where: { id },
        });

        await writeSecurityAuditLog(prisma, {
            userId: user.id,
            action: "DELETE_EVIDENCE",
            entity: "EVIDENCE",
            entityId: evidence.id,
            metadata: { title: evidence.title },
        });

        return NextResponse.json({ success: true });
    }, {
        event: "learner.evidence.delete",
        getUser: async () => {
            const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
            return policy.ok ? policy.user : undefined;
        },
    });
}
