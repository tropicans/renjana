import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "@/lib/redirect-security";

describe("redirect security", () => {
    it("allows safe relative application paths", () => {
        expect(getSafeRedirectPath("/dashboard?tab=payments", "/auth/redirect")).toBe("/dashboard?tab=payments");
    });

    it("rejects external and scheme-relative redirects", () => {
        expect(getSafeRedirectPath("https://evil.example/phish", "/auth/redirect")).toBe("/auth/redirect");
        expect(getSafeRedirectPath("//evil.example/phish", "/auth/redirect")).toBe("/auth/redirect");
    });

    it("rejects backslash confusion and auth loops", () => {
        expect(getSafeRedirectPath("/\\evil", "/auth/redirect")).toBe("/auth/redirect");
        expect(getSafeRedirectPath("/login?next=/admin", "/auth/redirect")).toBe("/auth/redirect");
        expect(getSafeRedirectPath("/auth/redirect", "/dashboard")).toBe("/dashboard");
    });
});
