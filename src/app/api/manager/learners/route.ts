import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAuthPolicy } from "@/lib/route-policy";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function parsePagination(req: Request) {
    const url = new URL(req.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
    return { page, pageSize, skip: (page - 1) * pageSize };
}

export async function GET(req: Request) {
    const policy = await requireApiAuthPolicy(req, { roles: ["MANAGER", "ADMIN"] });
    if (!policy.ok) return policy.response;

    const { page, pageSize, skip } = parsePagination(req);
    const [enrollments, total] = await Promise.all([
        prisma.enrollment.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                course: { select: { id: true, title: true } },
                certificate: { select: { id: true, issuedAt: true } },
            },
            orderBy: { enrolledAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.enrollment.count(),
    ]);

    const stats = {
        totalLearners: new Set(enrollments.map((enrollment) => enrollment.userId)).size,
        activeEnrollments: enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length,
        completedEnrollments: enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length,
        avgCompletion: enrollments.length
            ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.completionPercentage, 0) / enrollments.length)
            : 0,
    };

    return NextResponse.json({
        enrollments,
        stats,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    });
}
