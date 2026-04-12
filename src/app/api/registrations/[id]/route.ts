import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;

    const registration = await prisma.registration.findUnique({
        where: { id },
        include: {
            event: {
                include: {
                    course: {
                        include: {
                            modules: {
                                orderBy: { order: "asc" },
                                include: { lessons: { orderBy: { order: "asc" } } },
                            },
                            quizzes: { orderBy: { createdAt: "asc" } },
                        },
                    },
                },
            },
            documents: { orderBy: { createdAt: "asc" } },
            user: { select: { id: true, fullName: true, email: true } },
        },
    });

    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.userId !== user!.id && user!.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ registration });
}
