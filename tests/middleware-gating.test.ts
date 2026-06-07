import { beforeEach, describe, expect, it, vi } from "vitest";
import NextAuth from "next-auth";

interface MockRequest {
    nextUrl: { pathname: string };
    url: string;
    auth: { user?: { role?: string } } | null;
}

const mocks = vi.hoisted(() => ({
    middlewareCallback: null as unknown as ((req: MockRequest) => Promise<Response>),
}));

vi.mock("next-auth", () => {
    const mockAuth = vi.fn().mockImplementation((cb) => {
        mocks.middlewareCallback = cb;
        return cb;
    });
    const mockNextAuth = vi.fn().mockImplementation(() => {
        return {
            auth: mockAuth,
        };
    });
    return {
        default: mockNextAuth,
    };
});

// Import the middleware to trigger config loading and callback registration
import { proxy } from "@/proxy";
import { auth } from "@/lib/auth.config";

describe("src/proxy.ts middleware gating", () => {
    beforeEach(() => {
        // mocks.middlewareCallback is initialized by import
    });

    it("verifies mocks are initialized correctly", () => {
        expect(NextAuth).toBeDefined();
        expect(auth).toBeDefined();
        expect(proxy).toBeDefined();
        expect(mocks.middlewareCallback).toBeTypeOf("function");
    });

    it("allows public routes without authentication", async () => {
        const req: MockRequest = {
            nextUrl: { pathname: "/login" },
            url: "http://localhost/login",
            auth: null,
        };

        const res = await mocks.middlewareCallback(req);
        expect(res).toBeDefined();
        expect(res.headers.get("x-middleware-next")).toBe("1");
    });

    it("redirects unauthenticated users to login for protected routes", async () => {
        const req: MockRequest = {
            nextUrl: { pathname: "/admin" },
            url: "http://localhost/admin",
            auth: null,
        };

        const res = await mocks.middlewareCallback(req);
        expect(res).toBeDefined();
        expect(res.status).toBe(307);
        expect(res.headers.get("Location")).toContain("/login?redirect=%2Fadmin");
    });

    it("allows authorized users accessing routes matching their role", async () => {
        const req: MockRequest = {
            nextUrl: { pathname: "/admin" },
            url: "http://localhost/admin",
            auth: { user: { role: "ADMIN" } },
        };

        const res = await mocks.middlewareCallback(req);
        expect(res).toBeDefined();
        expect(res.headers.get("x-middleware-next")).toBe("1");
    });

    it("redirects authorized users accessing out-of-scope routes to their home dashboard", async () => {
        const req: MockRequest = {
            nextUrl: { pathname: "/admin" },
            url: "http://localhost/admin",
            auth: { user: { role: "LEARNER" } },
        };

        const res = await mocks.middlewareCallback(req);
        expect(res).toBeDefined();
        expect(res.status).toBe(307);
        expect(res.headers.get("Location")).toBe("http://localhost/dashboard");
    });

    it("redirects manager to manager portal when attempting to access admin page", async () => {
        const req: MockRequest = {
            nextUrl: { pathname: "/admin" },
            url: "http://localhost/admin",
            auth: { user: { role: "MANAGER" } },
        };

        const res = await mocks.middlewareCallback(req);
        expect(res).toBeDefined();
        expect(res.status).toBe(307);
        expect(res.headers.get("Location")).toBe("http://localhost/manager");
    });
});
