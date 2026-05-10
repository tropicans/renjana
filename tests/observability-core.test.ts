import { afterEach, describe, expect, it, vi } from "vitest";
import { captureError, getRecentErrors, resetRecentErrors } from "@/lib/observability/error-monitor";
import { logger } from "@/lib/observability/logger";
import { resetMetrics, getMetricsSnapshot, renderPrometheusMetrics } from "@/lib/observability/metrics";
import { buildTracingHeaders, createRequestContext, parseTraceparent } from "@/lib/observability/request-context";
import { withRequestObservability } from "@/lib/observability/route";
import { writeAuditLog, writeSecurityAuditLog } from "@/lib/audit";

describe("observability core", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        resetMetrics();
        resetRecentErrors();
    });

    it("sanitizes secrets in structured logs", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

        logger.error({
            event: "auth.failure",
            message: "Bad credentials",
            metadata: {
                authorization: "Bearer secret",
                nested: { password: "super-secret", safe: "ok" },
            },
        });

        expect(errorSpy).toHaveBeenCalledTimes(1);
        const payload = JSON.parse(errorSpy.mock.calls[0][0] as string);
        expect(payload.metadata).toEqual({
            authorization: "[REDACTED]",
            nested: { password: "[REDACTED]", safe: "ok" },
        });
    });

    it("parses incoming traceparent and preserves request ids", () => {
        const request = new Request("http://localhost/api/test", {
            headers: {
                "x-request-id": "req-123",
                traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
            },
        });

        expect(parseTraceparent(request.headers.get("traceparent"))).toEqual({
            version: "00",
            traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
            spanId: "00f067aa0ba902b7",
            flags: "01",
        });

        const context = createRequestContext(request, { id: "user-1", role: "ADMIN" });
        expect(context).toMatchObject({
            requestId: "req-123",
            traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
            spanId: "00f067aa0ba902b7",
            method: "GET",
            path: "/api/test",
            userId: "user-1",
            role: "ADMIN",
        });

        expect(buildTracingHeaders(context)).toEqual({
            "x-request-id": "req-123",
            traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        });
    });

    it("wraps requests, attaches tracing headers, and records metrics", async () => {
        const request = new Request("http://localhost/api/test", { method: "POST" });

        const response = await withRequestObservability(request, async () => new Response("ok", { status: 201 }), {
            event: "test.route",
            getUser: () => ({ id: "user-1", role: "ADMIN" }),
        });

        expect(response.status).toBe(201);
        expect(response.headers.get("x-request-id")).toBeTruthy();
        expect(response.headers.get("traceparent")).toMatch(/^00-[\da-f]{32}-[\da-f]{16}-01$/);

        const metrics = getMetricsSnapshot();
        expect(metrics.httpRequests).toEqual([
            [expect.stringMatching(/^POST\|\/api\/test\|201$/), 1],
        ]);
        expect(renderPrometheusMetrics()).toContain("http_requests_total{method=\"POST\",path=\"/api/test\",status=\"201\"} 1");
    });

    it("captures unhandled errors with sanitized response body", async () => {
        const request = new Request("http://localhost/api/fail", { method: "GET" });

        const response = await withRequestObservability(request, async () => {
            throw new Error("boom");
        }, {
            event: "test.fail",
        });

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toMatchObject({
            error: "Internal server error",
            requestId: expect.any(String),
        });

        const recentErrors = getRecentErrors();
        expect(recentErrors).toHaveLength(1);
        expect(recentErrors[0]).toMatchObject({
            event: "test.fail.error",
            path: "/api/fail",
            status: 500,
        });
        expect(recentErrors[0]?.error.name).toBe("Error");
        expect(recentErrors[0]?.error.message).toBe("boom");

        expect(renderPrometheusMetrics()).toContain("app_errors_total{event=\"test.fail.error\"} 1");
        expect(renderPrometheusMetrics()).toContain("http_errors_total{path=\"/api/fail\",status=\"500\"} 1");
    });

    it("writes audit logs and rejects security audit without actor", async () => {
        const auditLogCreate = vi.fn().mockResolvedValue({ id: "audit-1" });
        const prisma = { auditLog: { create: auditLogCreate } };

        await writeAuditLog(prisma as never, {
            userId: "admin-1",
            action: "CREATE_USER",
            entity: "USER",
            entityId: "user-1",
            metadata: { role: "LEARNER" },
        });

        expect(auditLogCreate).toHaveBeenCalledWith({
            data: {
                userId: "admin-1",
                action: "CREATE_USER",
                entity: "USER",
                entityId: "user-1",
                metadata: { role: "LEARNER" },
            },
        });

        await expect(writeSecurityAuditLog(prisma as never, {
            action: "SECURITY_LOGIN_FAILURE",
            entity: "AUTH",
            entityId: "session-1",
        })).rejects.toThrow("Security audit log requires actor user id");
    });

    it("stores only recent bounded errors", () => {
        for (let index = 0; index < 105; index += 1) {
            captureError(new Error(`boom-${index}`), { event: "bounded.error", path: "/api/test", status: 500 });
        }

        const recentErrors = getRecentErrors();
        expect(recentErrors).toHaveLength(100);
        expect(recentErrors[0]?.error.message).toBe("boom-104");
        expect(recentErrors.at(-1)?.error.message).toBe("boom-5");
    });
});
