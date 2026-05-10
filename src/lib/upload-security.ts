import crypto from "node:crypto";

export type UploadValidationRule = {
    mime: string;
    ext: string;
    category: string;
};

type UploadSignatureMatch = UploadValidationRule & {
    matches: (buffer: Uint8Array) => boolean;
};

const JPEG_SIGNATURES = [0xff, 0xd8, 0xff];
const PNG_SIGNATURES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP_WEBP = [0x57, 0x45, 0x42, 0x50];
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46];
const MP4_FTYP = [0x66, 0x74, 0x79, 0x70];
const WEBM_SIGNATURE = [0x1a, 0x45, 0xdf, 0xa3];

function startsWithBytes(buffer: Uint8Array, bytes: number[], offset = 0) {
    if (buffer.length < offset + bytes.length) return false;
    return bytes.every((byte, index) => buffer[offset + index] === byte);
}

const SIGNATURE_MATCHERS: UploadSignatureMatch[] = [
    {
        mime: "image/jpeg",
        ext: "jpg",
        category: "image",
        matches: (buffer) => startsWithBytes(buffer, JPEG_SIGNATURES),
    },
    {
        mime: "image/png",
        ext: "png",
        category: "image",
        matches: (buffer) => startsWithBytes(buffer, PNG_SIGNATURES),
    },
    {
        mime: "image/webp",
        ext: "webp",
        category: "image",
        matches: (buffer) => startsWithBytes(buffer, WEBP_RIFF) && startsWithBytes(buffer, WEBP_WEBP, 8),
    },
    {
        mime: "application/pdf",
        ext: "pdf",
        category: "pdf",
        matches: (buffer) => startsWithBytes(buffer, PDF_SIGNATURE),
    },
    {
        mime: "video/mp4",
        ext: "mp4",
        category: "video",
        matches: (buffer) => startsWithBytes(buffer, MP4_FTYP, 4),
    },
    {
        mime: "video/webm",
        ext: "webm",
        category: "video",
        matches: (buffer) => startsWithBytes(buffer, WEBM_SIGNATURE),
    },
];

export async function validateUploadedFile(file: File, allowedMimeTypes: string[]) {
    const matcher = SIGNATURE_MATCHERS.find((candidate) => candidate.mime === file.type && allowedMimeTypes.includes(candidate.mime));
    if (!matcher) {
        return { ok: false as const, error: "File type not allowed" };
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    if (!matcher.matches(buffer)) {
        return { ok: false as const, error: "File content does not match declared type" };
    }

    return {
        ok: true as const,
        buffer: Buffer.from(buffer),
        mime: matcher.mime,
        ext: matcher.ext,
        category: matcher.category,
    };
}

export function buildSafeUploadFileName(prefix: string, ext: string) {
    const safePrefix = prefix.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "") || "upload";
    return `${safePrefix}-${crypto.randomUUID()}.${ext}`;
}
