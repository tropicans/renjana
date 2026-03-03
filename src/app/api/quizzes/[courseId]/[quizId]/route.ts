import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/quizzes/[courseId]/[quizId] — get quiz detail with questions (without correct answers)
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
    const { error } = await requireAuth();
    if (error) return error;

    const { courseId, quizId } = await params;

    const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, courseId },
        include: {
            questions: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    question: true,
                    options: true,
                    order: true,
                    // NOTE: correctIdx is NOT returned to the client
                },
            },
        },
    });

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
        quiz: {
            id: quiz.id,
            courseId: quiz.courseId,
            type: quiz.type,
            title: quiz.title,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore,
            questions: quiz.questions,
        },
    });
}
