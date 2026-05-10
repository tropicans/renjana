const LEARNING_ACCESSIBLE_REGISTRATION_STATUSES = ["APPROVED", "ACTIVE", "COMPLETED"] as const;
const ACTIVE_REGISTRATION_WORKFLOW_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED", "APPROVED", "ACTIVE"] as const;
const PAYABLE_REGISTRATION_PAYMENT_STATUSES = ["PENDING", "REJECTED"] as const;
const VERIFIED_PAYMENT_STATUS = "VERIFIED" as const;

type LearningAccessibleRegistrationStatus = (typeof LEARNING_ACCESSIBLE_REGISTRATION_STATUSES)[number];
type ActiveRegistrationWorkflowStatus = (typeof ACTIVE_REGISTRATION_WORKFLOW_STATUSES)[number];
type PayableRegistrationPaymentStatus = (typeof PAYABLE_REGISTRATION_PAYMENT_STATUSES)[number];

export type RegistrationRuleState = {
    status: string | null | undefined;
    paymentStatus?: string | null | undefined;
    classGroupId?: string | null | undefined;
};

export function isLearningAccessibleRegistration(status: string | null | undefined): status is LearningAccessibleRegistrationStatus {
    return LEARNING_ACCESSIBLE_REGISTRATION_STATUSES.includes(status as LearningAccessibleRegistrationStatus);
}

export function isActiveRegistrationWorkflow(status: string | null | undefined): status is ActiveRegistrationWorkflowStatus {
    return ACTIVE_REGISTRATION_WORKFLOW_STATUSES.includes(status as ActiveRegistrationWorkflowStatus);
}

export function hasVerifiedRegistrationPayment(paymentStatus: string | null | undefined) {
    return paymentStatus === VERIFIED_PAYMENT_STATUS;
}

export function canApproveRegistration(registration: RegistrationRuleState) {
    return hasVerifiedRegistrationPayment(registration.paymentStatus);
}

export function canAssignClassGroup(registration: RegistrationRuleState) {
    return isLearningAccessibleRegistration(registration.status) && hasVerifiedRegistrationPayment(registration.paymentStatus);
}

export function canPayRegistrationNow(paymentStatus: string | null | undefined) {
    return PAYABLE_REGISTRATION_PAYMENT_STATUSES.includes(paymentStatus as PayableRegistrationPaymentStatus);
}

export function canOpenClassAccess(registration: RegistrationRuleState) {
    return canAssignClassGroup(registration) && Boolean(registration.classGroupId);
}

export const registrationRuleSets = {
    learningAccessibleStatuses: LEARNING_ACCESSIBLE_REGISTRATION_STATUSES,
    activeWorkflowStatuses: ACTIVE_REGISTRATION_WORKFLOW_STATUSES,
    payablePaymentStatuses: PAYABLE_REGISTRATION_PAYMENT_STATUSES,
    verifiedPaymentStatus: VERIFIED_PAYMENT_STATUS,
} as const;
