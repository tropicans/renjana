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
        include: {
            _count: { select: { registrations: true } },
            course: {
                include: {
                    modules: {
                        include: { lessons: { select: { durationMin: true } } },
                    },
                },
            },
        },
        orderBy: [
            { isFeatured: "desc" },
            { eventStart: "asc" },
            { createdAt: "desc" },
        ],
    });

    const result = events.map((event) => {
        const totalLessons = event.course?.modules.reduce((sum, module) => sum + module.lessons.length, 0) ?? 0;
        const totalDurationMin = event.course?.modules.reduce(
            (sum, module) => sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.durationMin ?? 0), 0),
            0,
        ) ?? 0;

        return {
            ...event,
            totalLessons,
            totalDurationMin,
        };
    });

    return NextResponse.json({ events: result });
}
