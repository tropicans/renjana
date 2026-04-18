import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { createRegistrationNotification } from "@/lib/notifications";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const classGroupId = typeof body?.classGroupId === "string" && body.classGroupId.trim() ? body.classGroupId.trim() : null;

    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (!["APPROVED", "ACTIVE", "COMPLETED"].includes(registration.status) || registration.paymentStatus !== "VERIFIED") {
        return NextResponse.json({ error: "Registration must be approved and payment verified before class assignment" }, { status: 400 });
    }

    let classGroup = null;
    if (classGroupId) {
        classGroup = await prisma.classGroup.findUnique({ where: { id: classGroupId }, include: { _count: { select: { registrations: true } } } });
        if (!classGroup || classGroup.eventId !== registration.eventId) {
            return NextResponse.json({ error: "Class group not found for this event" }, { status: 404 });
        }
        if (classGroup.modality !== registration.participantMode) {
            return NextResponse.json({ error: "Class group modality must match participant mode" }, { status: 400 });
        }
        if (classGroup.capacity !== null && classGroup._count.registrations >= classGroup.capacity && registration.classGroupId !== classGroup.id) {
            return NextResponse.json({ error: "Class group is already full" }, { status: 400 });
        }
    }

    const updated = await prisma.registration.update({
        where: { id },
        data: { classGroupId },
        include: {
            classGroup: true,
            user: { select: { id: true, fullName: true, email: true } },
            event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
            documents: true,
            payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: classGroupId ? "ASSIGN_CLASS_GROUP" : "UNASSIGN_CLASS_GROUP",
            entity: "REGISTRATION",
            entityId: id,
            metadata: { classGroupId },
        },
    });

    if (registration.classGroupId !== updated.classGroup?.id) {
        await createRegistrationNotification({
            userId: updated.user.id,
            registrationId: updated.id,
            eventId: updated.event.id,
            eventSlug: updated.event.slug,
            eventTitle: updated.event.title,
            type: updated.classGroup ? "CLASS_GROUP_ASSIGNED" : "CLASS_GROUP_UPDATED",
            classGroupName: updated.classGroup?.name,
        });
    }

    return NextResponse.json({ registration: updated });
}
