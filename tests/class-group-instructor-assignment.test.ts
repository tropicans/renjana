import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireRole: vi.fn(),
    resolveInstructorAssignment: vi.fn(),
    prisma: {
        event: { findUnique: vi.fn() },
        classGroup: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        auditLog: { create: vi.fn() },
    },
}));

vi.mock("@/lib/auth-utils", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/class-group-instructor", () => ({ resolveInstructorAssignment: mocks.resolveInstructorAssignment }));
vi.mock("@/lib/db", () => ({ prisma: mocks.prisma }));

import { POST as createClassGroup } from "@/app/api/admin/events/[id]/class-groups/route";
import { PUT as updateClassGroup } from "@/app/api/admin/class-groups/[id]/route";

describe("class-group instructor assignment", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireRole.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" }, error: null });
    });

    it("creates a class group with instructorUserId and synced instructorName", async () => {
        mocks.prisma.event.findUnique.mockResolvedValue({ id: "event-1" });
        mocks.resolveInstructorAssignment.mockResolvedValue({
            instructorUserId: "inst-1",
            instructorName: "Instructor One",
            instructorUser: { id: "inst-1", fullName: "Instructor One", email: "inst@example.com" },
        });
        mocks.prisma.classGroup.create.mockResolvedValue({
            id: "group-1",
            eventId: "event-1",
            name: "Group 1",
            modality: "ONLINE",
            instructorUserId: "inst-1",
            instructorName: "Instructor One",
            _count: { registrations: 0 },
            instructorUser: { id: "inst-1", fullName: "Instructor One", email: "inst@example.com" },
        });

        const response = await createClassGroup(new Request("http://localhost/api/admin/events/event-1/class-groups", {
            method: "POST",
            body: JSON.stringify({ name: "Group 1", modality: "ONLINE", instructorUserId: "inst-1" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "event-1" }) });

        expect(response.status).toBe(201);
        expect(mocks.prisma.classGroup.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                instructorUserId: "inst-1",
                instructorName: "Instructor One",
            }),
        }));
    });

    it("rejects invalid instructor assignment on update", async () => {
        mocks.prisma.classGroup.findUnique.mockResolvedValue({
            id: "group-1",
            modality: "ONLINE",
            status: "ACTIVE",
            name: "Group 1",
            eventId: "event-1",
            _count: { registrations: 0 },
        });
        mocks.resolveInstructorAssignment.mockResolvedValue(null);

        const response = await updateClassGroup(new Request("http://localhost/api/admin/class-groups/group-1", {
            method: "PUT",
            body: JSON.stringify({ instructorUserId: "user-404" }),
            headers: { "Content-Type": "application/json" },
        }), { params: Promise.resolve({ id: "group-1" }) });

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({ error: "Instructor assignment must reference an active instructor user" });
    });
});
