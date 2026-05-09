type RegistrationNotificationType = "REGISTRATION_APPROVED" | "REGISTRATION_REVISION_REQUIRED" | "REGISTRATION_REJECTED";

import type { Prisma } from "@prisma/client";
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
        agreedTerms: boolean;
        agreedRefundPolicy: boolean;
        fullName: string | null;
        birthPlace: string | null;
        birthDate: Date | null;
        gender: string | null;
        domicileAddress: string | null;
        whatsapp: string | null;
        institution: string | null;
        documents: Array<{ type: string }>;
    };
};

type AssignClassGroupInput = {
    prisma: Pick<Prisma.TransactionClient, "registration" | "auditLog">;
    registrationId: string;
    actorUserId: string;
    classGroupId: string | null;
};

export async function reviewRegistrationDocuments(input: ReviewDocumentsInput) {
    if (input.documentUpdates.length === 0) {
        return { ok: true as const };
    }

    const uniqueDocumentIds = Array.from(new Set(input.documentUpdates.map((document) => document.id)));
    const registrationDocuments = await input.prisma.registrationDocument.findMany({
        where: {
            id: { in: uniqueDocumentIds },
            registrationId: input.registrationId,
        },
        select: {
            id: true,
            registrationId: true,
            type: true,
        },
    });

    if (registrationDocuments.length !== uniqueDocumentIds.length) {
        return { ok: false as const, response: { error: "Document not found", status: 404 } };
    }

    const documentMap = new Map<string, RegistrationDocumentRecord>(
        registrationDocuments.map((document) => [document.id, document])
    );

    for (const document of input.documentUpdates) {
        const registrationDocument = documentMap.get(document.id);
        if (!registrationDocument || registrationDocument.registrationId !== input.registrationId) {
            return { ok: false as const, response: { error: "Document not found", status: 404 } };
        }

        if (input.allowedType === "PAYMENT_PROOF" && registrationDocument.type !== "PAYMENT_PROOF") {
            return { ok: false as const, response: { error: "Finance can only review payment proof documents", status: 403 } };
        }

        if (input.allowedType === "NON_PAYMENT_PROOF" && registrationDocument.type === "PAYMENT_PROOF") {
            return { ok: false as const, response: { error: "Admin cannot review payment proof documents", status: 403 } };
        }
    }

    await Promise.all(input.documentUpdates.map((document) => input.prisma.registrationDocument.update({
        where: { id: document.id },
        data: {
            ...(document.reviewStatus ? { reviewStatus: document.reviewStatus as never } : {}),
            ...(document.adminNote !== undefined ? { adminNote: document.adminNote?.trim() || null } : {}),
        },
    })));

    await input.prisma.auditLog.create({
        data: {
            userId: input.actorUserId,
            action: input.auditAction,
            entity: input.auditEntity,
            entityId: input.registrationId,
            metadata: { documentUpdates: input.documentUpdates },
        },
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

    if (shouldEnsureEnrollment && updated.event.courseId) {
        await ensureEnrollmentForCourse(tx, {
            userId: updated.user.id,
            courseId: updated.event.courseId,
        });
    }

    return { ok: true as const, updated };
}

export async function finalizeRegistrationDecision(params: {
    actorUserId: string;
    registration: { id: string; status: string; adminNote: string | null };
    updated: {
        id: string;
        status: string;
        adminNote: string | null;
        user: { id: string };
        event: { id: string; slug: string; title: string };
    };
    status?: string;
    adminNote?: string | undefined;
}): Promise<{
    audit: {
        userId: string;
        action: string;
        entity: "REGISTRATION";
        entityId: string;
        metadata: {
            previous: { status: string; adminNote: string | null };
            next: { status: string; adminNote: string | null };
        };
    } | null;
    notification: {
        userId: string;
        registrationId: string;
        eventId: string;
        eventSlug: string;
        eventTitle: string;
        type: RegistrationNotificationType | null;
        adminNote: string | null;
    } | null;
}> {
    if (params.status || params.adminNote !== undefined) {
        return {
            audit: {
                userId: params.actorUserId,
                action: params.status === "APPROVED"
                    ? "APPROVE_REGISTRATION"
                    : params.status === "REJECTED"
                        ? "REJECT_REGISTRATION"
                        : params.status === "REVISION_REQUIRED"
                            ? "REQUEST_REGISTRATION_REVISION"
                            : "UPDATE_REGISTRATION",
                entity: "REGISTRATION",
                entityId: params.registration.id,
                metadata: {
                    previous: {
                        status: params.registration.status,
                        adminNote: params.registration.adminNote,
                    },
                    next: {
                        status: params.updated.status,
                        adminNote: params.updated.adminNote,
                    },
                },
            },
            notification: params.status && params.status !== params.registration.status
                ? {
                    userId: params.updated.user.id,
                    registrationId: params.updated.id,
                    eventId: params.updated.event.id,
                    eventSlug: params.updated.event.slug,
                    eventTitle: params.updated.event.title,
                    type: params.status === "APPROVED"
                        ? "REGISTRATION_APPROVED"
                        : params.status === "REVISION_REQUIRED"
                            ? "REGISTRATION_REVISION_REQUIRED"
                            : params.status === "REJECTED"
                                ? "REGISTRATION_REJECTED"
                                : null,
                    adminNote: params.updated.adminNote,
                }
                : null,
        };
    }

    return { audit: null, notification: null };
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
        await prisma.auditLog.create({
            data: {
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
    const missingFields = [
        ["fullName", registration.fullName],
        ["birthPlace", registration.birthPlace],
        ["birthDate", registration.birthDate],
        ["gender", registration.gender],
        ["domicileAddress", registration.domicileAddress],
        ["whatsapp", registration.whatsapp],
        ["institution", registration.institution],
    ].filter(([, value]) => !value).map(([key]) => key);

    const uploadedTypes = new Set(registration.documents.map((document) => document.type));
    const missingDocuments = getRequiredRegistrationDocumentTypes(getPaymentGatewayPublicConfig().enabled).filter((type) => !uploadedTypes.has(type));

    if (!registration.agreedTerms || !registration.agreedRefundPolicy || missingFields.length > 0 || missingDocuments.length > 0) {
        await prisma.registration.update({
            where: { id: registration.id },
            data: { status: "DRAFT", submittedAt: null },
        });

        return {
            ok: false as const,
            response: {
                status: 400,
                body: {
                    error: "Complete the required form fields and uploads before submitting",
                    details: {
                        missingFields,
                        missingDocuments,
                        agreedTerms: registration.agreedTerms,
                        agreedRefundPolicy: registration.agreedRefundPolicy,
                    },
                },
            },
        };
    }

    await prisma.registration.update({
        where: { id: registration.id },
        data: {
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

    await input.prisma.auditLog.create({
        data: {
            userId: input.actorUserId,
            action: input.classGroupId ? "ASSIGN_CLASS_GROUP" : "UNASSIGN_CLASS_GROUP",
            entity: "REGISTRATION",
            entityId: input.registrationId,
            metadata: { classGroupId: input.classGroupId },
        },
    });

    return updated;
}
