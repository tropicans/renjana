import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// GET /api/admin/courses/:id — get course detail
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            modules: {
                include: { lessons: true },
                orderBy: { order: "asc" },
            },
            enrollments: {
                include: { user: { select: { id: true, fullName: true, email: true } } },
                orderBy: { enrolledAt: "desc" },
            },
        },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
}

// PUT /api/admin/courses/:id — update course
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const { title, description, status } = await req.json();

    const course = await prisma.course.update({
        where: { id },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(status && { status }),
        },
    });

    return NextResponse.json({ course });
}

// DELETE /api/admin/courses/:id — delete course
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
