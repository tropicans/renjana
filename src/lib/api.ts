// Central API client for frontend data fetching

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

// ── Courses ────────────────────────────────────────────────────
export interface ApiCourse {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    status: string;
    createdAt: string;
    _count: { modules: number; enrollments: number };
    totalLessons: number;
    totalDurationMin: number;
}

export interface ApiCourseDetail extends Omit<ApiCourse, "_count"> {
    modules: {
        id: string;
        title: string;
        order: number;
        lessons: {
            id: string;
            title: string;
            type: string;
            durationMin: number | null;
            order: number;
        }[];
    }[];
    enrollments: { id: string; userId: string }[];
}

export function fetchCourses(params?: { search?: string }) {
    const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : "";
    return apiFetch<{ courses: ApiCourse[] }>(`/api/courses${qs}`);
}

export function fetchCourseById(id: string) {
    return apiFetch<{ course: ApiCourseDetail }>(`/api/courses/${id}`);
}

// ── Enrollments ────────────────────────────────────────────────
export interface ApiEnrollment {
    id: string;
    courseId: string;
    status: string;
    completionPercentage: number;
    enrolledAt: string;
    course: {
        id: string;
        title: string;
        description: string | null;
        thumbnail: string | null;
    };
}

export function fetchMyEnrollments() {
    return apiFetch<{ enrollments: ApiEnrollment[] }>("/api/enrollments");
}

export function enrollInCourse(courseId: string) {
    return apiFetch<{ enrollment: ApiEnrollment }>("/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId }),
    });
}

// ── Dashboard Stats ────────────────────────────────────────────
export interface ApiDashboardStats {
    role: string;
    enrolledCourses?: number;
    completedCourses?: number;
    activeCourses?: number;
    totalHoursLearned?: number;
    totalUsers?: number;
    totalCourses?: number;
    totalEnrollments?: number;
    activeEnrollments?: number;
    completedEnrollments?: number;
    totalLearners?: number;
    totalInstructors?: number;
}

export function fetchDashboardStats() {
    return apiFetch<ApiDashboardStats>("/api/dashboard/stats");
}

// ── Admin Users ────────────────────────────────────────────────
export interface ApiUser {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    _count: { enrollments: number };
}

export function fetchAdminUsers() {
    return apiFetch<{ users: ApiUser[] }>("/api/admin/users");
}

export function createAdminUser(data: { email: string; password: string; fullName: string; role: string }) {
    return apiFetch<{ user: ApiUser }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateAdminUser(id: string, data: Partial<{ fullName: string; role: string; isActive: boolean }>) {
    return apiFetch<{ user: ApiUser }>(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteAdminUser(id: string) {
    return apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" });
}
