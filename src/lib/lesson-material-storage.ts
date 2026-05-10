import { unlink } from "fs/promises";
import path from "path";

const MANAGED_UPLOAD_ROOT = path.resolve(process.cwd(), "public", "uploads", "lesson-materials");
const MANAGED_PREFIX = "/uploads/lesson-materials/";

function toManagedAbsolutePath(fileUrl: string): string | null {
    if (!fileUrl.startsWith(MANAGED_PREFIX)) return null;

    const relativePath = fileUrl.slice(MANAGED_PREFIX.length);
    if (!relativePath || relativePath.includes("\\")) return null;

    const resolvedPath = path.resolve(MANAGED_UPLOAD_ROOT, relativePath);
    const relativeToRoot = path.relative(MANAGED_UPLOAD_ROOT, resolvedPath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
        return null;
    }

    return resolvedPath;
}

export function collectManagedLessonMaterialUrls(urls: Array<string | null | undefined>): string[] {
    return Array.from(new Set(urls.filter((url): url is string => Boolean(url && toManagedAbsolutePath(url)))));
}

export async function deleteManagedLessonMaterialUrls(urls: Array<string | null | undefined>) {
    const managedUrls = collectManagedLessonMaterialUrls(urls);

    await Promise.all(managedUrls.map(async (url) => {
        const absolutePath = toManagedAbsolutePath(url);
        if (!absolutePath) return;

        try {
            await unlink(absolutePath);
        } catch (error) {
            const nodeError = error as NodeJS.ErrnoException;
            if (nodeError.code !== "ENOENT") {
                throw error;
            }
        }
    }));
}
