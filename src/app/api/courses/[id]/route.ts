import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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
            events: {
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    status: true,
                    registrationStart: true,
                    registrationEnd: true,
                    eventStart: true,
                },
                orderBy: [
                    { eventStart: "asc" },
                    { createdAt: "asc" },
                ],
            },
        },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const linkedEvent = course.events[0] ?? null;

    return NextResponse.json({
        course: {
            ...course,
            linkedEvent,
            requiresRegistration: Boolean(linkedEvent),
        },
    });
}
