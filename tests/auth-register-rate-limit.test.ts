import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    hash: vi.fn(),
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: mocks.hash,
    },
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/auth/register/route";
import { resetRateLimitStore } from "@/lib/rate-limit";

describe("POST /api/auth/register rate limiting", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetRateLimitStore();
        mocks.prisma.user.findUnique.mockResolvedValue(null);
        mocks.hash.mockResolvedValue("hashed-password");
        mocks.prisma.user.create.mockResolvedValue({
            id: "user-1",
            fullName: "New User",
            email: "new@example.com",
            role: "LEARNER",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
        });
    });

    it("returns 429 after too many requests from same ip", async () => {
        for (let index = 0; index < 5; index += 1) {
            const response = await POST(new Request("http://localhost/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-forwarded-for": "10.0.0.1",
                },
                body: JSON.stringify({
                    fullName: `User ${index}`,
                    email: `user${index}@example.com`,
                    password: "Password123",
                }),
            }));

            expect(response.status).toBe(201);
        }

        const blocked = await POST(new Request("http://localhost/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-forwarded-for": "10.0.0.1",
            },
            body: JSON.stringify({
                fullName: "User 6",
                email: "user6@example.com",
                password: "Password123",
            }),
        }));

        expect(blocked.status).toBe(429);
        await expect(blocked.json()).resolves.toEqual({ error: "Too many registration attempts. Please try again later." });
    });
});
