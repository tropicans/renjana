type EventValidationInput = {
    title?: string | null;
    slug?: string | null;
    registrationStart?: string | Date | null;
    registrationEnd?: string | Date | null;
    eventStart?: string | Date | null;
    eventEnd?: string | Date | null;
    registrationFee?: number | null;
    onlineTuitionFee?: number | null;
    offlineTuitionFee?: number | null;
    alumniRegistrationFee?: number | null;
    preTestEnabled?: boolean;
    postTestEnabled?: boolean;
    evaluationEnabled?: boolean;
    certificateEnabled?: boolean;
    learningEnabled?: boolean;
    courseId?: string | null;
};

type EventRegistrationLifecycleInput = {
    status?: string | null;
    registrationStart?: string | Date | null;
    registrationEnd?: string | Date | null;
    now?: Date;
};

function asDate(value: string | Date | null | undefined) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

const OPEN_REGISTRATION_STATUSES = ["PUBLISHED", "REGISTRATION_OPEN"] as const;

export function validateEventRegistrationLifecycle(input: EventRegistrationLifecycleInput) {
    const now = input.now ?? new Date();
    const registrationStart = asDate(input.registrationStart);
    const registrationEnd = asDate(input.registrationEnd);

    if (!input.status || !OPEN_REGISTRATION_STATUSES.includes(input.status as (typeof OPEN_REGISTRATION_STATUSES)[number])) {
        return {
            ok: false as const,
            error: "Registration is not open for this event",
        };
    }

    if (registrationStart && now < registrationStart) {
        return {
            ok: false as const,
            error: "Registration has not opened yet for this event",
        };
    }

    if (registrationEnd && now > registrationEnd) {
        return {
            ok: false as const,
            error: "Registration has already closed for this event",
        };
    }

    return {
        ok: true as const,
        error: null,
    };
}

export function validateEventPayload(input: EventValidationInput) {
    const errors: string[] = [];

    const title = input.title?.trim();
    const slug = input.slug?.trim();
    const registrationStart = asDate(input.registrationStart);
    const registrationEnd = asDate(input.registrationEnd);
    const eventStart = asDate(input.eventStart);
    const eventEnd = asDate(input.eventEnd);

    if (!title) errors.push("Title is required");
    if (!slug) errors.push("Slug is required");

    const fees = [
        ["Registration fee", input.registrationFee],
        ["Online tuition fee", input.onlineTuitionFee],
        ["Offline tuition fee", input.offlineTuitionFee],
        ["Alumni registration fee", input.alumniRegistrationFee],
    ] as const;

    for (const [label, value] of fees) {
        if (value != null && value < 0) {
            errors.push(`${label} cannot be negative`);
        }
    }

    if (input.alumniRegistrationFee != null && input.registrationFee != null && input.alumniRegistrationFee > input.registrationFee) {
        errors.push("Alumni registration fee cannot exceed the standard registration fee");
    }

    if (registrationStart && registrationEnd && registrationEnd < registrationStart) {
        errors.push("Registration end must be after registration start");
    }

    if (eventStart && eventEnd && eventEnd < eventStart) {
        errors.push("Event end must be after event start");
    }

    if (registrationEnd && eventStart && registrationEnd > eventStart) {
        errors.push("Registration should close before the event starts");
    }

    if ((input.learningEnabled || input.preTestEnabled || input.postTestEnabled || input.evaluationEnabled || input.certificateEnabled) && !input.courseId) {
        errors.push("Linked course is required when learning, tests, evaluation, or certificate features are enabled");
    }

    if ((input.preTestEnabled || input.postTestEnabled || input.evaluationEnabled || input.certificateEnabled) && !input.learningEnabled) {
        errors.push("Learning must be enabled before enabling tests, evaluation, or certificate");
    }

    if (input.certificateEnabled && (!input.postTestEnabled || !input.evaluationEnabled)) {
        errors.push("Certificate requires both post-test and evaluation to be enabled");
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}
