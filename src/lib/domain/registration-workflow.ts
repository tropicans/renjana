type RegistrationNotificationType = "REGISTRATION_APPROVED" | "REGISTRATION_REVISION_REQUIRED" | "REGISTRATION_REJECTED";

import type { Prisma } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { ensureEnrollmentForCourse } from "@/lib/enrollment-sync";
import { createRegistrationNotification } from "@/lib/notifications";
import { canApproveRegistration } from "@/lib/domain/registration-rules";
import { getPaymentGatewayPublicConfig } from "@/lib/payment";
import { getRequiredRegistrationDocumentTypes } from "@/lib/events";

type RegistrationDocumentUpdate = {
    id: string;
    reviewStatus?: string;
    adminNote?: string | null;
};

type ReviewDocumentsInput = {
    prisma: Prisma.TransactionClient | PrismaClientLike;
    registrationId: string;
    actorUserId: string;
    documentUpdates: RegistrationDocumentUpdate[];
    allowedType: "PAYMENT_PROOF" | "NON_PAYMENT_PROOF";
    auditAction: string;
    auditEntity: "REGISTRATION" | "PAYMENT";
};

type PrismaClientLike = Pick<Prisma.TransactionClient, "registrationDocument" | "auditLog">;

type RegistrationDocumentRecord = {
    id: string;
    registrationId: string;
    type: string;
};
type DecideRegistrationInput = {
    registrationId: string;
    actorUserId: string;
    status?: string;
    adminNote?: string | undefined;
};

type ReviewPaymentInput = {
    registrationId: string;
    actorUserId: string;
    paymentStatus?: string;
    adminNote?: string | undefined;
};

type SubmitRegistrationInput = {
    prisma: Pick<Prisma.TransactionClient, "registration">;
    registration: {
        id: string;
        userId: string;
        eventId: string;
        event: {
            id: string;
            title: string;
            slug: string;
            status: string;
            registrationStart: Date | null;
            registrationEnd: Date | null;
            courseId: string | null;
            learningEnabled: boolean;
            modality: string;
            category: string;
        };
        status: string;
        participantMode: string;
        agreedTerms: boolean;
        agreedRefundPolicy: boolean;
        totalFee: number | null;
        payments?: Array<{ id: string }>;
        documents: Array<{ type: string; reviewStatus: string }>;
    };
};

type AssignClassGroupInput = {
    prisma: Pick<Prisma.TransactionClient, "registration" | "auditLog">;
    registrationId: string;
    actorUserId: string;
    classGroupId: string | null;
};

type FinalizeDecisionInput = {
    actorUserId: string;
    registration: {
        status: string;
        adminNote: string | null;
    };
    updated: {
        id: string;
        status: string;
        adminNote: string | null;
        user: { id: string };
        event: { id: string; slug: string; title: string };
    };
    status?: string;
    adminNote?: string | undefined;
};

export async function reviewRegistrationDocuments(input: ReviewDocumentsInput) {
    if (!input.documentUpdates.length) {
        return { ok: true as const };
    }

    const documents = await input.prisma.registrationDocument.findMany({
        where: {
            registrationId: input.registrationId,
            id: { in: input.documentUpdates.map((item) => item.id) },
        },
        select: { id: true, registrationId: true, type: true },
    }) as RegistrationDocumentRecord[];

    if (documents.length !== input.documentUpdates.length) {
        return { ok: false as const, response: { error: "Some documents were not found", status: 404 } };
    }

    const invalidType = documents.some((document) =>
        input.allowedType === "PAYMENT_PROOF"
            ? document.type !== "PAYMENT_PROOF"
            : document.type === "PAYMENT_PROOF",
    );

    if (invalidType) {
        return {
            ok: false as const,
            response: {
                error: input.allowedType === "PAYMENT_PROOF"
                    ? "This action only applies to payment proof documents"
                    : "Payment proof documents must be reviewed by Finance",
                status: 403,
            },
        };
    }

    await Promise.all(input.documentUpdates.map((document) => input.prisma.registrationDocument.update({
        where: { id: document.id },
        data: {
            ...(document.reviewStatus ? { reviewStatus: document.reviewStatus as never } : {}),
            ...(document.adminNote !== undefined ? { adminNote: document.adminNote?.trim() || null } : {}),
        },
    })));

    await writeAuditLog(input.prisma as Prisma.TransactionClient, {
        userId: input.actorUserId,
        action: input.auditAction,
        entity: input.auditEntity,
        entityId: input.registrationId,
        metadata: { documentUpdates: input.documentUpdates },
    });

    return { ok: true as const };
}

