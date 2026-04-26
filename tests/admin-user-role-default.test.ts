import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    hash: vi.fn(),
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: mocks.hash,
    },
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/admin/users/route";

describe("POST /api/admin/users role defaulting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.prisma.user.findUnique.mockResolvedValue(null);
        mocks.hash.mockResolvedValue("hashed-password");
    });

    it("defaults invalid roles to LEARNER", async () => {
        mocks.prisma.user.create.mockResolvedValue({
            id: "user-1",
            email: "new@example.com",
            fullName: "New User",
            role: "LEARNER",
            isActive: true,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            _count: { enrollments: 0 },
        });

        const response = await POST(new Request("http://localhost/api/admin/users", {
            method: "POST",
            body: JSON.stringify({
                email: "new@example.com",
                password: "password123",
                fullName: "New User",
                role: "SUPERADMIN",
            }),
            headers: { "Content-Type": "application/json" },
        }));

        expect(response.status).toBe(201);
        expect(mocks.prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                role: "LEARNER",
            }),
        }));
    });

    it("preserves explicit valid roles", async () => {
        mocks.prisma.user.create.mockResolvedValue({
            id: "user-2",
            email: "finance@example.com",
            fullName: "Finance User",
            role: "FINANCE",
            isActive: true,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            _count: { enrollments: 0 },
        });

        const response = await POST(new Request("http://localhost/api/admin/users", {
            method: "POST",
            body: JSON.stringify({
                email: "finance@example.com",
                password: "password123",
                fullName: "Finance User",
                role: "FINANCE",
            }),
            headers: { "Content-Type": "application/json" },
        }));

        expect(response.status).toBe(201);
        expect(mocks.prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                role: "FINANCE",
            }),
        }));
    });
});
