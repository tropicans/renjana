import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { reviewPaymentProof, reviewRegistrationDocuments } from "@/lib/domain/registration-workflow";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("FINANCE", "ADMIN");
    if (error) return error;

    const { id } = await params;
    const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
            documents: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const auditLogs = await prisma.auditLog.findMany({
        where: {
            entityId: id,
            entity: {
                in: ["REGISTRATION", "PAYMENT"],
            },
        },
        include: {
            user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return NextResponse.json({ registration: { ...registration, auditLogs } });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const policy = await requireApiAuthPolicy(req, { roles: ["FINANCE", "ADMIN"], sameOrigin: true });
    if (!policy.ok) return policy.response;

    const { user } = policy;

    const { id } = await params;
    const body = await req.json().catch(() => null);

    const paymentStatus = typeof body?.paymentStatus === "string" ? body.paymentStatus : undefined;
    const adminNote = typeof body?.adminNote === "string" ? body.adminNote.trim() : undefined;
    const documentUpdates = Array.isArray(body?.documentUpdates) ? body.documentUpdates : [];

    if (body?.status !== undefined) {
        return NextResponse.json({ error: "Finance cannot change registration status" }, { status: 403 });
    }

    if (paymentStatus && !["PENDING", "UPLOADED", "VERIFIED", "REJECTED"].includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const documentReview = await reviewRegistrationDocuments({
        prisma,
        registrationId: id,
        actorUserId: user.id,
        documentUpdates,
        allowedType: "PAYMENT_PROOF",
        auditAction: "REVIEW_PAYMENT_PROOF",
        auditEntity: "REGISTRATION",
    });
    if (!documentReview.ok) {
        return NextResponse.json({ error: documentReview.response.error }, { status: documentReview.response.status });
    }

    const updated = await reviewPaymentProof(prisma, registration, {
        registrationId: id,
        actorUserId: user.id,
        paymentStatus,
        adminNote,
    });

    return NextResponse.json({ registration: updated });
}
