import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

export async function GET() {
    const { error } = await requireRole("FINANCE", "ADMIN");
    if (error) return error;

    const registrations = await prisma.registration.findMany({
        include: {
            user: { select: { id: true, fullName: true, email: true } },
            event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
            documents: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ registrations });
}
