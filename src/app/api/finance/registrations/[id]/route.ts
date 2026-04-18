import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { createRegistrationNotification } from "@/lib/notifications";

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

    return NextResponse.json({ registration });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireRole("FINANCE", "ADMIN");
    if (error) return error;

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

    for (const document of documentUpdates as Array<{ id: string; reviewStatus?: string; adminNote?: string | null }>) {
        const registrationDocument = await prisma.registrationDocument.findUnique({ where: { id: document.id } });
        if (!registrationDocument || registrationDocument.registrationId !== id) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (registrationDocument.type !== "PAYMENT_PROOF") {
            return NextResponse.json({ error: "Finance can only review payment proof documents" }, { status: 403 });
        }

        await prisma.registrationDocument.update({
            where: { id: document.id },
            data: {
                ...(document.reviewStatus ? { reviewStatus: document.reviewStatus as never } : {}),
                ...(document.adminNote !== undefined ? { adminNote: document.adminNote?.trim() || null } : {}),
            },
        });
    }

    if (documentUpdates.length > 0) {
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: "REVIEW_PAYMENT_PROOF",
                entity: "REGISTRATION",
                entityId: id,
                metadata: {
                    documentUpdates,
                },
            },
        });
    }

    const updated = await prisma.registration.update({
        where: { id },
        data: {
            ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
            ...(adminNote !== undefined ? { adminNote: adminNote || null } : {}),
        },
        include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
            documents: { orderBy: { createdAt: "asc" } },
        },
    });

    if (paymentStatus || adminNote !== undefined) {
        await prisma.auditLog.create({
            data: {
                userId: user!.id,
                action: paymentStatus === "VERIFIED"
                    ? "VERIFY_REGISTRATION_PAYMENT"
                    : paymentStatus === "REJECTED"
                        ? "REJECT_REGISTRATION_PAYMENT"
                        : "UPDATE_REGISTRATION_PAYMENT_NOTE",
                entity: "PAYMENT",
                entityId: id,
                metadata: {
                    previous: {
                        paymentStatus: registration.paymentStatus,
                        adminNote: registration.adminNote,
                    },
                    next: {
                        paymentStatus: updated.paymentStatus,
                        adminNote: updated.adminNote,
                    },
                },
            },
        });
    }

    if (paymentStatus && paymentStatus !== registration.paymentStatus) {
        await createRegistrationNotification({
            userId: updated.user.id,
            registrationId: updated.id,
            eventId: updated.event.id,
            eventSlug: updated.event.slug,
            eventTitle: updated.event.title,
            type: paymentStatus === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
            adminNote: updated.adminNote,
        });
    }

    return NextResponse.json({ registration: updated });
}
