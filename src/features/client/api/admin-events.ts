export interface ApiAdminEventDetail {
    id: string;
    courseId: string | null;
    slug: string;
    title: string;
    category: string;
    summary: string | null;
    description: string | null;
    bannerUrl: string | null;
    modality: string;
    status: string;
    location: string | null;
    platform: string | null;
    registrationStart: string | null;
    registrationEnd: string | null;
    eventStart: string | null;
    eventEnd: string | null;
    scheduleSummary: string | null;
    contactName: string | null;
    contactPhone: string | null;
    termsSummary: string | null;
    refundPolicySummary: string | null;
    registrationFee: number | null;
    onlineTuitionFee: number | null;
    offlineTuitionFee: number | null;
    alumniRegistrationFee: number | null;
    learningEnabled: boolean;
    preTestEnabled: boolean;
    postTestEnabled: boolean;
    evaluationEnabled: boolean;
    certificateEnabled: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    course: { id: string; title: string } | null;
    _count: { registrations: number };
}

const BASE = "";

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${url}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API error ${res.status}`);
    }
    return res.json();
}

async function adminEventMutationFetch(url: string, init: RequestInit) {
    const res = await fetch(`${BASE}${url}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init.headers },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const details = Array.isArray(body.details)
            ? body.details.filter((detail: unknown) => typeof detail === "string" && detail.trim()).join(" • ")
            : "";
        const message = body.error || `API error ${res.status}`;
        throw new Error(details && details !== message ? `${message} • ${details}` : message);
    }

    return res.json() as Promise<{ event: unknown }>;
}

export function fetchAdminEvents() {
    return apiFetch<{
        events: Array<{
            id: string;
            slug: string;
            title: string;
            category: string;
            status: string;
            modality: string;
            isFeatured: boolean;
            learningEnabled: boolean;
            preTestEnabled: boolean;
            postTestEnabled: boolean;
            evaluationEnabled: boolean;
            certificateEnabled: boolean;
            registrationStart: string | null;
            registrationEnd: string | null;
            eventStart: string | null;
            course: { id: string; title: string } | null;
            _count: { registrations: number };
        }>;
    }>("/api/admin/events");
}

export function createAdminEvent(data: Record<string, unknown>) {
    return adminEventMutationFetch("/api/admin/events", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateAdminEvent(id: string, data: Record<string, unknown>) {
    return adminEventMutationFetch(`/api/admin/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function fetchAdminEvent(id: string) {
    return apiFetch<{ event: ApiAdminEventDetail }>(`/api/admin/events/${id}`);
}

export function fetchAdminQuizzes(courseId?: string) {
    const qs = courseId ? `?courseId=${courseId}` : "";
    return apiFetch<{
        quizzes: Array<{
            id: string;
            type: "PRE_TEST" | "POST_TEST";
            title: string;
            timeLimit: number | null;
            passingScore: number;
            attemptsAllowed: number | null;
            questions: Array<{
                question: string;
                options: string[];
                correctIdx: number;
            }>;
            _count: { questions: number; attempts: number };
        }>;
    }>(`/api/admin/quizzes${qs}`);
}

export function createAdminQuiz(data: {
    courseId: string;
    type: "PRE_TEST" | "POST_TEST";
    title: string;
    timeLimit?: number | null;
    passingScore?: number;
    questions: Array<{
        question: string;
        options: string[];
        correctIdx: number;
    }>;
}) {
    return apiFetch<{ quiz: { id: string } }>("/api/admin/quizzes", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateAdminQuiz(quizId: string, data: {
    title?: string;
    timeLimit?: number | null;
    passingScore?: number;
    questions?: Array<{
        question: string;
        options: string[];
        correctIdx: number;
    }>;
}) {
    return apiFetch<{ quiz: { id: string } }>(`/api/admin/quizzes/${quizId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteAdminQuiz(quizId: string) {
    return apiFetch<{ success: boolean }>(`/api/admin/quizzes/${quizId}`, {
        method: "DELETE",
    });
}
