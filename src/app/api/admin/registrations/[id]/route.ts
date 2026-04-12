import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

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
            documents: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({ registration });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const body = await req.json().catch(() => null);

    const status = typeof body?.status === "string" ? body.status : undefined;
    const paymentStatus = typeof body?.paymentStatus === "string" ? body.paymentStatus : undefined;
    const adminNote = typeof body?.adminNote === "string" ? body.adminNote.trim() : undefined;
    const documentUpdates = Array.isArray(body?.documentUpdates) ? body.documentUpdates : [];

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (documentUpdates.length > 0) {
        await Promise.all(documentUpdates.map((document: { id: string; reviewStatus?: string; adminNote?: string | null }) =>
            prisma.registrationDocument.update({
                where: { id: document.id },
                data: {
                    ...(document.reviewStatus ? { reviewStatus: document.reviewStatus as never } : {}),
                    ...(document.adminNote !== undefined ? { adminNote: document.adminNote?.trim() || null } : {}),
                },
            })
        ));
    }

    const updated = await prisma.registration.update({
        where: { id },
        data: {
            ...(status ? { status: status as never } : {}),
            ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
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
            documents: { orderBy: { createdAt: "asc" } },
        },
    });

    return NextResponse.json({ registration: updated });
}
