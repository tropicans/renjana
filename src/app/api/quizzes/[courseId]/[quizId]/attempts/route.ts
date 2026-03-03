import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/quizzes/[courseId]/[quizId]/attempts — get user's quiz attempts
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { courseId, quizId } = await params;

    // Verify quiz exists and belongs to course
    const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, courseId },
    });

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const attempts = await prisma.quizAttempt.findMany({
        where: {
            quizId: quiz.id,
            userId: user!.id,
        },
        orderBy: { startedAt: "desc" },
        select: {
            id: true,
            score: true,
            passed: true,
            answers: true,
            startedAt: true,
            completedAt: true,
        },
    });

    return NextResponse.json({ attempts });
}
