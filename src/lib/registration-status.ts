export function getRegistrationStatusLabel(status: string) {
    switch (status) {
        case "DRAFT":
            return "Draft";
        case "SUBMITTED":
            return "Menunggu review admin";
        case "UNDER_REVIEW":
            return "Sedang direview";
        case "REVISION_REQUIRED":
            return "Perlu revisi";
        case "APPROVED":
            return "Disetujui";
        case "REJECTED":
            return "Ditolak";
        case "ACTIVE":
            return "Aktif";
        case "COMPLETED":
            return "Selesai";
        default:
            return status;
    }
}

export function getPaymentStatusLabel(status: string) {
    switch (status) {
        case "PENDING":
            return "Belum dibayar";
        case "UPLOADED":
            return "Menunggu verifikasi pembayaran";
        case "VERIFIED":
            return "Pembayaran terverifikasi";
        case "REJECTED":
            return "Pembayaran ditolak";
        default:
            return status;
    }
}
