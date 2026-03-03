import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// POST /api/evaluations — submit course evaluation
export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { courseId, rating, comment, answers } = await req.json();

    if (!courseId) {
        return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "rating must be between 1 and 5" }, { status: 400 });
    }

    // Verify user is enrolled in this course
    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user!.id, courseId } },
    });
    if (!enrollment) {
        return NextResponse.json({ error: "You are not enrolled in this course" }, { status: 403 });
    }

    // Check if already evaluated (unique constraint)
    const existing = await prisma.evaluation.findUnique({
        where: { courseId_userId: { courseId, userId: user!.id } },
    });
    if (existing) {
        return NextResponse.json({ error: "You have already submitted an evaluation for this course" }, { status: 409 });
    }

    const evaluation = await prisma.evaluation.create({
        data: {
            courseId,
            userId: user!.id,
            rating,
            comment: comment ?? null,
            answers: answers ?? null,
        },
        include: {
            course: { select: { id: true, title: true } },
        },
    });

    return NextResponse.json({ evaluation }, { status: 201 });
}

// GET /api/evaluations — get evaluations (user's own, or all for admin)
export async function GET(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // Admin/Instructor can see all evaluations for a course
    if ((user!.role === "ADMIN" || user!.role === "INSTRUCTOR") && courseId) {
        const evaluations = await prisma.evaluation.findMany({
            where: { courseId },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                course: { select: { id: true, title: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate average rating
        const avgRating = evaluations.length > 0
            ? evaluations.reduce((sum, e) => sum + e.rating, 0) / evaluations.length
            : 0;

        return NextResponse.json({ evaluations, avgRating, total: evaluations.length });
    }

    // Learner: get their own evaluations
    const where: { userId: string; courseId?: string } = { userId: user!.id };
    if (courseId) where.courseId = courseId;

    const evaluations = await prisma.evaluation.findMany({
        where,
        include: {
            course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ evaluations });
}
