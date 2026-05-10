import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { writeAuditLog } from "@/lib/audit";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { createRegistrationNotification } from "@/lib/notifications";
import { canApproveRegistration } from "@/lib/domain/registration-rules";
import { decideRegistration, finalizeRegistrationDecision, reviewRegistrationDocuments } from "@/lib/domain/registration-workflow";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            event: {
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            },
            classGroup: true,
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
    const policy = await requireApiAuthPolicy(req, { roles: ["ADMIN"], sameOrigin: true });
    if (!policy.ok) return policy.response;

    const { user } = policy;

    const { id } = await params;
    const body = await req.json().catch(() => null);

    const status = typeof body?.status === "string" ? body.status : undefined;
    const adminNote = typeof body?.adminNote === "string" ? body.adminNote.trim() : undefined;
    const documentUpdates = Array.isArray(body?.documentUpdates) ? body.documentUpdates : [];

    if (body?.paymentStatus !== undefined) {
        return NextResponse.json({ error: "Admin cannot change payment status. Finance must verify payment." }, { status: 403 });
    }

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (status === "APPROVED" && !canApproveRegistration(registration)) {
        return NextResponse.json({ error: "Payment must be verified by Finance before approval" }, { status: 400 });
    }

    const documentReview = await reviewRegistrationDocuments({
        prisma,
        registrationId: id,
        actorUserId: user.id,
        documentUpdates,
        allowedType: "NON_PAYMENT_PROOF",
        auditAction: "UPDATE_REGISTRATION_DOCUMENT_REVIEW",
        auditEntity: "REGISTRATION",
    });
    if (!documentReview.ok) {
        return NextResponse.json({ error: documentReview.response.error }, { status: documentReview.response.status });
    }

    const decision = await prisma.$transaction(async (tx) => decideRegistration(tx, registration, {
        registrationId: id,
        actorUserId: user.id,
        status,
        adminNote,
    }));

    if (!decision.ok) {
        return NextResponse.json({ error: decision.response.error }, { status: decision.response.status });
    }

    const { updated } = decision;
    const postDecision = await finalizeRegistrationDecision({
        actorUserId: user.id,
        registration,
        updated,
        status,
        adminNote,
    });

    if (postDecision.audit) {
        await writeAuditLog(prisma, postDecision.audit);
    }

    if (postDecision.notification?.type) {
        await createRegistrationNotification({
            userId: postDecision.notification.userId,
            registrationId: postDecision.notification.registrationId,
            eventId: postDecision.notification.eventId,
            eventSlug: postDecision.notification.eventSlug,
            eventTitle: postDecision.notification.eventTitle,
            type: postDecision.notification.type,
            adminNote: postDecision.notification.adminNote,
        });
    }

    return NextResponse.json({ registration: updated });
}
