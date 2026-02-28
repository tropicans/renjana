import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth-utils";

// POST /api/attendance — check-in with optional GPS
export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { lessonId, latitude, longitude, notes } = await req.json();
    if (!lessonId) {
        return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
        data: {
            userId: user!.id,
            lessonId,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            notes: notes ?? null,
        },
        include: {
            lesson: { select: { title: true, type: true } },
        },
    });

    return NextResponse.json({ attendance }, { status: 201 });
}

// GET /api/attendance — list attendance records
export async function GET(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");
    const role = user!.role;

    // Instructors/Admins can see all attendance for a lesson
    if ((role === "INSTRUCTOR" || role === "ADMIN") && lessonId) {
        const records = await prisma.attendance.findMany({
            where: { lessonId },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                lesson: { select: { id: true, title: true, type: true } },
            },
            orderBy: { checkedAt: "desc" },
        });
        return NextResponse.json({ attendances: records });
    }

    // Learners see their own attendance
    const records = await prisma.attendance.findMany({
        where: { userId: user!.id },
        include: {
            lesson: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    module: { select: { title: true, course: { select: { title: true } } } },
                },
            },
        },
        orderBy: { checkedAt: "desc" },
    });

    return NextResponse.json({ attendances: records });
}
