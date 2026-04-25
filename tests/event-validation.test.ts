import { describe, expect, it } from "vitest";

import { validateEventRegistrationLifecycle } from "@/lib/event-validation";

describe("validateEventRegistrationLifecycle", () => {
    it("rejects registrations for non-open statuses", () => {
        const result = validateEventRegistrationLifecycle({
            status: "DRAFT",
        });

        expect(result.ok).toBe(false);
        expect(result.error).toBe("Registration is not open for this event");
    });

    it("rejects registrations before the registration window opens", () => {
        const result = validateEventRegistrationLifecycle({
            status: "REGISTRATION_OPEN",
            registrationStart: "2099-01-02T00:00:00.000Z",
            now: new Date("2099-01-01T00:00:00.000Z"),
        });

        expect(result.ok).toBe(false);
        expect(result.error).toBe("Registration has not opened yet for this event");
    });

    it("accepts registrations when status and window are valid", () => {
        const result = validateEventRegistrationLifecycle({
            status: "REGISTRATION_OPEN",
            registrationStart: "2099-01-01T00:00:00.000Z",
            registrationEnd: "2099-01-03T00:00:00.000Z",
            now: new Date("2099-01-02T00:00:00.000Z"),
        });

        expect(result.ok).toBe(true);
        expect(result.error).toBeNull();
    });
});
