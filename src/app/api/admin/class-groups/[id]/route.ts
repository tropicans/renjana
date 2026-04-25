import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { resolveInstructorAssignment } from "@/lib/class-group-instructor";

function toDate(value: unknown) {
    if (typeof value !== "string" || !value.trim()) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const classGroup = await prisma.classGroup.findUnique({ where: { id }, include: { _count: { select: { registrations: true } } } });
    if (!classGroup) {
        return NextResponse.json({ error: "Class group not found" }, { status: 404 });
    }

    const modality = typeof body?.modality === "string" ? body.modality : classGroup.modality;
    if (!["ONLINE", "OFFLINE"].includes(modality)) {
        return NextResponse.json({ error: "Class group modality must be ONLINE or OFFLINE" }, { status: 400 });
    }

    if (modality !== classGroup.modality && classGroup._count.registrations > 0) {
        return NextResponse.json({ error: "Cannot change modality after participants are assigned" }, { status: 400 });
    }

    const capacity = body?.capacity === null || body?.capacity === undefined || body?.capacity === "" ? null : Number(body.capacity);
    if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
        return NextResponse.json({ error: "Capacity must be a positive integer" }, { status: 400 });
    }

    if (capacity !== null && classGroup._count.registrations > capacity) {
        return NextResponse.json({ error: "Capacity cannot be lower than current assigned participants" }, { status: 400 });
    }

    const shouldUpdateInstructorAssignment = body && Object.prototype.hasOwnProperty.call(body, "instructorUserId");
    const instructorAssignment = shouldUpdateInstructorAssignment
        ? await resolveInstructorAssignment(body?.instructorUserId)
        : undefined;

    if (shouldUpdateInstructorAssignment && body?.instructorUserId && !instructorAssignment) {
        return NextResponse.json({ error: "Instructor assignment must reference an active instructor user" }, { status: 400 });
    }

    const updated = await prisma.classGroup.update({
        where: { id },
        data: {
            ...(typeof body?.name === "string" ? { name: body.name.trim() || classGroup.name } : {}),
            modality: modality as never,
            capacity,
            ...(typeof body?.status === "string" ? { status: body.status.trim() || classGroup.status } : {}),
            ...(typeof body?.description === "string" ? { description: body.description.trim() || null } : {}),
            ...(typeof body?.instructorName === "string" && !shouldUpdateInstructorAssignment ? { instructorName: body.instructorName.trim() || null } : {}),
            ...(shouldUpdateInstructorAssignment ? {
                instructorUserId: instructorAssignment?.instructorUserId ?? null,
                instructorName: instructorAssignment?.instructorName ?? null,
            } : {}),
            ...(typeof body?.location === "string" ? { location: body.location.trim() || null } : {}),
            ...(typeof body?.zoomLink === "string" ? { zoomLink: body.zoomLink.trim() || null } : {}),
            ...(typeof body?.zoomPasscode === "string" ? { zoomPasscode: body.zoomPasscode.trim() || null } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "startAt") ? { startAt: toDate(body.startAt) } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "endAt") ? { endAt: toDate(body.endAt) } : {}),
        },
        include: {
            _count: { select: { registrations: true } },
            instructorUser: { select: { id: true, fullName: true, email: true } },
        },
    });

    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: "UPDATE_CLASS_GROUP",
            entity: "CLASS_GROUP",
            entityId: id,
            metadata: { previous: classGroup, next: updated },
        },
    });

    return NextResponse.json({ classGroup: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const classGroup = await prisma.classGroup.findUnique({ where: { id }, include: { _count: { select: { registrations: true } } } });
    if (!classGroup) {
        return NextResponse.json({ error: "Class group not found" }, { status: 404 });
    }

    if (classGroup._count.registrations > 0) {
        return NextResponse.json({ error: "Cannot delete class group with assigned participants" }, { status: 400 });
    }

    await prisma.classGroup.delete({ where: { id } });
    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: "DELETE_CLASS_GROUP",
            entity: "CLASS_GROUP",
            entityId: id,
            metadata: { name: classGroup.name, eventId: classGroup.eventId },
        },
    });

    return NextResponse.json({ success: true });
}
