import { describe, expect, it } from "vitest";
import { buildSafeUploadFileName, validateUploadedFile } from "@/lib/upload-security";

function makeFile(bytes: number[], name: string, type: string) {
    return new File([Uint8Array.from(bytes)], name, { type });
}

describe("upload security", () => {
    it("accepts matching PNG signature and derives safe metadata", async () => {
        const file = makeFile([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00], "avatar.png", "image/png");

        const result = await validateUploadedFile(file, ["image/png"]);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.ext).toBe("png");
            expect(result.mime).toBe("image/png");
            expect(result.category).toBe("image");
        }
    });

    it("rejects declared type mismatch by magic bytes", async () => {
        const file = makeFile([0x25, 0x50, 0x44, 0x46], "avatar.png", "image/png");

        await expect(validateUploadedFile(file, ["image/png"])).resolves.toEqual({
            ok: false,
            error: "File content does not match declared type",
        });
    });

    it("builds randomized safe filenames", () => {
        const fileName = buildSafeUploadFileName("lesson material", "pdf");

        expect(fileName).toMatch(/^lesson-material-[0-9a-f-]+\.pdf$/i);
    });
});
