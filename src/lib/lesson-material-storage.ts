import { unlink } from "fs/promises";
import path from "path";

const MANAGED_PREFIX = "/uploads/lesson-materials/";

function toManagedAbsolutePath(fileUrl: string): string | null {
    if (!fileUrl.startsWith(MANAGED_PREFIX)) return null;

    const relativePath = fileUrl.replace(/^\//, "");
    return path.join(process.cwd(), "public", relativePath);
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
