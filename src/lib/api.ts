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
    type: string;
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

// ── Progress ──────────────────────────────────────────────────
export interface ApiProgress {
    lessonId: string;
    isCompleted: boolean;
    completedAt: string | null;
    score: number | null;
}

export interface ApiProgressResponse {
    enrollmentId: string;
    completionPercentage: number;
    status: string;
    progresses: ApiProgress[];
}

export function fetchProgress(enrollmentId: string) {
    return apiFetch<ApiProgressResponse>(`/api/progress/${enrollmentId}`);
}

export function markLessonComplete(enrollmentId: string, lessonId: string) {
    return apiFetch<{
        progress: ApiProgress;
        enrollment: { id: string; completionPercentage: number; status: string };
    }>("/api/progress", {
        method: "PUT",
        body: JSON.stringify({ enrollmentId, lessonId }),
    });
}

// ── Attendance ────────────────────────────────────────────────
export interface ApiAttendance {
    id: string;
    userId: string;
    lessonId: string;
    checkedAt: string;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    user?: { id: string; fullName: string; email: string };
    lesson?: {
        id: string;
        title: string;
        type: string;
        module?: { title: string; course: { title: string } };
    };
}

export function fetchAttendances(lessonId?: string) {
    const qs = lessonId ? `?lessonId=${lessonId}` : "";
    return apiFetch<{ attendances: ApiAttendance[] }>(`/api/attendance${qs}`);
}

