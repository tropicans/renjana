import { describe, expect, it, vi } from "vitest";

const unlinkMock = vi.hoisted(() => vi.fn());

vi.mock("fs/promises", () => ({
    unlink: unlinkMock,
}));

import { collectManagedLessonMaterialUrls, deleteManagedLessonMaterialUrls } from "@/lib/lesson-material-storage";

describe("lesson material storage", () => {
    it("collects only managed in-root lesson material URLs", () => {
        expect(collectManagedLessonMaterialUrls([
            "/uploads/lesson-materials/file.pdf",
            "/uploads/lesson-materials/../../secrets.txt",
            "/uploads/lesson-materials/..\\secrets.txt",
            "/uploads/evidence/file.pdf",
            "/uploads/lesson-materials/file.pdf",
            null,
            undefined,
        ])).toEqual(["/uploads/lesson-materials/file.pdf"]);
    });

    it("deletes only managed files inside lesson material root", async () => {
        unlinkMock.mockResolvedValue(undefined);

        await deleteManagedLessonMaterialUrls([
            "/uploads/lesson-materials/file.pdf",
            "/uploads/lesson-materials/../../secrets.txt",
        ]);

        expect(unlinkMock).toHaveBeenCalledTimes(1);
        expect(unlinkMock.mock.calls[0]?.[0]).toContain("public");
        expect(unlinkMock.mock.calls[0]?.[0]).toContain("uploads");
        expect(unlinkMock.mock.calls[0]?.[0]).toContain("lesson-materials");
        expect(unlinkMock.mock.calls[0]?.[0]).toContain("file.pdf");
    });
});
