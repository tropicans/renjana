import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type NotificationType =
    | "REGISTRATION_SUBMITTED"
    | "PAYMENT_VERIFIED"
    | "PAYMENT_REJECTED"
    | "REGISTRATION_APPROVED"
    | "REGISTRATION_REVISION_REQUIRED"
    | "REGISTRATION_REJECTED"
    | "CLASS_GROUP_ASSIGNED"
    | "CLASS_GROUP_UPDATED";

type NotificationInput = {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string | null;
    metadata?: Record<string, unknown>;
};

type RegistrationNotificationInput = {
    userId: string;
    registrationId: string;
    eventId?: string | null;
    eventSlug: string;
    eventTitle: string;
    type: NotificationType;
    adminNote?: string | null;
    classGroupName?: string | null;
};

function toJsonValue(value: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
    if (!value) return undefined;
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function summarizeNote(note?: string | null) {
    if (!note) return null;

    const normalized = note.replace(/\s+/g, " ").trim();
    if (!normalized) return null;

    return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}

export async function createNotification(input: NotificationInput) {
    await prisma.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            link: input.link ?? null,
            metadata: toJsonValue(input.metadata),
        },
    });
}

export async function createRegistrationNotification(input: RegistrationNotificationInput) {
    const note = summarizeNote(input.adminNote);
    const link = `/my-registrations`;

    const baseMetadata: Record<string, unknown> = {
        registrationId: input.registrationId,
        eventId: input.eventId ?? null,
        eventSlug: input.eventSlug,
        eventTitle: input.eventTitle,
    };

    if (note) {
        baseMetadata.adminNote = note;
    }

    if (input.classGroupName) {
        baseMetadata.classGroupName = input.classGroupName;
    }

    switch (input.type) {
        case "REGISTRATION_SUBMITTED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Pendaftaran terkirim",
                message: `Pendaftaran untuk ${input.eventTitle} sudah masuk ke tahap review. Pantau pembaruan finance dan admin dari halaman My Registrations.`,
                link,
                metadata: baseMetadata,
            });
        case "PAYMENT_VERIFIED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Pembayaran terverifikasi",
                message: `Pembayaran untuk ${input.eventTitle} sudah diverifikasi. Pendaftaran Anda sekarang menunggu approval final dari admin.`,
                link,
                metadata: baseMetadata,
            });
        case "PAYMENT_REJECTED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Pembayaran perlu diperbaiki",
                message: note
                    ? `Verifikasi pembayaran untuk ${input.eventTitle} belum berhasil. Catatan terbaru: ${note}`
                    : `Verifikasi pembayaran untuk ${input.eventTitle} belum berhasil. Cek status terbaru dan unggah ulang bukti pembayaran bila diperlukan.`,
                link,
                metadata: baseMetadata,
            });
        case "REGISTRATION_APPROVED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Pendaftaran disetujui",
                message: `Pendaftaran untuk ${input.eventTitle} sudah disetujui admin. Tunggu penempatan class group untuk akses detail kelas berikutnya.`,
                link,
                metadata: baseMetadata,
            });
        case "REGISTRATION_REVISION_REQUIRED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Perlu revisi pendaftaran",
                message: note
                    ? `Admin meminta revisi untuk ${input.eventTitle}. Catatan terbaru: ${note}`
                    : `Admin meminta revisi untuk ${input.eventTitle}. Buka kembali pendaftaran Anda dan lengkapi data yang diminta.`,
                link,
                metadata: baseMetadata,
            });
        case "REGISTRATION_REJECTED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Pendaftaran belum dapat disetujui",
                message: note
                    ? `Pendaftaran untuk ${input.eventTitle} ditolak. Catatan terbaru: ${note}`
                    : `Pendaftaran untuk ${input.eventTitle} belum dapat disetujui. Cek status terbaru untuk detail tindak lanjut.`,
                link,
                metadata: baseMetadata,
            });
        case "CLASS_GROUP_ASSIGNED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Class group sudah ditetapkan",
                message: input.classGroupName
                    ? `Anda sudah ditempatkan ke ${input.classGroupName} untuk ${input.eventTitle}. Detail kelas dan akses live session akan tampil sesuai kelayakan peserta.`
                    : `Admin sudah memperbarui penempatan kelas untuk ${input.eventTitle}.`,
                link,
                metadata: baseMetadata,
            });
        case "CLASS_GROUP_UPDATED":
            return createNotification({
                userId: input.userId,
                type: input.type,
                title: "Penempatan kelas diperbarui",
                message: `Penempatan class group untuk ${input.eventTitle} sedang diperbarui admin. Pantau halaman My Registrations untuk detail terbaru.`,
                link,
                metadata: baseMetadata,
            });
    }
}
