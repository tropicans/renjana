import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// GET /api/admin/audit — list audit logs
export async function GET(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const logs = await prisma.auditLog.findMany({
        include: {
            user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return NextResponse.json({ logs });
}
