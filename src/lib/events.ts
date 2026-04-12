export const REGISTRATION_DOCUMENT_TYPES = [
    "PAYMENT_PROOF",
    "PHOTO_4X6",
    "KTP",
    "DIPLOMA_OR_SKL",
] as const;

export type RegistrationDocumentType = (typeof REGISTRATION_DOCUMENT_TYPES)[number];

export const SOURCE_CHANNELS = ["INSTAGRAM", "TIKTOK", "OTHER"] as const;
export type SourceChannel = (typeof SOURCE_CHANNELS)[number];

export const PARTICIPANT_MODES = ["ONLINE", "OFFLINE"] as const;
export type ParticipantMode = (typeof PARTICIPANT_MODES)[number];

export function slugifyEventTitle(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export function isRegistrationDocumentType(value: string): value is RegistrationDocumentType {
    return REGISTRATION_DOCUMENT_TYPES.includes(value as RegistrationDocumentType);
}

export function isSourceChannel(value: string): value is SourceChannel {
    return SOURCE_CHANNELS.includes(value as SourceChannel);
}

export function isParticipantMode(value: string): value is ParticipantMode {
    return PARTICIPANT_MODES.includes(value as ParticipantMode);
}

export function calculateEventTotalFee(event: {
    registrationFee: number | null;
    onlineTuitionFee: number | null;
    offlineTuitionFee: number | null;
    alumniRegistrationFee: number | null;
}, participantMode: ParticipantMode) {
    const registrationFee = event.registrationFee ?? 0;
    const tuitionFee = participantMode === "OFFLINE"
        ? event.offlineTuitionFee ?? 0
        : event.onlineTuitionFee ?? 0;

    return {
        registrationFee,
        tuitionFee,
        totalFee: registrationFee + tuitionFee,
        alumniTotalFee: (event.alumniRegistrationFee ?? 0) + tuitionFee,
    };
}

export function formatRupiah(value: number | null | undefined) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}
