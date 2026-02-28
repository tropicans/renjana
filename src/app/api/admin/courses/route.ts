import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";

// GET /api/admin/courses — list all courses (admin)
export async function GET() {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const courses = await prisma.course.findMany({
        include: {
            _count: { select: { modules: true, enrollments: true } },
            modules: {
                include: { _count: { select: { lessons: true } } },
                orderBy: { order: "asc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
}

// POST /api/admin/courses — create a new course
export async function POST(req: Request) {
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    const { title, description, status, modules } = await req.json();
    if (!title) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const course = await prisma.course.create({
        data: {
            title,
            description: description ?? null,
            status: status ?? "DRAFT",
            modules: modules?.length
                ? {
                    create: modules.map((m: { title: string; order: number; lessons?: { title: string; type: string; order: number; durationMin?: number }[] }, i: number) => ({
                        title: m.title,
                        order: m.order ?? i + 1,
                        lessons: m.lessons?.length
                            ? {
                                create: m.lessons.map((l, j) => ({
                                    title: l.title,
                                    type: l.type ?? "VIDEO",
                                    order: l.order ?? j + 1,
                                    durationMin: l.durationMin ?? null,
                                })),
                            }
                            : undefined,
                    }))
                }
                : undefined,
        },
        include: {
            modules: { include: { lessons: true }, orderBy: { order: "asc" } },
        },
    });

    return NextResponse.json({ course }, { status: 201 });
}
