import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    requireRole: vi.fn(),
    writeSecurityAuditLog: vi.fn(),
    getInstructorScope: vi.fn(),
    prisma: {
        evidence: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
    requireRole: mocks.requireRole,
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
import { PUT } from "@/app/api/evidence/[id]/route";

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
});
