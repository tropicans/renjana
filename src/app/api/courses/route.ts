import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/courses — list published courses
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { status: "PUBLISHED" };
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    const courses = await prisma.course.findMany({
        where,
        select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            status: true,
            type: true,
            createdAt: true,
            _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    const courseIds = courses.map((course) => course.id);
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

    const result = courses.map((course) => {
        const stats = courseStats.get(course.id);
        return {
            ...course,
            totalLessons: stats?.totalLessons ?? 0,
            totalDurationMin: stats?.totalDurationMin ?? 0,
        };
    });

    return NextResponse.json({ courses: result });
}
