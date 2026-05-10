import { describe, expect, it } from "vitest";

import {
    canAssignClassGroup,
    canOpenClassAccess,
    canPayRegistrationNow,
    canApproveRegistration,
    hasVerifiedRegistrationPayment,
    isActiveRegistrationWorkflow,
    isLearningAccessibleRegistration,
    registrationRuleSets,
} from "@/lib/domain/registration-rules";

describe("registration rules", () => {
    it("detects learning-accessible registration states", () => {
        expect(isLearningAccessibleRegistration("APPROVED")).toBe(true);
        expect(isLearningAccessibleRegistration("ACTIVE")).toBe(true);
        expect(isLearningAccessibleRegistration("COMPLETED")).toBe(true);
        expect(isLearningAccessibleRegistration("SUBMITTED")).toBe(false);
    });

    it("detects in-flight registration workflow states", () => {
        expect(isActiveRegistrationWorkflow("SUBMITTED")).toBe(true);
        expect(isActiveRegistrationWorkflow("UNDER_REVIEW")).toBe(true);
        expect(isActiveRegistrationWorkflow("REVISION_REQUIRED")).toBe(true);
        expect(isActiveRegistrationWorkflow("APPROVED")).toBe(true);
        expect(isActiveRegistrationWorkflow("ACTIVE")).toBe(true);
        expect(isActiveRegistrationWorkflow("COMPLETED")).toBe(false);
    });

    it("detects payable registration payment states", () => {
        expect(canPayRegistrationNow("PENDING")).toBe(true);
        expect(canPayRegistrationNow("REJECTED")).toBe(true);
        expect(canPayRegistrationNow("UPLOADED")).toBe(false);
        expect(canPayRegistrationNow("VERIFIED")).toBe(false);
    });

    it("gates approval and class assignment on verified payment", () => {
        expect(hasVerifiedRegistrationPayment("VERIFIED")).toBe(true);
        expect(canApproveRegistration({ status: "SUBMITTED", paymentStatus: "VERIFIED" })).toBe(true);
        expect(canApproveRegistration({ status: "SUBMITTED", paymentStatus: "PENDING" })).toBe(false);
        expect(canAssignClassGroup({ status: "APPROVED", paymentStatus: "VERIFIED" })).toBe(true);
        expect(canAssignClassGroup({ status: "SUBMITTED", paymentStatus: "VERIFIED" })).toBe(false);
    });

    it("requires class group for open class access", () => {
        expect(canOpenClassAccess({ status: "ACTIVE", paymentStatus: "VERIFIED", classGroupId: "group-1" })).toBe(true);
        expect(canOpenClassAccess({ status: "ACTIVE", paymentStatus: "VERIFIED", classGroupId: null })).toBe(false);
        expect(canOpenClassAccess({ status: "REVISION_REQUIRED", paymentStatus: "VERIFIED", classGroupId: "group-1" })).toBe(false);
    });

    it("exports stable shared rule sets", () => {
        expect(registrationRuleSets.learningAccessibleStatuses).toEqual(["APPROVED", "ACTIVE", "COMPLETED"]);
        expect(registrationRuleSets.activeWorkflowStatuses).toEqual(["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED", "APPROVED", "ACTIVE"]);
        expect(registrationRuleSets.payablePaymentStatuses).toEqual(["PENDING", "REJECTED"]);
        expect(registrationRuleSets.verifiedPaymentStatus).toBe("VERIFIED");
    });
});
