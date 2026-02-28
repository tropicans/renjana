import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// PUT /api/admin/users/:id — update user (admin only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;
    const data = await req.json();

    const allowedFields: Record<string, unknown> = {};
    if (data.fullName !== undefined) allowedFields.fullName = data.fullName;
    if (data.role !== undefined) allowedFields.role = data.role;
    if (data.isActive !== undefined) allowedFields.isActive = data.isActive;

    const user = await prisma.user.update({
        where: { id },
        data: allowedFields,
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
            createdAt: true,
            _count: { select: { enrollments: true } },
        },
    });

    return NextResponse.json({ user });
}

// DELETE /api/admin/users/:id — deactivate user (admin only)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const { id } = await params;

    await prisma.user.update({
        where: { id },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true });
}
