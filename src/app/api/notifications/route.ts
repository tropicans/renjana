import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { assertSameOrigin } from "@/lib/request-security";

export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where: { userId: user!.id },
            orderBy: { createdAt: "desc" },
            take: 10,
        }),
        prisma.notification.count({
            where: {
                userId: user!.id,
                isRead: false,
            },
        }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;
    const sameOriginError = assertSameOrigin(req);
    if (sameOriginError) return sameOriginError;

    await prisma.notification.updateMany({
        where: {
            userId: user!.id,
            isRead: false,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return NextResponse.json({ success: true });
}
