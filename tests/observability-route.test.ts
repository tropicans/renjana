import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    prisma: {
        $queryRaw: vi.fn(),
    },
    requireRole: vi.fn(),
    getRecentErrors: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

vi.mock("@/lib/auth-utils", () => ({
    requireRole: mocks.requireRole,
}));

vi.mock("@/lib/observability/error-monitor", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/lib/observability/error-monitor")>();
    return {
        ...actual,
        getRecentErrors: mocks.getRecentErrors,
    };
});

import { GET as getHealth } from "@/app/api/health/route";
import { GET as getMetrics } from "@/app/api/metrics/route";
import { GET as getAdminErrors } from "@/app/api/admin/observability/errors/route";
import { resetMetrics } from "@/lib/observability/metrics";

describe("observability routes", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMetricsToken = process.env.METRICS_TOKEN;

    beforeEach(() => {
        vi.clearAllMocks();
        resetMetrics();
        process.env.NODE_ENV = originalNodeEnv;
        if (originalMetricsToken === undefined) {
            delete process.env.METRICS_TOKEN;
        } else {
            process.env.METRICS_TOKEN = originalMetricsToken;
        }
        mocks.prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
        mocks.requireRole.mockResolvedValue({
            user: { id: "admin-1", role: "ADMIN" },
            error: null,
        });
        mocks.getRecentErrors.mockReturnValue([
            { event: "route.error", status: 500, error: { name: "Error", message: "boom" } },
        ]);
    });

    it("returns healthy status when database check passes", async () => {
        const response = await getHealth(new Request("http://localhost/api/health"));

        expect(response.status).toBe(200);
        expect(response.headers.get("x-request-id")).toBeTruthy();
        expect(response.headers.get("traceparent")).toMatch(/^00-[\da-f]{32}-[\da-f]{16}-01$/);
        await expect(response.json()).resolves.toMatchObject({
            status: "ok",
            checks: { database: { status: "up" } },
        });
    });

    it("returns degraded status when database check fails", async () => {
        mocks.prisma.$queryRaw.mockRejectedValue(new Error("db down"));

        const response = await getHealth(new Request("http://localhost/api/health"));

        expect(response.status).toBe(503);
        await expect(response.json()).resolves.toMatchObject({
            status: "degraded",
            checks: { database: { status: "down", error: "Database unavailable" } },
        });
    });

    it("returns prometheus metrics when token absent outside production", async () => {
        delete process.env.METRICS_TOKEN;
        process.env.NODE_ENV = "development";

        const response = await getMetrics(new Request("http://localhost/api/metrics"));

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain("text/plain");
        await expect(response.text()).resolves.toContain("process_uptime_seconds");
    });

    it("enforces bearer token for metrics when configured", async () => {
        process.env.METRICS_TOKEN = "metrics-secret";

        const unauthorized = await getMetrics(new Request("http://localhost/api/metrics"));
        expect(unauthorized.status).toBe(401);
        await expect(unauthorized.json()).resolves.toEqual({ error: "Unauthorized" });

        const authorized = await getMetrics(new Request("http://localhost/api/metrics", {
            headers: { authorization: "Bearer metrics-secret" },
        }));
        expect(authorized.status).toBe(200);
    });

    it("returns not found for metrics in production without token", async () => {
        delete process.env.METRICS_TOKEN;
        process.env.NODE_ENV = "production";

        const response = await getMetrics(new Request("http://localhost/api/metrics"));

        expect(response.status).toBe(404);
        await expect(response.json()).resolves.toEqual({ error: "Not found" });
    });

    it("requires admin role for recent errors endpoint", async () => {
        mocks.requireRole.mockResolvedValueOnce({
            user: null,
            error: new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "content-type": "application/json" },
            }),
        }).mockResolvedValueOnce({
            user: null,
            error: new Response(JSON.stringify({ error: "Forbidden" }), {
                status: 403,
                headers: { "content-type": "application/json" },
            }),
        });

        const response = await getAdminErrors(new Request("http://localhost/api/admin/observability/errors"));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
    });

    it("returns bounded recent errors for admin users", async () => {
        const response = await getAdminErrors(new Request("http://localhost/api/admin/observability/errors?limit=200"));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            errors: [{ event: "route.error", status: 500, error: { name: "Error", message: "boom" } }],
        });
        expect(mocks.getRecentErrors).toHaveBeenCalledWith(100);
    });
});
