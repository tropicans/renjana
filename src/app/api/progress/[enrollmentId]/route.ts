import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getCourseLifecycleAccess } from "@/lib/registration-access";

// GET /api/progress/:enrollmentId — get progress for an enrollment
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { enrollmentId } = await params;

    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            progresses: {
                select: {
                    lessonId: true,
                    isCompleted: true,
                    completedAt: true,
                    score: true,
                },
            },
        },
    });

    if (!enrollment || enrollment.userId !== user!.id) {
        return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const access = await getCourseLifecycleAccess(user!.id, enrollment.courseId);
    if (!access.allowed) {
        return NextResponse.json({ error: "Learning access is not available until your event registration is approved" }, { status: 403 });
    }

    return NextResponse.json({
        enrollmentId: enrollment.id,
        completionPercentage: enrollment.completionPercentage,
        status: enrollment.status,
        progresses: enrollment.progresses,
    });
}
