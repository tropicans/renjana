import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getAccessibleRegistrationForCourse } from "@/lib/registration-access";

// GET /api/quizzes/[courseId]/[quizId] — get quiz detail with questions (without correct answers)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ courseId: string; quizId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { courseId, quizId } = await params;
    const { searchParams } = new URL(req.url);
    const registrationId = searchParams.get("registrationId");

    const { access, registration } = await getAccessibleRegistrationForCourse(user!.id, courseId, registrationId);
    if (!access.allowed) {
        return NextResponse.json({ error: "Quiz access is not available until your event registration is approved" }, { status: 403 });
    }

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
            registrationId: registration?.id ?? null,
            type: quiz.type,
            title: quiz.title,
            timeLimit: quiz.timeLimit,
            passingScore: quiz.passingScore,
            questions: quiz.questions,
        },
    });
}
