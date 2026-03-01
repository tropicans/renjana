import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

// POST /api/instructor/modules — create a new module
export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    // Optional: Check if user is INSTRUCTOR or ADMIN
    if (user!.role !== "INSTRUCTOR" && user!.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { courseId, title, order } = body;

        if (!courseId || !title || order === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the module
        const newModule = await prisma.module.create({
            data: {
                courseId,
                title,
                order,
            },
        });

        return NextResponse.json({ module: newModule }, { status: 201 });
    } catch (e: any) {
        console.error("Error creating module:", e);
        return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
    }
}
