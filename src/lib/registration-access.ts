import { prisma } from "@/lib/db";

const ACCESSIBLE_REGISTRATION_STATUSES = ["APPROVED", "ACTIVE", "COMPLETED"] as const;
type AccessibleRegistrationStatus = (typeof ACCESSIBLE_REGISTRATION_STATUSES)[number];

export async function getCourseLifecycleAccess(userId: string, courseId: string) {
    const linkedEvents = await prisma.event.findMany({
        where: { courseId },
        select: { id: true, title: true, slug: true, status: true, evaluationEnabled: true, certificateEnabled: true, postTestEnabled: true },
    });

    if (linkedEvents.length === 0) {
        return { allowed: true as const, requiresRegistration: false, registration: null, linkedEvent: null };
    }

    const registrations = await prisma.registration.findMany({
        where: {
            userId,
            eventId: { in: linkedEvents.map((event: { id: string }) => event.id) },
        },
        orderBy: { createdAt: "desc" },
        include: {
            event: { select: { id: true, title: true, slug: true, status: true, evaluationEnabled: true, certificateEnabled: true, postTestEnabled: true } },
        },
    });

    const registration = registrations[0] ?? null;
    const linkedEvent = linkedEvents[0] ?? null;

    if (!registration) {
        return { allowed: false as const, requiresRegistration: true, registration: null, linkedEvent };
    }

    return {
        allowed: ACCESSIBLE_REGISTRATION_STATUSES.includes(registration.status as AccessibleRegistrationStatus),
        requiresRegistration: true,
        registration,
        linkedEvent: registration.event,
    };
}

export async function getAccessibleRegistrationForCourse(userId: string, courseId: string, registrationId?: string | null) {
    const access = await getCourseLifecycleAccess(userId, courseId);

    if (!access.requiresRegistration) {
        return { access, registration: null };
    }

    if (!access.registration) {
        return { access, registration: null };
    }

    if (!registrationId) {
        return { access, registration: access.registration };
    }

    const selectedRegistration = await prisma.registration.findFirst({
        where: {
            id: registrationId,
            userId,
            event: { courseId },
        },
        include: {
            event: { select: { id: true, title: true, slug: true, status: true, evaluationEnabled: true, certificateEnabled: true, postTestEnabled: true } },
        },
    });

    if (!selectedRegistration) {
        return { access: { ...access, allowed: false }, registration: null };
    }

    return {
        access: {
            ...access,
            allowed: ACCESSIBLE_REGISTRATION_STATUSES.includes(selectedRegistration.status as AccessibleRegistrationStatus),
            registration: selectedRegistration,
            linkedEvent: selectedRegistration.event,
        },
        registration: selectedRegistration,
    };
}
