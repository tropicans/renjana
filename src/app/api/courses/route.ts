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
        include: {
            _count: { select: { modules: true, enrollments: true } },
            modules: {
                include: {
                    lessons: { select: { durationMin: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const result = courses.map((c) => {
        const totalLessons = c.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        const totalDurationMin = c.modules.reduce(
            (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationMin ?? 0), 0),
            0
        );
        return { ...c, totalLessons, totalDurationMin };
    });

    return NextResponse.json({ courses: result });
}
