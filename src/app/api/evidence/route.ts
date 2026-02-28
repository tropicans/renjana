import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST /api/evidence — upload evidence (saves to local storage)
export async function POST(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
        return NextResponse.json({ error: "title and file are required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
            { error: "File type not allowed. Allowed: JPEG, PNG, WebP, PDF" },
            { status: 400 }
        );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    // Save file to local storage
    const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${user!.id}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/evidence/${fileName}`;
    const fileType = file.type.startsWith("image/") ? "image" : "pdf";

    const evidence = await prisma.evidence.create({
        data: {
            userId: user!.id,
            title,
            fileUrl,
            fileType,
        },
    });

    return NextResponse.json({ evidence }, { status: 201 });
}

// GET /api/evidence — list evidence
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;

    // Admins/Instructors see all evidence
    if (role === "ADMIN" || role === "INSTRUCTOR") {
        const records = await prisma.evidence.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });
        return NextResponse.json({ evidences: records });
    }

    // Learners see their own
    const records = await prisma.evidence.findMany({
        where: { userId: user!.id },
        orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ evidences: records });
}
