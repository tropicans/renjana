import type { Prisma } from "@prisma/client";
import { writeAuditLog } from "@/lib/audit";
import { createRegistrationNotification } from "@/lib/notifications";
import { createMidtransCheckout, fetchMidtransTransactionStatus, mapMidtransTransactionToPaymentState } from "@/lib/payment";

type CheckoutRegistration = {
    id: string;
    userId: string;
    status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "REVISION_REQUIRED" | "APPROVED" | "ACTIVE" | "COMPLETED" | "REJECTED";
    submittedAt: Date | null;
    totalFee: number | null;
    paymentStatus?: string | null;
    event: { title: string; slug: string };
    payments: Array<{ id: string; invoiceUrl: string | null; status: string }>;
};

export async function createRegistrationCheckout(params: {
    prisma: Pick<Prisma.TransactionClient, "registrationPayment" | "registration">;
    registration: CheckoutRegistration;
    user: { email: string; name: string };
    returnBaseUrl: string | undefined;
}) {
    const existingPayment = params.registration.payments[0];
    if (existingPayment?.invoiceUrl && params.registration.paymentStatus === "PENDING") {
        return { reused: true as const, payment: existingPayment, status: 200 as const };
    }

    const orderId = `registration-${params.registration.id}-${Date.now()}`;
    const checkout = await createMidtransCheckout({
        orderId,
        amount: params.registration.totalFee!,
        email: params.user.email,
        name: params.user.name,
        description: `Pembayaran ${params.registration.event.title}`,
        returnUrl: `${params.returnBaseUrl}/my-registrations?event=${params.registration.event.slug}`,
    });

    const payment = await params.prisma.registrationPayment.create({
        data: {
            registrationId: params.registration.id,
            provider: "MIDTRANS",
            externalId: orderId,
            invoiceId: orderId,
            invoiceUrl: checkout.redirect_url ?? null,
            amount: params.registration.totalFee!,
            status: "PENDING",
            expiresAt: null,
            description: `Pembayaran ${params.registration.event.title}`,
            metadata: { token: checkout.token },
        },
    });

    await params.prisma.registration.update({
        where: { id: params.registration.id },
        data: { paymentStatus: "PENDING" },
    });

    return {
        reused: false as const,
        status: 201 as const,
        payment: {
            id: payment.id,
            invoiceUrl: payment.invoiceUrl,
            status: payment.status,
            externalId: payment.externalId,
            expiresAt: payment.expiresAt,
            token: checkout.token ?? null,
        },
    };
}

export async function applyWebhookPaymentUpdate(params: {
    prisma: Pick<Prisma.TransactionClient, "registrationPayment" | "registration">;
    payment: { id: string; registrationId: string; expiresAt: Date | null };
    registrationBefore: { id: string; userId: string; paymentStatus: string | null };
    notificationPayload: Record<string, unknown>;
    orderId: string;
}) {
    const statusResponse = await fetchMidtransTransactionStatus(params.orderId);
    const paymentStatus = mapMidtransTransactionToPaymentState({
        transactionStatus: statusResponse.transaction_status,
        fraudStatus: statusResponse.fraud_status,
    });
    const providerStatus = String(statusResponse.transaction_status ?? params.notificationPayload.transaction_status ?? "UNKNOWN");

    const expiryTime = statusResponse.expiry_time ? new Date(statusResponse.expiry_time) : params.payment.expiresAt;

    await params.prisma.registrationPayment.update({
        where: { id: params.payment.id },
        data: {
            status: providerStatus.toUpperCase(),
            paidAt: paymentStatus === "VERIFIED" ? new Date() : null,
            expiresAt: expiryTime,
            metadata: params.notificationPayload as Prisma.InputJsonValue,
        },
    });

    await params.prisma.registration.update({
        where: { id: params.payment.registrationId },
        data: { paymentStatus: paymentStatus as never },
    });

    return { ok: true as const, paymentStatus, providerStatus };
}

export async function finalizeWebhookPaymentUpdate(params: {
    prisma: Pick<Prisma.TransactionClient, "auditLog">;
    payment: { id: string; registrationId: string };
    orderId: string;
    providerStatus: string;
    paymentStatus: string;
    registrationBefore: { userId: string; paymentStatus: string | null };
    registrationAfter?: { id: string; userId: string; eventId: string; event: { slug: string; title: string } } | null;
}) {
    if (params.paymentStatus !== params.registrationBefore.paymentStatus) {
        await writeAuditLog(params.prisma as Prisma.TransactionClient, {
            userId: params.registrationBefore.userId,
            action: params.paymentStatus === "VERIFIED"
                ? "VERIFY_REGISTRATION_PAYMENT_WEBHOOK"
                : params.paymentStatus === "REJECTED"
                    ? "REJECT_REGISTRATION_PAYMENT_WEBHOOK"
                    : "UPDATE_REGISTRATION_PAYMENT_WEBHOOK",
            entity: "PAYMENT",
            entityId: params.payment.registrationId,
            metadata: {
                source: "MIDTRANS_WEBHOOK",
                paymentId: params.payment.id,
                invoiceId: params.orderId,
                providerStatus: params.providerStatus.toUpperCase(),
                previous: { paymentStatus: params.registrationBefore.paymentStatus },
                next: { paymentStatus: params.paymentStatus },
            },
        });
    }

    if (params.paymentStatus !== "PENDING" && params.paymentStatus !== params.registrationBefore.paymentStatus && params.registrationAfter) {
        await createRegistrationNotification({
            userId: params.registrationAfter.userId,
            registrationId: params.registrationAfter.id,
            eventId: params.registrationAfter.eventId,
            eventSlug: params.registrationAfter.event.slug,
            eventTitle: params.registrationAfter.event.title,
            type: params.paymentStatus === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
        });
    }
}
