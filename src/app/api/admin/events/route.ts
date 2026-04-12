import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { validateEventCourseReadiness } from "@/lib/event-course-readiness";
import { slugifyEventTitle } from "@/lib/events";
import { validateEventPayload } from "@/lib/event-validation";

export async function GET() {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const events = await prisma.event.findMany({
        include: {
            course: { select: { id: true, title: true } },
            _count: { select: { registrations: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ events });
}

export async function POST(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const body = await req.json().catch(() => null);
    const title = body?.title?.trim();
    const slug = body?.slug?.trim() || slugifyEventTitle(title || "");
    const courseId = typeof body?.courseId === "string" && body.courseId.trim() ? body.courseId.trim() : null;

    if (!title || !slug) {
        return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const registrationFee = Number(body?.registrationFee || 0) || null;
    const onlineTuitionFee = Number(body?.onlineTuitionFee || 0) || null;
    const offlineTuitionFee = Number(body?.offlineTuitionFee || 0) || null;
    const alumniRegistrationFee = Number(body?.alumniRegistrationFee || 0) || null;

    const validation = validateEventPayload({
        title,
        slug,
        registrationStart: body?.registrationStart ?? null,
        registrationEnd: body?.registrationEnd ?? null,
        eventStart: body?.eventStart ?? null,
        eventEnd: body?.eventEnd ?? null,
        registrationFee,
        onlineTuitionFee,
        offlineTuitionFee,
        alumniRegistrationFee,
        learningEnabled: Boolean(body?.learningEnabled),
        preTestEnabled: Boolean(body?.preTestEnabled),
        postTestEnabled: Boolean(body?.postTestEnabled),
        evaluationEnabled: Boolean(body?.evaluationEnabled),
        certificateEnabled: Boolean(body?.certificateEnabled),
        courseId,
    });

    if (!validation.ok) {
        return NextResponse.json({ error: validation.errors[0], details: validation.errors }, { status: 400 });
    }

    const readiness = await validateEventCourseReadiness({
        courseId,
        preTestEnabled: Boolean(body?.preTestEnabled),
        postTestEnabled: Boolean(body?.postTestEnabled),
    });

    if (!readiness.ok) {
        return NextResponse.json({ error: readiness.errors[0], details: readiness.errors }, { status: 400 });
    }

    if (courseId) {
        const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
        if (!course) {
            return NextResponse.json({ error: "Linked course not found" }, { status: 400 });
        }
    }

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const event = await prisma.event.create({
        data: {
            title,
            slug,
            category: body?.category?.trim() || "GENERAL",
            summary: body?.summary?.trim() || null,
            description: body?.description?.trim() || null,
            modality: body?.modality || "HYBRID",
            status: body?.status || "DRAFT",
            location: body?.location?.trim() || null,
            platform: body?.platform?.trim() || null,
            scheduleSummary: body?.scheduleSummary?.trim() || null,
            contactName: body?.contactName?.trim() || null,
            contactPhone: body?.contactPhone?.trim() || null,
            termsSummary: body?.termsSummary?.trim() || null,
            refundPolicySummary: body?.refundPolicySummary?.trim() || null,
            registrationFee,
            onlineTuitionFee,
            offlineTuitionFee,
            alumniRegistrationFee,
            registrationStart: body?.registrationStart ? new Date(body.registrationStart) : null,
            registrationEnd: body?.registrationEnd ? new Date(body.registrationEnd) : null,
            eventStart: body?.eventStart ? new Date(body.eventStart) : null,
            eventEnd: body?.eventEnd ? new Date(body.eventEnd) : null,
            learningEnabled: Boolean(body?.learningEnabled),
            preTestEnabled: Boolean(body?.preTestEnabled),
            postTestEnabled: Boolean(body?.postTestEnabled),
            evaluationEnabled: Boolean(body?.evaluationEnabled),
            certificateEnabled: Boolean(body?.certificateEnabled),
            isFeatured: Boolean(body?.isFeatured),
            courseId,
        },
        include: {
            course: { select: { id: true, title: true } },
            _count: { select: { registrations: true } },
        },
    });

    return NextResponse.json({ event }, { status: 201 });
}
