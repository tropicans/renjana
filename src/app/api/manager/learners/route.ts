import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAuthPolicy } from "@/lib/route-policy";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function parsePagination(req: Request) {
    const url = new URL(req.url);
    const hasPage = url.searchParams.has("page");
    const hasPageSize = url.searchParams.has("pageSize");

    if (!hasPage && !hasPageSize) {
        return { paginate: false as const };
    }

    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
    return { paginate: true as const, page, pageSize, skip: (page - 1) * pageSize };
}

export async function GET(req: Request) {
    const policy = await requireApiAuthPolicy(req, { roles: ["MANAGER", "ADMIN"] });
    if (!policy.ok) return policy.response;

    const paginationConfig = parsePagination(req);
    const [enrollments, total, allStatsData] = await Promise.all([
        prisma.enrollment.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                course: { select: { id: true, title: true } },
                certificate: { select: { id: true, issuedAt: true } },
            },
            orderBy: { enrolledAt: "desc" },
            ...(paginationConfig.paginate ? { skip: paginationConfig.skip, take: paginationConfig.pageSize } : {}),
        }),
        prisma.enrollment.count(),
        prisma.enrollment.findMany({
            select: {
                userId: true,
                status: true,
                completionPercentage: true,
            },
        }),
    ]);

    const stats = {
        totalLearners: new Set(allStatsData.map((enrollment) => enrollment.userId)).size,
        activeEnrollments: allStatsData.filter((enrollment) => enrollment.status === "ACTIVE").length,
        completedEnrollments: allStatsData.filter((enrollment) => enrollment.status === "COMPLETED").length,
        avgCompletion: allStatsData.length
            ? Math.round(allStatsData.reduce((sum, enrollment) => sum + enrollment.completionPercentage, 0) / allStatsData.length)
            : 0,
    };

    return NextResponse.json({
        enrollments,
        stats,
        pagination: {
            page: paginationConfig.paginate ? paginationConfig.page : 1,
            pageSize: paginationConfig.paginate ? paginationConfig.pageSize : total,
            total,
            totalPages: paginationConfig.paginate ? Math.max(1, Math.ceil(total / paginationConfig.pageSize)) : 1,
        },
    });
}
