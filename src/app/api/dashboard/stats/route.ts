import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// GET /api/dashboard/stats — role-based dashboard statistics
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;

    if (role === "ADMIN") {
        const [totalUsers, totalCourses, totalEnrollments, activeEnrollments, completedEnrollments] =
            await Promise.all([
                prisma.user.count(),
                prisma.course.count(),
                prisma.enrollment.count(),
                prisma.enrollment.count({ where: { status: "ACTIVE" } }),
                prisma.enrollment.count({ where: { status: "COMPLETED" } }),
            ]);

        return NextResponse.json({
            role,
            totalUsers,
            totalCourses,
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
        });
    }

    if (role === "LEARNER") {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: user!.id },
            include: {
                course: {
                    include: {
                        modules: { include: { lessons: { select: { durationMin: true } } } },
                    },
                },
            },
        });

        const activeCourses = enrollments.filter((e) => e.status === "ACTIVE").length;
        const completedCourses = enrollments.filter((e) => e.status === "COMPLETED").length;
        const totalHoursLearned = enrollments.reduce((sum, e) => {
            const totalMin = e.course.modules.reduce(
                (ms, m) => ms + m.lessons.reduce((ls, l) => ls + (l.durationMin ?? 0), 0),
                0
            );
            return sum + (totalMin * (e.completionPercentage / 100)) / 60;
        }, 0);

        return NextResponse.json({
            role,
            enrolledCourses: enrollments.length,
            activeCourses,
            completedCourses,
            totalHoursLearned: Math.round(totalHoursLearned * 10) / 10,
        });
    }

    if (role === "INSTRUCTOR") {
        const totalLearners = await prisma.enrollment.count();
        const activeLearners = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
        const totalCourses = await prisma.course.count();

        return NextResponse.json({
            role,
            totalCourses,
            totalLearners,
            activeLearners,
        });
    }

    if (role === "MANAGER") {
        const totalLearners = await prisma.user.count({ where: { role: "LEARNER" } });
        const totalEnrollments = await prisma.enrollment.count();
        const completedEnrollments = await prisma.enrollment.count({ where: { status: "COMPLETED" } });

        return NextResponse.json({
            role,
            totalLearners,
            totalEnrollments,
            completedEnrollments,
            completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
        });
    }

    if (role === "FINANCE") {
        const totalEnrollments = await prisma.enrollment.count();

        return NextResponse.json({
            role,
            totalTransactions: totalEnrollments,
            totalRevenue: totalEnrollments * 2500000, // placeholder pricing
        });
    }

    return NextResponse.json({ role, message: "No stats available" });
}
