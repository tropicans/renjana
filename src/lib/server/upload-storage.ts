import { mkdir, writeFile } from "fs/promises";
import path from "path";

type UploadBucket = "evidence" | "registration-documents" | "lesson-materials" | "certificates";

const bucketRoots: Record<UploadBucket, { disk: string[]; url: string[] }> = {
    evidence: {
        disk: ["uploads", "evidence"],
        url: ["uploads", "evidence"],
    },
    "registration-documents": {
        disk: ["public", "uploads", "registrations"],
        url: ["uploads", "registrations"],
    },
    "lesson-materials": {
        disk: ["public", "uploads", "lesson-materials"],
        url: ["uploads", "lesson-materials"],
    },
    certificates: {
        disk: ["uploads", "certificates"],
        url: ["uploads", "certificates"],
    },
};

function normalizeParts(parts: Array<string | null | undefined>) {
    return parts
        .map((part) => (part || "").replace(/\\/g, "/").trim())
        .filter(Boolean)
        .map((part) => part.replace(/^\/+|\/+$/g, ""));
}

export async function saveManagedUpload(input: {
    bucket: UploadBucket;
    fileName: string;
    buffer: Buffer;
    pathParts?: Array<string | null | undefined>;
}) {
    const root = bucketRoots[input.bucket];
    const relativeParts = normalizeParts(input.pathParts ?? []);
    const uploadDir = path.join(process.cwd(), ...root.disk, ...relativeParts);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, input.fileName);
    await writeFile(filePath, input.buffer);

    const fileUrl = `/${[...root.url, ...relativeParts, input.fileName].join("/")}`;
    return {
        filePath,
        fileUrl,
        fileName: input.fileName,
    };
}
