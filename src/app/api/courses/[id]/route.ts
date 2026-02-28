import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/courses/:id — course detail with modules + lessons
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            modules: {
                orderBy: { order: "asc" },
                include: {
                    lessons: { orderBy: { order: "asc" } },
                },
            },
            enrollments: { select: { id: true, userId: true } },
        },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
}
