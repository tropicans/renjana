import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { createRegistrationNotification } from "@/lib/notifications";
import { ensureEnrollmentForCourse } from "@/lib/enrollment-sync";

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
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

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

    if (status === "APPROVED" && registration.paymentStatus !== "VERIFIED") {
        return NextResponse.json({ error: "Payment must be verified by Finance before approval" }, { status: 400 });
    }

    if (documentUpdates.length > 0) {
        for (const document of documentUpdates as Array<{ id: string; reviewStatus?: string; adminNote?: string | null }>) {
            const registrationDocument = await prisma.registrationDocument.findUnique({ where: { id: document.id } });
            if (!registrationDocument || registrationDocument.registrationId !== id) {
                return NextResponse.json({ error: "Document not found" }, { status: 404 });
            }

            if (registrationDocument.type === "PAYMENT_PROOF") {
                return NextResponse.json({ error: "Admin cannot review payment proof documents" }, { status: 403 });
            }

            await prisma.registrationDocument.update({
                where: { id: document.id },
                data: {
                    ...(document.reviewStatus ? { reviewStatus: document.reviewStatus as never } : {}),
                    ...(document.adminNote !== undefined ? { adminNote: document.adminNote?.trim() || null } : {}),
                },
            });
        }

        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: "UPDATE_REGISTRATION_DOCUMENT_REVIEW",
                entity: "REGISTRATION",
                entityId: id,
                metadata: {
                    documentUpdates,
                },
            },
        });
    }

    const updated = await prisma.$transaction(async (tx) => {
        const nextRegistration = await tx.registration.update({
            where: { id },
            data: {
                ...(status ? { status: status as never } : {}),
                ...(adminNote !== undefined ? { adminNote: adminNote || null } : {}),
                ...(status === "APPROVED" ? { approvedAt: new Date() } : {}),
            },
            include: {
                user: { select: { id: true, fullName: true, email: true, phone: true } },
                event: {
                    include: {
                        course: { select: { id: true, title: true } },
                    },
                },
                classGroup: true,
                documents: { orderBy: { createdAt: "asc" } },
            },
        });

        const shouldEnsureEnrollment = status === "APPROVED"
            && registration.status !== "APPROVED"
            && Boolean(nextRegistration.event.courseId)
            && nextRegistration.event.learningEnabled;

        if (shouldEnsureEnrollment && nextRegistration.event.courseId) {
            await ensureEnrollmentForCourse(tx, {
                userId: nextRegistration.user.id,
                courseId: nextRegistration.event.courseId,
            });
        }

        return nextRegistration;
    });

    if (status || adminNote !== undefined) {
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: status === "APPROVED"
                    ? "APPROVE_REGISTRATION"
                    : status === "REJECTED"
                        ? "REJECT_REGISTRATION"
                        : status === "REVISION_REQUIRED"
                            ? "REQUEST_REGISTRATION_REVISION"
                            : "UPDATE_REGISTRATION",
                entity: "REGISTRATION",
                entityId: id,
                metadata: {
                    previous: {
                        status: registration.status,
                        adminNote: registration.adminNote,
                    },
                    next: {
                        status: updated.status,
                        adminNote: updated.adminNote,
                    },
                },
            },
        });
    }

    if (status && status !== registration.status) {
        const notificationType = status === "APPROVED"
            ? "REGISTRATION_APPROVED"
            : status === "REVISION_REQUIRED"
                ? "REGISTRATION_REVISION_REQUIRED"
                : status === "REJECTED"
                    ? "REGISTRATION_REJECTED"
                    : null;

        if (notificationType) {
            await createRegistrationNotification({
                userId: updated.user.id,
                registrationId: updated.id,
                eventId: updated.event.id,
                eventSlug: updated.event.slug,
                eventTitle: updated.event.title,
                type: notificationType,
                adminNote: updated.adminNote,
            });
        }
    }

    return NextResponse.json({ registration: updated });
}
