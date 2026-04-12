import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

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
    const { error } = await requireRole("FINANCE", "ADMIN");
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

    return NextResponse.json({ registration: updated });
}
