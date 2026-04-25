import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    createRegistrationNotification: vi.fn(),
    prisma: {
        registration: {
            findMany: vi.fn(),
            upsert: vi.fn(),
            update: vi.fn(),
            findUnique: vi.fn(),
        },
        event: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("@/lib/notifications", () => ({
    createRegistrationNotification: mocks.createRegistrationNotification,
}));

vi.mock("@/lib/doku", () => ({
    getDokuPublicConfig: () => ({ enabled: false, provider: null }),
}));

import { POST } from "@/app/api/registrations/route";

describe("POST /api/registrations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireAuth.mockResolvedValue({
            user: { id: "user-1", role: "LEARNER" },
            error: null,
        });
    });

    it("rejects submit when event registration lifecycle is closed", async () => {
        mocks.prisma.event.findUnique.mockResolvedValue({
            id: "event-1",
            status: "DRAFT",
            registrationStart: null,
            registrationEnd: null,
            registrationFee: 100,
            onlineTuitionFee: 200,
            offlineTuitionFee: 300,
            alumniRegistrationFee: 50,
        });

        const response = await POST(new Request("http://localhost/api/registrations", {
            method: "POST",
            body: JSON.stringify({
                eventId: "event-1",
                participantMode: "ONLINE",
                submit: true,
            }),
            headers: { "Content-Type": "application/json" },
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "Registration is not open for this event",
        });
        expect(mocks.prisma.registration.upsert).not.toHaveBeenCalled();
    });
});
