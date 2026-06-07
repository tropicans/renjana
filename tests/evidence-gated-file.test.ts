import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
    requireApiAuthPolicy: vi.fn(),
    getInstructorScope: vi.fn(),
    readFile: vi.fn(),
    prisma: {
        evidence: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("@/lib/instructor-scope", () => ({
    getInstructorScope: mocks.getInstructorScope,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("fs/promises", () => ({
    readFile: mocks.readFile,
}));

import { GET } from "@/app/api/evidence/[id]/file/route";

describe("GET /api/evidence/[id]/file", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns policy response if auth policy check fails", async () => {
        const mockResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: false,
            response: mockResponse,
        });

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(401);
        const body = await response.json();
        expect(body.error).toBe("Unauthorized");
        expect(mocks.prisma.evidence.findUnique).not.toHaveBeenCalled();
    });

    it("returns 404 if evidence is not found in database", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "user-1", role: "LEARNER", name: "Learner One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue(null);

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("Evidence not found");
    });

    it("returns 403 if the user is a learner but does not own the evidence", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "user-1", role: "LEARNER", name: "Learner One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue({
            id: "ev-1",
            userId: "user-2", // different owner
            fileUrl: "/uploads/evidence/some-file.pdf",
            fileType: "application/pdf",
        });

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Forbidden");
        expect(mocks.readFile).not.toHaveBeenCalled();
    });

    it("returns 403 if user is an instructor but student is not in scope", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "inst-1", role: "INSTRUCTOR", name: "Instructor One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue({
            id: "ev-1",
            userId: "user-2",
            fileUrl: "/uploads/evidence/some-file.pdf",
            fileType: "application/pdf",
        });
        mocks.getInstructorScope.mockResolvedValue({
            enrollmentPairs: [], // no enrolled students in scope
        });

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Forbidden");
        expect(mocks.readFile).not.toHaveBeenCalled();
    });

    it("streams file successfully if user is the owner learner", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "user-1", role: "LEARNER", name: "Learner One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue({
            id: "ev-1",
            userId: "user-1", // owner matches
            fileUrl: "/uploads/evidence/some-file.pdf",
            fileType: "application/pdf",
        });
        const fileContent = Buffer.from("pdf-data");
        mocks.readFile.mockResolvedValue(fileContent);

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/pdf");
        const bodyText = await response.text();
        expect(bodyText).toBe("pdf-data");
    });

    it("streams file successfully if user is a scoped instructor", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "inst-1", role: "INSTRUCTOR", name: "Instructor One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue({
            id: "ev-1",
            userId: "user-2",
            fileUrl: "/uploads/evidence/image.png",
            fileType: "image/png",
        });
        mocks.getInstructorScope.mockResolvedValue({
            enrollmentPairs: [{ userId: "user-2", classGroupId: "cg-1" }],
        });
        const fileContent = Buffer.from("png-data");
        mocks.readFile.mockResolvedValue(fileContent);

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("image/png");
        const bodyText = await response.text();
        expect(bodyText).toBe("png-data");
    });

    it("streams file successfully if user is an admin", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "admin-1", role: "ADMIN", name: "Admin One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue({
            id: "ev-1",
            userId: "user-2",
            fileUrl: "/uploads/evidence/some-file.pdf",
            fileType: "application/pdf",
        });
        const fileContent = Buffer.from("pdf-data");
        mocks.readFile.mockResolvedValue(fileContent);

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe("application/pdf");
        const bodyText = await response.text();
        expect(bodyText).toBe("pdf-data");
    });

    it("returns 404 if file exists in DB but is missing on disk", async () => {
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "user-1", role: "LEARNER", name: "Learner One" },
        });
        mocks.prisma.evidence.findUnique.mockResolvedValue({
            id: "ev-1",
            userId: "user-1",
            fileUrl: "/uploads/evidence/missing-file.pdf",
            fileType: "application/pdf",
        });
        mocks.readFile.mockRejectedValue(new Error("ENOENT"));

        const response = await GET(new Request("http://localhost/api/evidence/ev-1/file"), {
            params: Promise.resolve({ id: "ev-1" }),
        });

        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toBe("File not found on disk");
    });
});
