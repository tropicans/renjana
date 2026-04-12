import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// POST /api/admin/quizzes — create quiz with questions
export async function POST(req: Request) {
    const { user, error } = await requireRole("ADMIN", "INSTRUCTOR");
    if (error) return error;

    const { courseId, type, title, timeLimit, passingScore, questions } = await req.json();

    if (!courseId || !type || !title) {
        return NextResponse.json({ error: "courseId, type, and title are required" }, { status: 400 });
    }

    if (!["PRE_TEST", "POST_TEST"].includes(type)) {
        return NextResponse.json({ error: "type must be PRE_TEST or POST_TEST" }, { status: 400 });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if a quiz of this type already exists for the course
    const existing = await prisma.quiz.findFirst({
        where: { courseId, type },
    });
    if (existing) {
        return NextResponse.json(
            { error: `A ${type} already exists for this course. Delete it first or update it.` },
            { status: 409 }
        );
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
        data: {
            courseId,
            type,
            title,
            timeLimit: timeLimit ?? null,
            passingScore: passingScore ?? 70,
            questions: {
                create: (questions ?? []).map((q: { question: string; options: string[]; correctIdx: number }, idx: number) => ({
                    question: q.question,
                    options: q.options,
                    correctIdx: q.correctIdx,
                    order: idx + 1,
                })),
            },
        },
        include: {
            questions: { orderBy: { order: "asc" } },
            _count: { select: { questions: true } },
        },
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            userId: user!.id,
            action: "CREATE",
            entity: "quiz",
            entityId: quiz.id,
            metadata: { type: quiz.type, courseId: quiz.courseId, title: quiz.title },
        },
    });

    return NextResponse.json({ quiz }, { status: 201 });
}

// GET /api/admin/quizzes — list quizzes (optionally by courseId)
export async function GET(req: Request) {
    const { error } = await requireRole("ADMIN", "INSTRUCTOR");
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where = courseId ? { courseId } : {};

    const quizzes = await prisma.quiz.findMany({
        where,
        include: {
            course: { select: { id: true, title: true } },
            questions: {
                orderBy: { order: "asc" },
                select: {
                    id: true,
                    question: true,
                    options: true,
                    correctIdx: true,
                    order: true,
                },
            },
            _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quizzes });
}
