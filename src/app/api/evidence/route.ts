import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth-utils";
import { getInstructorScope } from "@/lib/instructor-scope";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { saveManagedUpload } from "@/lib/server/upload-storage";
import { buildSafeUploadFileName, validateUploadedFile } from "@/lib/upload-security";

// POST /api/evidence — upload evidence (saves to local storage)
export async function POST(req: Request) {
    const policy = await requireApiAuthPolicy(req, {
        sameOrigin: true,
        rateLimit: {
            keyParts: ["evidence-upload"],
            limit: 10,
            windowMs: 10 * 60 * 1000,
            message: "Too many upload attempts. Please try again later.",
        },
    });
    if (!policy.ok) return policy.response;

    const { user } = policy;

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
        return NextResponse.json({ error: "title and file are required" }, { status: 400 });
    }

    const validation = await validateUploadedFile(file, ["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    if (!validation.ok) {
        return NextResponse.json(
            { error: validation.error === "File type not allowed" ? "File type not allowed. Allowed: JPEG, PNG, WebP, PDF" : validation.error },
            { status: 400 }
        );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    const managedUpload = await saveManagedUpload({
        bucket: "evidence",
        fileName: buildSafeUploadFileName(user!.id, validation.ext),
        buffer: validation.buffer,
    });

    const fileUrl = managedUpload.fileUrl;
    const fileType = validation.category;

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
export async function GET(req: Request) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const whereClause: Prisma.EvidenceWhereInput = {};
    if (!all) {
        whereClause.rating = null;
    }

    // Admins see all evidence
    if (role === "ADMIN") {
        const records = await prisma.evidence.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });
        return NextResponse.json({ evidences: records });
    }

    // Instructors see only their scoped learners' evidence
    if (role === "INSTRUCTOR") {
        const scope = await getInstructorScope(user!.id, user!.name);
        const learnerIds = Array.from(new Set(scope.enrollmentPairs.map((pair) => pair.userId)));
        if (learnerIds.length === 0) {
            return NextResponse.json({ evidences: [] });
        }
        const records = await prisma.evidence.findMany({
            where: {
                userId: { in: learnerIds },
                ...whereClause,
            },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });
        return NextResponse.json({ evidences: records });
    }

    // Learners see their own
    const records = await prisma.evidence.findMany({
        where: {
            userId: user!.id,
            ...whereClause,
        },
        orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ evidences: records });
}
