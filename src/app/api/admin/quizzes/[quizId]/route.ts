import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// PUT /api/admin/quizzes/[quizId] — update quiz
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ quizId: string }> }
) {
    const { user, error } = await requireRole("ADMIN", "INSTRUCTOR");
    if (error) return error;

    const { quizId } = await params;
    const { title, timeLimit, passingScore, questions } = await req.json();

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Update quiz fields
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (passingScore !== undefined) updateData.passingScore = passingScore;

    // If questions provided, delete old ones and create new ones
    if (questions && Array.isArray(questions)) {
        await prisma.quizQuestion.deleteMany({ where: { quizId } });
        await prisma.quizQuestion.createMany({
            data: questions.map((q: { question: string; options: string[]; correctIdx: number }, idx: number) => ({
                quizId,
                question: q.question,
                options: q.options,
                correctIdx: q.correctIdx,
                order: idx + 1,
            })),
        });
    }

    const updated = await prisma.quiz.update({
        where: { id: quizId },
        data: updateData,
        include: {
            questions: { orderBy: { order: "asc" } },
            _count: { select: { questions: true } },
        },
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: "UPDATE",
            entity: "quiz",
            entityId: quizId,
            metadata: { title: updated.title },
        },
    });

    return NextResponse.json({ quiz: updated });
}

// DELETE /api/admin/quizzes/[quizId] — delete quiz
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ quizId: string }> }
) {
    const { user, error } = await requireRole("ADMIN", "INSTRUCTOR");
    if (error) return error;

    const { quizId } = await params;

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    await prisma.quiz.delete({ where: { id: quizId } });

    // Audit log
    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: "DELETE",
            entity: "quiz",
            entityId: quizId,
            metadata: { title: quiz.title, type: quiz.type },
        },
    });

    return NextResponse.json({ success: true });
}