export async function decideRegistration(
    tx: Prisma.TransactionClient,
    registration: {
        id: string;
        status: string;
        paymentStatus: string | null;
        adminNote: string | null;
    },
    input: DecideRegistrationInput,
) {
    if (input.status === "APPROVED" && !canApproveRegistration(registration)) {
        return { ok: false as const, response: { error: "Payment must be verified by Finance before approval", status: 400 } };
    }

    const updated = await tx.registration.update({
        where: { id: input.registrationId },
        data: {
            ...(input.status ? { status: input.status as never } : {}),
            ...(input.adminNote !== undefined ? { adminNote: input.adminNote || null } : {}),
            ...(input.status === "APPROVED" ? { approvedAt: new Date() } : {}),
        },
        include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            event: {
                include: {
                    course: { select: { id: true, title: true } },
                },
            },
            classGroup: true,
            documents: { orderBy: { createdAt: "asc" } },
        },
    });

    const shouldEnsureEnrollment = input.status === "APPROVED"
        && registration.status !== "APPROVED"
        && Boolean(updated.event.courseId)
        && updated.event.learningEnabled;

    if (shouldEnsureEnrollment) {
        await ensureEnrollmentForCourse(tx, {
            userId: updated.user.id,
            courseId: updated.event.courseId!,
        });
    }

    return { ok: true as const, updated };
}

export function finalizeRegistrationDecision(input: FinalizeDecisionInput) {
    const registrationChanged = input.status !== undefined && input.status !== input.registration.status;
    const noteChanged = input.adminNote !== undefined && input.adminNote !== input.registration.adminNote;

    const shouldAudit = registrationChanged || noteChanged;
    const notificationType: RegistrationNotificationType | null = registrationChanged
        ? input.updated.status === "APPROVED"
            ? "REGISTRATION_APPROVED"
            : input.updated.status === "REVISION_REQUIRED"
                ? "REGISTRATION_REVISION_REQUIRED"
                : input.updated.status === "REJECTED"
                    ? "REGISTRATION_REJECTED"
                    : null
        : null;

    return {
        audit: shouldAudit
            ? {
                userId: input.actorUserId,
                action: registrationChanged
                    ? input.updated.status === "APPROVED"
                        ? "APPROVE_REGISTRATION"
                        : input.updated.status === "REVISION_REQUIRED"
                            ? "REQUEST_REGISTRATION_REVISION"
                            : input.updated.status === "REJECTED"
                                ? "REJECT_REGISTRATION"
                                : "UPDATE_REGISTRATION"
                    : "UPDATE_REGISTRATION_NOTE",
                entity: "REGISTRATION",
                entityId: input.updated.id,
                metadata: {
                    previous: {
                        status: input.registration.status,
                        adminNote: input.registration.adminNote,
                    },
                    next: {
                        status: input.updated.status,
                        adminNote: input.updated.adminNote,
                    },
                },
            }
            : null,
        notification: notificationType
            ? {
                userId: input.updated.user.id,
                registrationId: input.updated.id,
                eventId: input.updated.event.id,
                eventSlug: input.updated.event.slug,
                eventTitle: input.updated.event.title,
                type: notificationType,
                adminNote: input.updated.adminNote,
            }
            : null,
    };
}

