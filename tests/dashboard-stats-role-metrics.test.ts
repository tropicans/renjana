import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    prisma: {
        registration: {
            findMany: vi.fn(),
        },
        registrationPayment: {
            findMany: vi.fn(),
        },
        enrollment: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
        user: {
            count: vi.fn(),
        },
        course: {
            count: vi.fn(),
        },
        event: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { GET } from "@/app/api/dashboard/stats/route";

describe("dashboard stats role metrics", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns finance metrics from registrations and payments", async () => {
        mocks.requireAuth.mockResolvedValue({
            user: { id: "finance-1", role: "FINANCE" },
            error: null,
        });
        mocks.prisma.registration.findMany.mockResolvedValue([
            { id: "reg-1", totalFee: 100000, paymentStatus: "VERIFIED" },
            { id: "reg-2", totalFee: 200000, paymentStatus: "PENDING" },
            { id: "reg-3", totalFee: 150000, paymentStatus: "REJECTED" },
        ]);
        mocks.prisma.registrationPayment.findMany.mockResolvedValue([
            { id: "pay-1", registrationId: "reg-1", amount: 100000, status: "PAID", createdAt: new Date("2025-01-03T00:00:00.000Z"), paidAt: new Date("2025-01-04T00:00:00.000Z") },
            { id: "pay-2", registrationId: "reg-2", amount: 200000, status: "PENDING", createdAt: new Date("2025-01-02T00:00:00.000Z"), paidAt: null },
            { id: "pay-3", registrationId: "reg-3", amount: 150000, status: "FAILED", createdAt: new Date("2025-01-01T00:00:00.000Z"), paidAt: null },
        ]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.totalRegistrations).toBe(3);
        expect(body.verifiedPayments).toBe(1);
        expect(body.pendingPayments).toBe(1);
        expect(body.rejectedPayments).toBe(1);
        expect(body.totalBilled).toBe(450000);
        expect(body.totalCollected).toBe(100000);
        expect(body.recentTransactions).toHaveLength(3);
    });

    it("returns manager metrics from enrollments, events, and registrations", async () => {
        mocks.requireAuth.mockResolvedValue({
            user: { id: "manager-1", role: "MANAGER" },
            error: null,
        });
        mocks.prisma.user.count.mockResolvedValue(10);
        mocks.prisma.enrollment.count
            .mockResolvedValueOnce(8)
            .mockResolvedValueOnce(3);
        mocks.prisma.course.count.mockResolvedValue(4);
        mocks.prisma.event.count.mockResolvedValue(5);
        mocks.prisma.enrollment.findMany.mockResolvedValue([
            { completionPercentage: 100 },
            { completionPercentage: 50 },
            { completionPercentage: 0 },
            { completionPercentage: 50 },
        ]);
        mocks.prisma.event.findMany.mockResolvedValue([
            { modality: "ONLINE" },
            { modality: "OFFLINE" },
            { modality: "HYBRID" },
            { modality: "ONLINE" },
        ]);
        mocks.prisma.registration.findMany
            .mockResolvedValueOnce([
                { participantMode: "ONLINE" },
                { participantMode: "OFFLINE" },
                { participantMode: "ONLINE" },
            ])
            .mockResolvedValueOnce([
                { id: "reg-1", createdAt: new Date("2025-01-01T00:00:00.000Z"), user: { fullName: "Learner One" }, event: { title: "Event One" } },
            ]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.totalLearners).toBe(10);
        expect(body.totalCourses).toBe(4);
        expect(body.totalEvents).toBe(5);
        expect(body.totalEnrollments).toBe(8);
        expect(body.completedEnrollments).toBe(3);
        expect(body.avgCompletion).toBe(50);
        expect(body.completionRate).toBe(38);
        expect(body.onlinePrograms).toBe(2);
        expect(body.offlinePrograms).toBe(1);
        expect(body.hybridPrograms).toBe(1);
        expect(body.onlineParticipants).toBe(2);
        expect(body.offlineParticipants).toBe(1);
        expect(body.hybridParticipants).toBe(3);
        expect(body.recentRegistrations).toHaveLength(1);
    });
});
