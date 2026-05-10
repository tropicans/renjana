import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { writeSecurityAuditLog } from "@/lib/audit";
import { resolveInstructorAssignment } from "@/lib/class-group-instructor";
import { withRequestObservability } from "@/lib/observability/route";
import { assertSameOrigin } from "@/lib/request-security";

function toDate(value: unknown) {
    if (typeof value !== "string" || !value.trim()) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withRequestObservability(req, async () => {
        const { error } = await requireRole("ADMIN");
        if (error) return error;

        const { id } = await params;
        const classGroups = await prisma.classGroup.findMany({
            where: { eventId: id },
            include: {
                _count: { select: { registrations: true } },
                instructorUser: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: [{ modality: "asc" }, { createdAt: "asc" }],
        });

        return NextResponse.json({ classGroups });
    }, {
        event: "admin.eventClassGroups.get",
        getUser: async () => {
            const { user } = await requireRole("ADMIN");
            return user ?? undefined;
        },
    });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withRequestObservability(req, async () => {
        const { user: actor, error } = await requireRole("ADMIN");
        if (error) return error;
        const sameOriginError = assertSameOrigin(req);
        if (sameOriginError) return sameOriginError;

        const { id } = await params;
        const body = await req.json().catch(() => null);
        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const modality = typeof body?.modality === "string" ? body.modality : "";
        const capacity = body?.capacity === null || body?.capacity === undefined || body?.capacity === "" ? null : Number(body.capacity);

        if (!name) {
            return NextResponse.json({ error: "Class group name is required" }, { status: 400 });
        }

        if (!["ONLINE", "OFFLINE"].includes(modality)) {
            return NextResponse.json({ error: "Class group modality must be ONLINE or OFFLINE" }, { status: 400 });
        }

        if (capacity !== null && (!Number.isInteger(capacity) || capacity <= 0)) {
            return NextResponse.json({ error: "Capacity must be a positive integer" }, { status: 400 });
        }

        const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const hasInstructorAssignment = body && Object.prototype.hasOwnProperty.call(body, "instructorUserId");
        const instructorAssignment = hasInstructorAssignment
            ? await resolveInstructorAssignment(body?.instructorUserId)
            : undefined;

        if (hasInstructorAssignment && body?.instructorUserId && !instructorAssignment) {
            return NextResponse.json({ error: "Instructor assignment must reference an active instructor user" }, { status: 400 });
        }

        const classGroup = await prisma.classGroup.create({
            data: {
                eventId: id,
                name,
                modality: modality as never,
                capacity,
                status: typeof body?.status === "string" && body.status.trim() ? body.status.trim() : "ACTIVE",
                description: typeof body?.description === "string" ? body.description.trim() || null : null,
                instructorUserId: instructorAssignment?.instructorUserId ?? null,
                instructorName: instructorAssignment?.instructorName ?? (typeof body?.instructorName === "string" ? body.instructorName.trim() || null : null),
                location: typeof body?.location === "string" ? body.location.trim() || null : null,
                zoomLink: typeof body?.zoomLink === "string" ? body.zoomLink.trim() || null : null,
                zoomPasscode: typeof body?.zoomPasscode === "string" ? body.zoomPasscode.trim() || null : null,
                startAt: toDate(body?.startAt),
                endAt: toDate(body?.endAt),
            },
            include: {
                _count: { select: { registrations: true } },
                instructorUser: { select: { id: true, fullName: true, email: true } },
            },
        });

        await writeSecurityAuditLog(prisma, {
            userId: actor.id,
            action: "CREATE_CLASS_GROUP",
            entity: "CLASS_GROUP",
            entityId: classGroup.id,
            metadata: { eventId: id, name: classGroup.name, modality: classGroup.modality },
        });

        return NextResponse.json({ classGroup }, { status: 201 });
    }, {
        event: "admin.eventClassGroups.post",
        getUser: async () => {
            const { user } = await requireRole("ADMIN");
            return user ?? undefined;
        },
    });
}
