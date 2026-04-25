import { describe, expect, it } from "vitest";

import { getDashboardUrl } from "@/lib/context/user-context";

describe("getDashboardUrl", () => {
    it("routes learner to learner dashboard", () => {
        expect(getDashboardUrl("LEARNER")).toBe("/dashboard");
    });

    it("routes instructor to instructor portal", () => {
        expect(getDashboardUrl("INSTRUCTOR")).toBe("/instructor");
    });

    it("routes manager to manager portal", () => {
        expect(getDashboardUrl("MANAGER")).toBe("/manager");
    });

    it("routes finance to finance portal", () => {
        expect(getDashboardUrl("FINANCE")).toBe("/finance");
    });

    it("routes admin to admin portal", () => {
        expect(getDashboardUrl("ADMIN")).toBe("/admin");
    });
});
