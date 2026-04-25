import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getInstructorScope } from "@/lib/instructor-scope";

// GET /api/instructor/stats — instructor dashboard stats
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role === "INSTRUCTOR") {
        const scope = await getInstructorScope(user!.id, user!.name);
        if (scope.enrollmentPairs.length === 0) {
            return NextResponse.json({
                stats: {
                    totalCourses: 0,
                    totalEnrollments: 0,
                    completedEnrollments: 0,
                    totalAttendances: 0,
                    totalEvidences: 0,
                    avgProgress: 0,
                    courses: [],
                },
                recentEnrollments: [],
            });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                OR: scope.enrollmentPairs.map((pair) => ({
                    userId: pair.userId,
                    courseId: pair.courseId,
                })),
            },
            include: {
                user: { select: { fullName: true } },
                course: { select: { id: true, title: true } },
            },
            orderBy: { enrolledAt: "desc" },
        });

        const totalCourses = new Set(enrollments.map((enrollment) => enrollment.courseId)).size;
        const totalEnrollments = enrollments.length;
        const completedEnrollments = enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length;
        const avgProgress = enrollments.length
            ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.completionPercentage, 0) / enrollments.length)
            : 0;

        const learnerIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.userId)));
        const totalAttendances = learnerIds.length === 0 || scope.courseIds.length === 0
            ? 0
            : await prisma.attendance.count({
                where: {
                    userId: { in: learnerIds },
                    lesson: {
                        module: {
                            courseId: { in: scope.courseIds },
                        },
                    },
                },
            });

        const coursesMap = new Map<string, { id: string; title: string; enrollments: number }>();
        for (const enrollment of enrollments) {
            const existing = coursesMap.get(enrollment.courseId) ?? {
                id: enrollment.course.id,
                title: enrollment.course.title,
                enrollments: 0,
            };
            existing.enrollments += 1;
            coursesMap.set(enrollment.courseId, existing);
        }

        const courses = Array.from(coursesMap.values()).map((course) => ({
            id: course.id,
            title: course.title,
            _count: { enrollments: course.enrollments },
        }));

        return NextResponse.json({
            stats: {
                totalCourses,
                totalEnrollments,
                completedEnrollments,
                totalAttendances,
                totalEvidences: 0,
                avgProgress,
                courses,
            },
            recentEnrollments: enrollments.slice(0, 5),
        });
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
