import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    requireRole: vi.fn(),
    requireApiAuthPolicy: vi.fn(),
    writeSecurityAuditLog: vi.fn(),
    getInstructorScope: vi.fn(),
    unlink: vi.fn(),
    prisma: {
        evidence: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
    requireRole: mocks.requireRole,
}));

vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("fs/promises", () => ({
    unlink: mocks.unlink,
}));

vi.mock("@/lib/audit", () => ({
    writeSecurityAuditLog: mocks.writeSecurityAuditLog,
}));

vi.mock("@/lib/instructor-scope", () => ({
    getInstructorScope: mocks.getInstructorScope,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { GET } from "@/app/api/evidence/route";
import { PUT, DELETE } from "@/app/api/evidence/[id]/route";

describe("Evidence API Filtering and Grading", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /api/evidence", () => {
        it("filters by rating: null by default (ungraded only) for ADMIN", async () => {
            mocks.requireAuth.mockResolvedValue({
                user: { id: "admin-1", role: "ADMIN" },
                error: null,
            });
            mocks.prisma.evidence.findMany.mockResolvedValue([]);

            const response = await GET(new Request("http://localhost/api/evidence"));
            expect(response.status).toBe(200);

            expect(mocks.prisma.evidence.findMany).toHaveBeenCalledWith({
                where: { rating: null },
                include: {
                    user: { select: { id: true, fullName: true, email: true } },
                },
                orderBy: { uploadedAt: "desc" },
            });
        });

        it("bypasses rating filter when all=true is provided for ADMIN", async () => {
            mocks.requireAuth.mockResolvedValue({
                user: { id: "admin-1", role: "ADMIN" },
                error: null,
            });
            mocks.prisma.evidence.findMany.mockResolvedValue([]);

            const response = await GET(new Request("http://localhost/api/evidence?all=true"));
            expect(response.status).toBe(200);

            expect(mocks.prisma.evidence.findMany).toHaveBeenCalledWith({
                where: {},
                include: {
                    user: { select: { id: true, fullName: true, email: true } },
                },
                orderBy: { uploadedAt: "desc" },
            });
        });
    });

    describe("PUT /api/evidence/[id]", () => {
        it("rejects unauthorized roles (not INSTRUCTOR or ADMIN)", async () => {
            const nextResponseError = NextResponse.json({ error: "Forbidden" }, { status: 403 });
            mocks.requireRole.mockResolvedValue({
                user: null,
                error: nextResponseError,
            });

            const response = await PUT(
                new Request("http://localhost/api/evidence/ev-1", {
                    method: "PUT",
                    body: JSON.stringify({ rating: 4, comment: "Good job" }),
                }),
                { params: Promise.resolve({ id: "ev-1" }) }
            );

            expect(response.status).toBe(403);
            expect(mocks.prisma.evidence.update).not.toHaveBeenCalled();
        });

        it("rejects invalid rating inputs (out of bounds)", async () => {
            mocks.requireRole.mockResolvedValue({
                user: { id: "inst-1", role: "INSTRUCTOR" },
                error: null,
            });

            const response = await PUT(
                new Request("http://localhost/api/evidence/ev-1", {
                    method: "PUT",
                    body: JSON.stringify({ rating: 6, comment: "Invalid" }),
                }),
                { params: Promise.resolve({ id: "ev-1" }) }
            );

            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toBe("Rating must be an integer between 1 and 5");
            expect(mocks.prisma.evidence.update).not.toHaveBeenCalled();
        });

        it("accepts valid grading inputs, updates DB and logs audit trace", async () => {
            mocks.requireRole.mockResolvedValue({
                user: { id: "inst-1", role: "INSTRUCTOR" },
                error: null,
            });
            mocks.prisma.evidence.findUnique.mockResolvedValue({ id: "ev-1" });
            mocks.prisma.evidence.update.mockResolvedValue({
                id: "ev-1",
                rating: 5,
                comment: "Excellent",
            });

            const response = await PUT(
                new Request("http://localhost/api/evidence/ev-1", {
                    method: "PUT",
                    body: JSON.stringify({ rating: 5, comment: "Excellent" }),
                }),
                { params: Promise.resolve({ id: "ev-1" }) }
            );

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.evidence.rating).toBe(5);

            expect(mocks.prisma.evidence.update).toHaveBeenCalledWith({
                where: { id: "ev-1" },
                data: { rating: 5, comment: "Excellent" },
            });

            expect(mocks.writeSecurityAuditLog).toHaveBeenCalledWith(expect.anything(), {
                userId: "inst-1",
                action: "GRADE_EVIDENCE",
                entity: "EVIDENCE",
                entityId: "ev-1",
                metadata: { rating: 5, comment: "Excellent" },
            });
        });
    });

    describe("DELETE /api/evidence/[id]", () => {
        it("returns policy response if auth policy check fails", async () => {
            const mockResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            mocks.requireApiAuthPolicy.mockResolvedValue({
                ok: false,
                response: mockResponse,
            });

            const response = await DELETE(new Request("http://localhost/api/evidence/ev-1"), {
                params: Promise.resolve({ id: "ev-1" }),
            });

            expect(response.status).toBe(401);
            expect(mocks.prisma.evidence.findUnique).not.toHaveBeenCalled();
        });

        it("returns 404 if evidence to delete is not found", async () => {
            mocks.requireApiAuthPolicy.mockResolvedValue({
                ok: true,
                user: { id: "user-1", role: "LEARNER" },
            });
            mocks.prisma.evidence.findUnique.mockResolvedValue(null);

            const response = await DELETE(new Request("http://localhost/api/evidence/ev-1"), {
                params: Promise.resolve({ id: "ev-1" }),
            });

            expect(response.status).toBe(404);
            const body = await response.json();
            expect(body.error).toBe("Evidence not found");
        });

        it("returns 403 if user is not the owner and not an admin", async () => {
            mocks.requireApiAuthPolicy.mockResolvedValue({
                ok: true,
                user: { id: "user-1", role: "LEARNER" },
            });
            mocks.prisma.evidence.findUnique.mockResolvedValue({
                id: "ev-1",
                userId: "user-2",
                fileUrl: "/uploads/evidence/test.pdf",
                rating: null,
            });

            const response = await DELETE(new Request("http://localhost/api/evidence/ev-1"), {
                params: Promise.resolve({ id: "ev-1" }),
            });

            expect(response.status).toBe(403);
            const body = await response.json();
            expect(body.error).toBe("Forbidden");
            expect(mocks.prisma.evidence.delete).not.toHaveBeenCalled();
        });

        it("returns 400 if the evidence is already graded", async () => {
            mocks.requireApiAuthPolicy.mockResolvedValue({
                ok: true,
                user: { id: "user-1", role: "LEARNER" },
            });
            mocks.prisma.evidence.findUnique.mockResolvedValue({
                id: "ev-1",
                userId: "user-1",
                fileUrl: "/uploads/evidence/test.pdf",
                rating: 4,
            });

            const response = await DELETE(new Request("http://localhost/api/evidence/ev-1"), {
                params: Promise.resolve({ id: "ev-1" }),
            });

            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.error).toBe("Cannot delete graded evidence");
            expect(mocks.prisma.evidence.delete).not.toHaveBeenCalled();
        });

        it("deletes file and DB record successfully for the owner learner", async () => {
            mocks.requireApiAuthPolicy.mockResolvedValue({
                ok: true,
                user: { id: "user-1", role: "LEARNER" },
            });
            mocks.prisma.evidence.findUnique.mockResolvedValue({
                id: "ev-1",
                userId: "user-1",
                title: "My Assignment",
                fileUrl: "/uploads/evidence/test.pdf",
                rating: null,
            });

            const response = await DELETE(new Request("http://localhost/api/evidence/ev-1"), {
                params: Promise.resolve({ id: "ev-1" }),
            });

            expect(response.status).toBe(200);
            const body = await response.json();
            expect(body.success).toBe(true);

            expect(mocks.unlink).toHaveBeenCalledWith(expect.stringContaining("test.pdf"));
            expect(mocks.prisma.evidence.delete).toHaveBeenCalledWith({
                where: { id: "ev-1" },
            });
            expect(mocks.writeSecurityAuditLog).toHaveBeenCalledWith(expect.anything(), {
                userId: "user-1",
                action: "DELETE_EVIDENCE",
                entity: "EVIDENCE",
                entityId: "ev-1",
                metadata: { title: "My Assignment" },
            });
        });

        it("deletes file and DB record successfully for an admin", async () => {
            mocks.requireApiAuthPolicy.mockResolvedValue({
                ok: true,
                user: { id: "admin-1", role: "ADMIN" },
            });
            mocks.prisma.evidence.findUnique.mockResolvedValue({
                id: "ev-1",
                userId: "user-2",
                title: "User Assignment",
                fileUrl: "/uploads/evidence/test.pdf",
                rating: null,
            });

            const response = await DELETE(new Request("http://localhost/api/evidence/ev-1"), {
                params: Promise.resolve({ id: "ev-1" }),
            });

            expect(response.status).toBe(200);
            expect(mocks.unlink).toHaveBeenCalled();
            expect(mocks.prisma.evidence.delete).toHaveBeenCalledWith({
                where: { id: "ev-1" },
            });
        });
    });
});
