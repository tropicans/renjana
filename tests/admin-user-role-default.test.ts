import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    requireApiAuthPolicy: vi.fn(),
    writeSecurityAuditLog: vi.fn(),
    hash: vi.fn(),
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            count: vi.fn(),
        },
    },
}));

function withOrigin(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Origin", "http://localhost");
    return { ...init, headers };
}
vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));
vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: mocks.hash,
    },
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));
vi.mock("@/lib/audit", () => ({
    writeSecurityAuditLog: mocks.writeSecurityAuditLog,
}));

import { POST } from "@/app/api/admin/users/route";

describe("POST /api/admin/users role defaulting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "admin-1", role: "ADMIN" },
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
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
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
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }));

        expect(response.status).toBe(201);
        expect(mocks.prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                role: "FINANCE",
            }),
        }));
    });

    it("uses policy actor for same-origin admin creation", async () => {
        mocks.prisma.user.create.mockResolvedValue({
            id: "user-3",
            email: "actor@example.com",
            fullName: "Actor User",
            role: "LEARNER",
            isActive: true,
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            _count: { enrollments: 0 },
        });

        const response = await POST(new Request("http://localhost/api/admin/users", {
            method: "POST",
            body: JSON.stringify({
                email: "actor@example.com",
                password: "password123",
                fullName: "Actor User",
            }),
            headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
        }));

        expect(response.status).toBe(201);
        expect(mocks.requireApiAuthPolicy).toHaveBeenCalledWith(expect.any(Request), {
            roles: ["ADMIN"],
            sameOrigin: true,
        });
        expect(mocks.writeSecurityAuditLog).toHaveBeenCalledWith(mocks.prisma, expect.objectContaining({
            userId: "admin-1",
            action: "CREATE_USER",
        }));
    });
});
