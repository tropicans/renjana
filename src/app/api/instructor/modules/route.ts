import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getInstructorScope } from "@/lib/instructor-scope";

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

        if (user!.role === "INSTRUCTOR") {
            const scope = await getInstructorScope(user!.id, user!.name);
            if (!scope.courseIds.includes(courseId)) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
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
    } catch (error) {
        console.error("Error creating module:", error);
        return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
    }
}