export function checkIn(data: { lessonId?: string; courseId?: string; latitude?: number; longitude?: number; notes?: string }) {
    return apiFetch<{ attendance: ApiAttendance }>("/api/attendance", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ── Evidence ──────────────────────────────────────────────────
export interface ApiEvidence {
    id: string;
    userId: string;
    title: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
    user?: { id: string; fullName: string; email: string };
}

export function fetchEvidences() {
    return apiFetch<{ evidences: ApiEvidence[] }>("/api/evidence");
}

export async function uploadEvidence(title: string, file: File) {
    const form = new FormData();
    form.append("title", title);
    form.append("file", file);

    const res = await fetch("/api/evidence", { method: "POST", body: form });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed ${res.status}`);
    }
    return res.json() as Promise<{ evidence: ApiEvidence }>;
}

// ── Certificates ──────────────────────────────────────────────
export interface ApiCertificate {
    id: string;
    enrollmentId: string;
    userId: string;
    pdfUrl: string | null;
    issuedAt: string;
}

export function fetchCertificate(enrollmentId: string) {
    return apiFetch<{ certificate: ApiCertificate }>(`/api/certificates/${enrollmentId}`);
}

// ── Admin: Users ──────────────────────────────────────────────
export function fetchUsers() {
    return apiFetch<{ users: Array<{ id: string; fullName: string; email: string; role: string; isActive: boolean }> }>("/api/admin/users");
}

// ── Admin: Courses CRUD ───────────────────────────────────────
export function fetchAdminCourses() {
    return apiFetch<{
        courses: Array<{
            id: string; title: string; description: string | null; status: string;
            createdAt: string; _count: { modules: number; enrollments: number };
            modules: Array<{ id: string; title: string; order: number; _count: { lessons: number } }>;
        }>
    }>("/api/admin/courses");
}

export function fetchAdminCourse(id: string) {
    return apiFetch<{ course: any }>(`/api/admin/courses/${id}`);
}

export function createCourse(data: { title: string; description?: string; status?: string }) {
    return apiFetch<{ course: any }>("/api/admin/courses", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateCourse(id: string, data: { title?: string; description?: string; status?: string }) {
    return apiFetch<{ course: any }>(`/api/admin/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteCourse(id: string) {
    return apiFetch<{ success: boolean }>(`/api/admin/courses/${id}`, { method: "DELETE" });
}

// ── Admin: Enrollments ────────────────────────────────────────
export function fetchAdminEnrollments() {
    return apiFetch<{
        enrollments: Array<{
            id: string; userId: string; courseId: string; status: string;
            completionPercentage: number; enrolledAt: string; completedAt: string | null;
            user: { id: string; fullName: string; email: string; role: string };
            course: { id: string; title: string };
        }>
    }>("/api/admin/enrollments");
}

export function createAdminEnrollment(data: { userId: string; courseId: string }) {
    return apiFetch<{ enrollment: any }>("/api/admin/enrollments", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ── Admin: Audit Logs ─────────────────────────────────────────
export function fetchAuditLogs(limit?: number) {
    const qs = limit ? `?limit=${limit}` : "";
    return apiFetch<{
        logs: Array<{
            id: string; action: string; entity: string; entityId: string | null;
            metadata: any; createdAt: string;
            user: { id: string; fullName: string; email: string };
        }>
    }>(`/api/admin/audit${qs}`);
}

// ── Instructor ────────────────────────────────────────────────
export function fetchInstructorStats() {
    return apiFetch<{ stats: { totalCourses: number; totalEnrollments: number; completedEnrollments: number; totalAttendances: number; totalEvidences: number; avgProgress: number }; recentEnrollments: Array<{ id: string; enrolledAt: string; user: { fullName: string }; course: { title: string } }> }>("/api/instructor/stats");
}

export function fetchInstructorLearners() {
    return apiFetch<{ enrollments: Array<{ id: string; userId: string; courseId: string; status: string; completionPercentage: number; enrolledAt: string; user: { id: string; fullName: string; email: string }; course: { id: string; title: string }; certificate: { id: string; issuedAt: string } | null }>; stats: { totalLearners: number; activeEnrollments: number; completedEnrollments: number; avgCompletion: number } }>("/api/instructor/learners");
}

// ── Quizzes ────────────────────────────────────────────────────
export interface ApiQuizSummary {
    id: string;
    courseId: string;
    type: string;
    title: string;
    timeLimit: number | null;
    passingScore: number;
    questionCount: number;
    lastAttempt: {
        id: string;
        score: number;
        passed: boolean;
        completedAt: string | null;
    } | null;
}

export interface ApiQuizQuestion {
    id: string;
    question: string;
    options: string[];
    order: number;
}

export interface ApiQuizDetail {
    id: string;
    courseId: string;
    type: string;
    title: string;
    timeLimit: number | null;
    passingScore: number;
    questions: ApiQuizQuestion[];
}

export interface ApiQuizAttemptResult {
    id: string;
    score: number;
    passed: boolean;
    totalQuestions: number;
    correctCount: number;
    answers: Array<{
        questionId: string;
        selectedIdx: number;
        correctIdx: number;
        isCorrect: boolean;
    }>;
    completedAt: string | null;
}

export interface ApiQuizAttempt {
    id: string;
    score: number;
    passed: boolean;
    answers: unknown;
    startedAt: string;
    completedAt: string | null;
}

export function fetchQuizzes(courseId: string) {
    return apiFetch<{ quizzes: ApiQuizSummary[] }>(`/api/quizzes/${courseId}`);
}

export function fetchQuizDetail(courseId: string, quizId: string) {
    return apiFetch<{ quiz: ApiQuizDetail }>(`/api/quizzes/${courseId}/${quizId}`);
}

export function submitQuiz(courseId: string, quizId: string, answers: Array<{ questionId: string; selectedIdx: number }>) {
    return apiFetch<{ attempt: ApiQuizAttemptResult }>(`/api/quizzes/${courseId}/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
    });
}

export function fetchQuizAttempts(courseId: string, quizId: string) {
    return apiFetch<{ attempts: ApiQuizAttempt[] }>(`/api/quizzes/${courseId}/${quizId}/attempts`);
}

// ── Evaluations ───────────────────────────────────────────────
export interface ApiEvaluation {
    id: string;
    courseId: string;
    userId: string;
    rating: number;
    comment: string | null;
    answers: unknown;
    createdAt: string;
    course?: { id: string; title: string };
    user?: { id: string; fullName: string; email: string };
}

export function fetchEvaluations(courseId?: string) {
    const qs = courseId ? `?courseId=${courseId}` : "";
    return apiFetch<{ evaluations: ApiEvaluation[]; avgRating?: number; total?: number }>(`/api/evaluations${qs}`);
}

export function submitEvaluation(data: { courseId: string; rating: number; comment?: string }) {
    return apiFetch<{ evaluation: ApiEvaluation }>("/api/evaluations", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
