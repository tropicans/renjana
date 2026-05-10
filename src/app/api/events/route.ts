import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const featured = searchParams.get("featured") === "true";

    const where: Record<string, unknown> = {
        status: { in: ["PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "LEARNING_ACTIVE", "EVALUATION_OPEN", "COMPLETED"] },
    };

    if (featured) {
        where.isFeatured = true;
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
        ];
    }

    const events = await prisma.event.findMany({
        where,
        select: {
            id: true,
            courseId: true,
            slug: true,
            title: true,
            category: true,
            summary: true,
            description: true,
            modality: true,
            status: true,
            location: true,
            platform: true,
            registrationStart: true,
            registrationEnd: true,
            eventStart: true,
            eventEnd: true,
            scheduleSummary: true,
            contactName: true,
            contactPhone: true,
            termsSummary: true,
            refundPolicySummary: true,
            registrationFee: true,
            onlineTuitionFee: true,
            offlineTuitionFee: true,
            alumniRegistrationFee: true,
            learningEnabled: true,
            preTestEnabled: true,
            postTestEnabled: true,
            evaluationEnabled: true,
            certificateEnabled: true,
            isFeatured: true,
            _count: { select: { registrations: true } },
        },
        orderBy: [
            { isFeatured: "desc" },
            { eventStart: "asc" },
            { createdAt: "desc" },
        ],
    });

    const courseIds = Array.from(new Set(events.map((event) => event.courseId).filter((courseId): courseId is string => Boolean(courseId))));
    const lessons = courseIds.length
        ? await prisma.lesson.findMany({
            where: {
                module: {
                    courseId: { in: courseIds },
                },
            },
            select: {
                durationMin: true,
                module: {
                    select: {
                        courseId: true,
                    },
                },
            },
        })
        : [];

    const courseStats = lessons.reduce<Map<string, { totalLessons: number; totalDurationMin: number }>>((acc, lesson) => {
        const courseId = lesson.module.courseId;
        const stats = acc.get(courseId) ?? { totalLessons: 0, totalDurationMin: 0 };
        stats.totalLessons += 1;
        stats.totalDurationMin += lesson.durationMin ?? 0;
        acc.set(courseId, stats);
        return acc;
    }, new Map());

    const result = events.map((event) => {
        const stats = event.courseId ? courseStats.get(event.courseId) : null;

        return {
            ...event,
            totalLessons: stats?.totalLessons ?? 0,
            totalDurationMin: stats?.totalDurationMin ?? 0,
        };
    });

    return NextResponse.json({ events: result });
}
