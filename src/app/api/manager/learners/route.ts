import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
    const { error } = await requireRole("MANAGER", "ADMIN");
    if (error) return error;

    const enrollments = await prisma.enrollment.findMany({
        include: {
            user: { select: { id: true, fullName: true, email: true } },
            course: { select: { id: true, title: true } },
            certificate: { select: { id: true, issuedAt: true } },
        },
        orderBy: { enrolledAt: "desc" },
    });

    const stats = {
        totalLearners: new Set(enrollments.map((enrollment) => enrollment.userId)).size,
        activeEnrollments: enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length,
        completedEnrollments: enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length,
        avgCompletion: enrollments.length
            ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.completionPercentage, 0) / enrollments.length)
            : 0,
    };

    return NextResponse.json({ enrollments, stats });
}
