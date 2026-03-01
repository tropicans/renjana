import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/instructor/stats — instructor dashboard stats
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalCourses, totalEnrollments, completedEnrollments, totalAttendances, totalEvidences, courses] = await Promise.all([
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.enrollment.count({ where: { status: "COMPLETED" } }),
        prisma.attendance.count(),
        prisma.evidence.count(),
        prisma.course.findMany({ select: { id: true, title: true, _count: { select: { enrollments: true } } } }),
    ]);

    const enrollments = await prisma.enrollment.findMany({ select: { completionPercentage: true } });
    const avgProgress = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.completionPercentage, 0) / enrollments.length) : 0;

    // Recent activities
    const recentEnrollments = await prisma.enrollment.findMany({
        take: 5,
        orderBy: { enrolledAt: "desc" },
        include: {
            user: { select: { fullName: true } },
            course: { select: { title: true } },
        },
    });

    return NextResponse.json({
        stats: { totalCourses, totalEnrollments, completedEnrollments, totalAttendances, totalEvidences, avgProgress, courses },
        recentEnrollments,
    });
}
