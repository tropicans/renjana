import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getAccessibleRegistrationForCourse } from "@/lib/registration-access";

// POST /api/quizzes/[courseId]/[quizId]/submit — submit quiz answers
export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { courseId, quizId } = await params;
    const { answers, registrationId } = await req.json();

    if (!answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: "answers array is required" }, { status: 400 });
    }

    const { access, registration } = await getAccessibleRegistrationForCourse(user!.id, courseId, registrationId);
    if (!access.allowed) {
        return NextResponse.json({ error: "Quiz access is not available until your event registration is approved" }, { status: 403 });
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, courseId },
        include: {
            questions: { orderBy: { order: "asc" } },
        },
    });

    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    const totalQuestions = quiz.questions.length;
    if (totalQuestions === 0) {
        return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });
    }

    let correctCount = 0;
    const gradedAnswers = quiz.questions.map((q) => {
        const userAnswer = answers.find((a: { questionId: string; selectedIdx: number }) => a.questionId === q.id);
        const selectedIdx = userAnswer?.selectedIdx ?? -1;
        const isCorrect = selectedIdx === q.correctIdx;
        if (isCorrect) correctCount++;

        return {
            questionId: q.id,
            selectedIdx,
            correctIdx: q.correctIdx,
            isCorrect,
        };
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
        data: {
            quizId: quiz.id,
            userId: user!.id,
            answers: gradedAnswers,
            score,
            passed,
            completedAt: new Date(),
        },
    });

    return NextResponse.json({
        attempt: {
            id: attempt.id,
            registrationId: registration?.id ?? null,
            score: attempt.score,
            passed: attempt.passed,
            totalQuestions,
            correctCount,
            answers: gradedAnswers,
            completedAt: attempt.completedAt,
        },
    }, { status: 201 });
}
