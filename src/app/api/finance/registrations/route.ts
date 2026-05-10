import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function GET(req: Request) {
    const { error } = await requireRole("FINANCE", "ADMIN");
    if (error) return error;

    const url = new URL(req.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * pageSize;

    const [registrations, total] = await Promise.all([
        prisma.registration.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
                documents: { orderBy: { createdAt: "asc" } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.registration.count(),
    ]);

    return NextResponse.json({
        registrations,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    });
}
