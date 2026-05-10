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
// GET /api/admin/enrollments — list all enrollments
export async function GET(req: Request) {
    const policy = await requireApiAuthPolicy(req, { roles: ["ADMIN"] });
    if (!policy.ok) return policy.response;

    const { page, pageSize, skip } = parsePagination(req);
    const [enrollments, total] = await Promise.all([
        prisma.enrollment.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true, role: true } },
                course: { select: { id: true, title: true } },
            },
            orderBy: { enrolledAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.enrollment.count(),
    ]);

    return NextResponse.json({
        enrollments,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    });
}

// POST /api/admin/enrollments — admin-enroll a user
export async function POST(req: Request) {
    const policy = await requireApiAuthPolicy(req, { roles: ["ADMIN"], sameOrigin: true });
    if (!policy.ok) return policy.response;

    const { userId, courseId } = await req.json();
    if (!userId || !courseId) {
        return NextResponse.json({ error: "userId and courseId required" }, { status: 400 });
    }

    const existing = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
        return NextResponse.json({ error: "Already enrolled" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
        data: { userId, courseId, status: "ACTIVE", completionPercentage: 0 },
        include: {
            user: { select: { id: true, fullName: true, email: true } },
            course: { select: { id: true, title: true } },
        },
    });

    return NextResponse.json({ enrollment }, { status: 201 });
}
