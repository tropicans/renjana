import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/instructor/learners — list learners enrolled in instructor's courses
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all enrollments with progress data
    const enrollments = await prisma.enrollment.findMany({
        include: {
            user: { select: { id: true, fullName: true, email: true } },
            course: { select: { id: true, title: true } },
            certificate: { select: { id: true, issuedAt: true } },
        },
        orderBy: { enrolledAt: "desc" },
    });

    // Get summary stats
    const stats = {
        totalLearners: new Set(enrollments.map(e => e.userId)).size,
        activeEnrollments: enrollments.filter(e => e.status === "ACTIVE").length,
        completedEnrollments: enrollments.filter(e => e.status === "COMPLETED").length,
        avgCompletion: enrollments.length ? Math.round(enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / enrollments.length) : 0,
    };

    return NextResponse.json({ enrollments, stats });
}
