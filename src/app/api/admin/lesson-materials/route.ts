import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { deleteManagedLessonMaterialUrls } from "@/lib/lesson-material-storage";
import { buildRateLimitKey, enforceRateLimit, getRateLimitIp } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/request-security";
import { saveManagedUpload } from "@/lib/server/upload-storage";
import { buildSafeUploadFileName, validateUploadedFile } from "@/lib/upload-security";

const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
] as const;

export async function POST(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;
    const sameOriginError = assertSameOrigin(req);
    if (sameOriginError) return sameOriginError;

    const rateLimitResponse = enforceRateLimit({
        key: buildRateLimitKey(["lesson-material-upload", getRateLimitIp(req)]),
        limit: 10,
        windowMs: 10 * 60 * 1000,
        message: "Too many upload attempts. Please try again later.",
    });
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "File materi wajib dipilih." }, { status: 400 });
    }

    const validation = await validateUploadedFile(file, [...ALLOWED_TYPES]);
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error === "File type not allowed" ? "Tipe file belum didukung. Gunakan PDF, gambar, atau video MP4/WebM." : validation.error }, { status: 400 });
    }

    if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 25MB." }, { status: 400 });
    }

    const managedUpload = await saveManagedUpload({
        bucket: "lesson-materials",
        fileName: buildSafeUploadFileName("lesson-material", validation.ext),
        buffer: validation.buffer,
    });

    return NextResponse.json({
        fileUrl: managedUpload.fileUrl,
        fileName: file.name,
        fileType: validation.mime,
        fileSize: file.size,
    }, { status: 201 });
}

export async function DELETE(req: Request) {
    const { error } = await requireRole("ADMIN");
    if (error) return error;
    const sameOriginError = assertSameOrigin(req);
    if (sameOriginError) return sameOriginError;

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
