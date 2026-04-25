import { describe, expect, it } from "vitest";

import { getEvaluationRegistrationId } from "@/lib/evaluation-link";

describe("getEvaluationRegistrationId", () => {
    it("prefers the normalized registrationId field when present", () => {
        expect(getEvaluationRegistrationId({
            registrationId: "reg-normalized",
            answers: { registrationId: "reg-legacy" },
        })).toBe("reg-normalized");
    });

    it("falls back to legacy answers.registrationId when the normalized field is absent", () => {
        expect(getEvaluationRegistrationId({
            answers: { registrationId: "reg-legacy" },
        })).toBe("reg-legacy");
    });

    it("returns null when no registration link exists", () => {
        expect(getEvaluationRegistrationId({ answers: { payload: { foo: "bar" } } })).toBeNull();
    });
});