export async function reviewPaymentProof(
    prisma: Pick<Prisma.TransactionClient, "registration" | "auditLog">,
    registration: { id: string; paymentStatus: string | null; adminNote: string | null },
    input: ReviewPaymentInput,
) {
    const updated = await prisma.registration.update({
        where: { id: input.registrationId },
        data: {
            ...(input.paymentStatus ? { paymentStatus: input.paymentStatus as never } : {}),
            ...(input.adminNote !== undefined ? { adminNote: input.adminNote || null } : {}),
        },
        include: {
            user: { select: { id: true, fullName: true, email: true, phone: true } },
            event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
            documents: { orderBy: { createdAt: "asc" } },
        },
    });

    if (input.paymentStatus || input.adminNote !== undefined) {
        await writeAuditLog(prisma as Prisma.TransactionClient, {
            userId: input.actorUserId,
            action: input.paymentStatus === "VERIFIED"
                ? "VERIFY_REGISTRATION_PAYMENT"
                : input.paymentStatus === "REJECTED"
                    ? "REJECT_REGISTRATION_PAYMENT"
                    : "UPDATE_REGISTRATION_PAYMENT_NOTE",
            entity: "PAYMENT",
            entityId: input.registrationId,
            metadata: {
                previous: {
                    paymentStatus: registration.paymentStatus,
                    adminNote: registration.adminNote,
                },
                next: {
                    paymentStatus: updated.paymentStatus,
                    adminNote: updated.adminNote,
                },
            },
        });
    }

    if (input.paymentStatus && input.paymentStatus !== registration.paymentStatus) {
        await createRegistrationNotification({
            userId: updated.user.id,
            registrationId: updated.id,
            eventId: updated.event.id,
            eventSlug: updated.event.slug,
            eventTitle: updated.event.title,
            type: input.paymentStatus === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
            adminNote: updated.adminNote,
        });
    }

    return updated;
}

export async function submitRegistrationDraft(input: SubmitRegistrationInput) {
    const { registration, prisma } = input;

    if (!["DRAFT", "REVISION_REQUIRED"].includes(registration.status)) {
        return { ok: false as const, response: { status: 409, body: { error: "Registration can no longer be edited" } } };
    }

    if (!registration.agreedTerms || !registration.agreedRefundPolicy) {
        return {
            ok: false as const,
            response: { status: 400, body: { error: "Terms and refund policy must be agreed before submission" } },
        };
    }

    const requiredDocumentTypes = getRequiredRegistrationDocumentTypes(
        getPaymentGatewayPublicConfig().enabled && (registration.totalFee ?? 0) > 0,
    );

    const uploadedTypes = new Set(registration.documents.map((document) => document.type));
    const missingDocument = requiredDocumentTypes.find((type) => !uploadedTypes.has(type));
    if (missingDocument) {
        return {
            ok: false as const,
            response: { status: 400, body: { error: `Document ${missingDocument} is required before submission` } },
        };
    }

    await prisma.registration.update({
        where: { id: registration.id },
        data: {
            status: "SUBMITTED",
            submittedAt: new Date(),
            paymentStatus: uploadedTypes.has("PAYMENT_PROOF") ? "UPLOADED" : "PENDING",
        },
    });

    return { ok: true as const };
}

export async function assignRegistrationClassGroup(input: AssignClassGroupInput) {
    const updated = await input.prisma.registration.update({
        where: { id: input.registrationId },
        data: { classGroupId: input.classGroupId },
        include: {
            classGroup: true,
            user: { select: { id: true, fullName: true, email: true } },
            event: { select: { id: true, slug: true, title: true, category: true, modality: true } },
            documents: true,
            payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
    });

    await writeAuditLog(input.prisma as Prisma.TransactionClient, {
        userId: input.actorUserId,
        action: input.classGroupId ? "ASSIGN_CLASS_GROUP" : "UNASSIGN_CLASS_GROUP",
        entity: "REGISTRATION",
        entityId: input.registrationId,
        metadata: { classGroupId: input.classGroupId },
    });

    return updated;
}
