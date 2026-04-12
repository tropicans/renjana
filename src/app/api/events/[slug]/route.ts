import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            _count: { select: { registrations: true } },
            course: {
                include: {
                    modules: {
                        orderBy: { order: "asc" },
                        include: {
                            lessons: { orderBy: { order: "asc" } },
                        },
                    },
                    quizzes: {
                        orderBy: { createdAt: "asc" },
                        select: { id: true, title: true, type: true, passingScore: true },
                    },
                },
            },
        },
    });

    if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
}
