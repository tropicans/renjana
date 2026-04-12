import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getAccessibleRegistrationForCourse } from "@/lib/registration-access";

// GET /api/quizzes/[courseId]/[quizId]/attempts — get user's quiz attempts
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

    return NextResponse.json({ attempts, registrationId: registration?.id ?? null });
}
