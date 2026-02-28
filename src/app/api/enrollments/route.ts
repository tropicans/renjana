import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/enrollments — list current user's enrollments
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const enrollments = await prisma.enrollment.findMany({
        where: { userId: user!.id },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    thumbnail: true,
                },
            },
        },
        orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ enrollments });
}

// POST /api/enrollments — enroll current user in a course
export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { courseId } = await req.json();
    if (!courseId) {
        return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    // Check course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check not already enrolled
    const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user!.id, courseId } },
    });
    if (existing) {
        return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            userId: user!.id,
            courseId,
            status: "ACTIVE",
            completionPercentage: 0,
        },
        include: {
            course: {
                select: { id: true, title: true, description: true, thumbnail: true },
            },
        },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
}
