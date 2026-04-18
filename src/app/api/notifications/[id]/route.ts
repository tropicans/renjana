import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const notification = await prisma.notification.findUnique({
        where: { id },
        select: { id: true, userId: true, isRead: true },
    });

    if (!notification || notification.userId !== user!.id) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (!notification.isRead) {
        await prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    return NextResponse.json({ success: true });
}
