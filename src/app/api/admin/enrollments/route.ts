import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// GET /api/admin/enrollments — list all enrollments
export async function GET() {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const enrollments = await prisma.enrollment.findMany({
        include: {
            user: { select: { id: true, fullName: true, email: true, role: true } },
            course: { select: { id: true, title: true } },
        },
        orderBy: { enrolledAt: "desc" },
    });

    return NextResponse.json({ enrollments });
}

// POST /api/admin/enrollments — admin-enroll a user
export async function POST(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

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
