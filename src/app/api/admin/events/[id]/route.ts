import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { validateEventCourseReadiness } from "@/lib/event-course-readiness";
import { validateEventPayload } from "@/lib/event-validation";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            course: { select: { id: true, title: true } },
            _count: { select: { registrations: true } },
        },
    });

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const courseId = typeof body?.courseId === "string" && body.courseId.trim() ? body.courseId.trim() : null;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (body && Object.prototype.hasOwnProperty.call(body, "courseId") && courseId) {
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) {
            return NextResponse.json({ error: "Linked course not found" }, { status: 400 });
        }
    }

    const registrationFee = body && Object.prototype.hasOwnProperty.call(body, "registrationFee") ? (Number(body.registrationFee || 0) || null) : event.registrationFee;
    const onlineTuitionFee = body && Object.prototype.hasOwnProperty.call(body, "onlineTuitionFee") ? (Number(body.onlineTuitionFee || 0) || null) : event.onlineTuitionFee;
    const offlineTuitionFee = body && Object.prototype.hasOwnProperty.call(body, "offlineTuitionFee") ? (Number(body.offlineTuitionFee || 0) || null) : event.offlineTuitionFee;
    const alumniRegistrationFee = body && Object.prototype.hasOwnProperty.call(body, "alumniRegistrationFee") ? (Number(body.alumniRegistrationFee || 0) || null) : event.alumniRegistrationFee;

    const validation = validateEventPayload({
        title: typeof body?.title === "string" ? body.title : event.title,
        slug: typeof body?.slug === "string" ? body.slug : event.slug,
        registrationStart: body && Object.prototype.hasOwnProperty.call(body, "registrationStart") ? body.registrationStart : event.registrationStart,
        registrationEnd: body && Object.prototype.hasOwnProperty.call(body, "registrationEnd") ? body.registrationEnd : event.registrationEnd,
        eventStart: body && Object.prototype.hasOwnProperty.call(body, "eventStart") ? body.eventStart : event.eventStart,
        eventEnd: body && Object.prototype.hasOwnProperty.call(body, "eventEnd") ? body.eventEnd : event.eventEnd,
        registrationFee,
        onlineTuitionFee,
        offlineTuitionFee,
        alumniRegistrationFee,
        learningEnabled: typeof body?.learningEnabled === "boolean" ? body.learningEnabled : event.learningEnabled,
        preTestEnabled: typeof body?.preTestEnabled === "boolean" ? body.preTestEnabled : event.preTestEnabled,
        postTestEnabled: typeof body?.postTestEnabled === "boolean" ? body.postTestEnabled : event.postTestEnabled,
        evaluationEnabled: typeof body?.evaluationEnabled === "boolean" ? body.evaluationEnabled : event.evaluationEnabled,
        certificateEnabled: typeof body?.certificateEnabled === "boolean" ? body.certificateEnabled : event.certificateEnabled,
        courseId: body && Object.prototype.hasOwnProperty.call(body, "courseId") ? courseId : event.courseId,
    });

    if (!validation.ok) {
        return NextResponse.json({ error: validation.errors[0], details: validation.errors }, { status: 400 });
    }

    const readiness = await validateEventCourseReadiness({
        courseId: body && Object.prototype.hasOwnProperty.call(body, "courseId") ? courseId : event.courseId,
        preTestEnabled: typeof body?.preTestEnabled === "boolean" ? body.preTestEnabled : event.preTestEnabled,
        postTestEnabled: typeof body?.postTestEnabled === "boolean" ? body.postTestEnabled : event.postTestEnabled,
    });

    if (!readiness.ok) {
        return NextResponse.json({ error: readiness.errors[0], details: readiness.errors }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
            ...(typeof body?.status === "string" ? { status: body.status as never } : {}),
            ...(typeof body?.isFeatured === "boolean" ? { isFeatured: body.isFeatured } : {}),
            ...(typeof body?.learningEnabled === "boolean" ? { learningEnabled: body.learningEnabled } : {}),
            ...(typeof body?.preTestEnabled === "boolean" ? { preTestEnabled: body.preTestEnabled } : {}),
            ...(typeof body?.postTestEnabled === "boolean" ? { postTestEnabled: body.postTestEnabled } : {}),
            ...(typeof body?.evaluationEnabled === "boolean" ? { evaluationEnabled: body.evaluationEnabled } : {}),
            ...(typeof body?.certificateEnabled === "boolean" ? { certificateEnabled: body.certificateEnabled } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "registrationStart") ? { registrationStart: body.registrationStart ? new Date(body.registrationStart) : null } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "registrationEnd") ? { registrationEnd: body.registrationEnd ? new Date(body.registrationEnd) : null } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "eventStart") ? { eventStart: body.eventStart ? new Date(body.eventStart) : null } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "eventEnd") ? { eventEnd: body.eventEnd ? new Date(body.eventEnd) : null } : {}),
            ...(typeof body?.title === "string" ? { title: body.title.trim() } : {}),
            ...(typeof body?.slug === "string" ? { slug: body.slug.trim() } : {}),
            ...(typeof body?.category === "string" ? { category: body.category.trim() || "GENERAL" } : {}),
            ...(typeof body?.summary === "string" ? { summary: body.summary.trim() || null } : {}),
            ...(typeof body?.description === "string" ? { description: body.description.trim() || null } : {}),
            ...(typeof body?.modality === "string" ? { modality: body.modality as never } : {}),
            ...(typeof body?.location === "string" ? { location: body.location.trim() || null } : {}),
            ...(typeof body?.platform === "string" ? { platform: body.platform.trim() || null } : {}),
            ...(typeof body?.scheduleSummary === "string" ? { scheduleSummary: body.scheduleSummary.trim() || null } : {}),
            ...(typeof body?.contactName === "string" ? { contactName: body.contactName.trim() || null } : {}),
            ...(typeof body?.contactPhone === "string" ? { contactPhone: body.contactPhone.trim() || null } : {}),
            ...(typeof body?.termsSummary === "string" ? { termsSummary: body.termsSummary.trim() || null } : {}),
            ...(typeof body?.refundPolicySummary === "string" ? { refundPolicySummary: body.refundPolicySummary.trim() || null } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "registrationFee") ? { registrationFee } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "onlineTuitionFee") ? { onlineTuitionFee } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "offlineTuitionFee") ? { offlineTuitionFee } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "alumniRegistrationFee") ? { alumniRegistrationFee } : {}),
            ...(body && Object.prototype.hasOwnProperty.call(body, "courseId") ? { courseId } : {}),
        },
        include: {
            course: { select: { id: true, title: true } },
            _count: { select: { registrations: true } },
        },
    });

    return NextResponse.json({ event: updatedEvent });
}
