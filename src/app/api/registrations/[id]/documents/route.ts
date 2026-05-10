import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { isRegistrationDocumentType } from "@/lib/events";
import { requireApiAuthPolicy } from "@/lib/route-policy";
import { saveManagedUpload } from "@/lib/server/upload-storage";
import { buildSafeUploadFileName, validateUploadedFile } from "@/lib/upload-security";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
const EDITABLE_REGISTRATION_STATUSES = ["DRAFT", "REVISION_REQUIRED"] as const;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const registration = await prisma.registration.findUnique({ where: { id } });

    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.userId !== user!.id && user!.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const documents = await prisma.registrationDocument.findMany({
        where: { registrationId: id },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ documents });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const policy = await requireApiAuthPolicy(req, {
        sameOrigin: true,
        rateLimit: {
            keyParts: ["registration-document-upload"],
            limit: 10,
            windowMs: 10 * 60 * 1000,
            message: "Too many upload attempts. Please try again later.",
        },
    });
    if (!policy.ok) return policy.response;

    const { user } = policy;

    const { id } = await params;
    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.userId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!EDITABLE_REGISTRATION_STATUSES.includes(registration.status as (typeof EDITABLE_REGISTRATION_STATUSES)[number])) {
        return NextResponse.json({ error: "Registration documents can only be updated while the registration is in draft or revision state" }, { status: 403 });
    }

    const formData = await req.formData();
    const type = formData.get("type");
    const file = formData.get("file");

    if (typeof type !== "string" || !(file instanceof File) || !isRegistrationDocumentType(type)) {
        return NextResponse.json({ error: "Valid type and file are required" }, { status: 400 });
    }

    const validation = await validateUploadedFile(file, [...allowedTypes]);
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error === "File type not allowed" ? "File type not allowed" : validation.error }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    const safeType = type.toLowerCase();
    const managedUpload = await saveManagedUpload({
        bucket: "registration-documents",
        pathParts: [registration.id],
        fileName: buildSafeUploadFileName(safeType, validation.ext),
        buffer: validation.buffer,
    });

    const document = await prisma.registrationDocument.upsert({
        where: { registrationId_type: { registrationId: registration.id, type } },
        update: {
            fileUrl: managedUpload.fileUrl,
            fileName: file.name,
            fileType: validation.mime,
            reviewStatus: "PENDING",
            adminNote: null,
        },
        create: {
            registrationId: registration.id,
            type,
            fileUrl: managedUpload.fileUrl,
            fileName: file.name,
            fileType: validation.mime,
        },
    });

    if (type === "PAYMENT_PROOF") {
        await prisma.registration.update({
            where: { id: registration.id },
            data: { paymentStatus: "UPLOADED" },
        });
    }

    return NextResponse.json({ document }, { status: 201 });
}
