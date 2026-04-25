import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { isRegistrationDocumentType } from "@/lib/events";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
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
    const { user, error } = await requireAuth();
    if (error) return error;

    const { id } = await params;
    const registration = await prisma.registration.findUnique({ where: { id } });
    if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.userId !== user!.id) {
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

    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "registrations", registration.id);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const safeType = type.toLowerCase();
    const fileName = `${safeType}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const document = await prisma.registrationDocument.upsert({
        where: { registrationId_type: { registrationId: registration.id, type } },
        update: {
            fileUrl: `/uploads/registrations/${registration.id}/${fileName}`,
            fileName: file.name,
            fileType: file.type,
            reviewStatus: "PENDING",
            adminNote: null,
        },
        create: {
            registrationId: registration.id,
            type,
            fileUrl: `/uploads/registrations/${registration.id}/${fileName}`,
            fileName: file.name,
            fileType: file.type,
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
