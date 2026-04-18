import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireRole } from "@/lib/auth-utils";
import { deleteManagedLessonMaterialUrls } from "@/lib/lesson-material-storage";

const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export async function POST(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "File materi wajib dipilih." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Tipe file belum didukung. Gunakan PDF, gambar, video MP4/WebM, DOC/DOCX, atau PPT/PPTX." }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 25MB." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "lesson-materials");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `lesson-material-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return NextResponse.json({
        fileUrl: `/uploads/lesson-materials/${fileName}`,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
    }, { status: 201 });
}

export async function DELETE(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const fileUrls = Array.isArray(body.fileUrls)
        ? body.fileUrls.filter((url: unknown): url is string => typeof url === "string" && url.trim().length > 0)
        : [];

    if (fileUrls.length === 0) {
        return NextResponse.json({ error: "fileUrls wajib diisi." }, { status: 400 });
    }

    await deleteManagedLessonMaterialUrls(fileUrls);

    return NextResponse.json({ success: true });
}
