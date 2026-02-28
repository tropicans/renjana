import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// PUT /api/progress — mark a lesson as complete
export async function PUT(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { enrollmentId, lessonId } = await req.json();
    if (!enrollmentId || !lessonId) {
        return NextResponse.json({ error: "enrollmentId and lessonId are required" }, { status: 400 });
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            course: {
                include: {
                    modules: {
                        include: { lessons: { select: { id: true } } },
                    },
                },
            },
        },
    });

    if (!enrollment || enrollment.userId !== user!.id) {
        return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Upsert progress record
    const progress = await prisma.progress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
        update: { isCompleted: true, completedAt: new Date() },
        create: {
            enrollmentId,
            lessonId,
            isCompleted: true,
            completedAt: new Date(),
        },
    });

    // Recalculate completion percentage
    const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
    );
    const completedLessons = await prisma.progress.count({
        where: { enrollmentId, isCompleted: true },
    });

    const completionPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Update enrollment
    const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
            completionPercentage,
            status: completionPercentage === 100 ? "COMPLETED" : "ACTIVE",
            completedAt: completionPercentage === 100 ? new Date() : null,
        },
    });

    return NextResponse.json({
        progress,
        enrollment: {
            id: updatedEnrollment.id,
            completionPercentage: updatedEnrollment.completionPercentage,
            status: updatedEnrollment.status,
        },
    });
}
