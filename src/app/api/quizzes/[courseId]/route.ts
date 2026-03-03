import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/quizzes/[courseId] — list quizzes (pre/post) for a course
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { courseId } = await params;

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const quizzes = await prisma.quiz.findMany({
        where: { courseId },
        include: {
            _count: { select: { questions: true } },
            attempts: {
                where: { userId: user!.id },
                orderBy: { startedAt: "desc" },
                take: 1,
                select: {
                    id: true,
                    score: true,
                    passed: true,
                    completedAt: true,
                },
            },
        },
        orderBy: { createdAt: "asc" },
    });

    const result = quizzes.map((q) => ({
        id: q.id,
        courseId: q.courseId,
        type: q.type,
        title: q.title,
        timeLimit: q.timeLimit,
        passingScore: q.passingScore,
        questionCount: q._count.questions,
        lastAttempt: q.attempts[0] ?? null,
    }));

    return NextResponse.json({ quizzes: result });
}
