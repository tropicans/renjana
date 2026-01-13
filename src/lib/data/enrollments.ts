// Mock Enrollments & Progress Data Store
import { courses, Course } from './courses';
import { users, User } from './users';

export type EnrollmentStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface ActivityProgress {
    activityId: string;
    completed: boolean;
    completedAt?: string;
    score?: number; // For quizzes
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: EnrollmentStatus;
    enrolledAt: string;
    startedAt?: string;
    completedAt?: string;
    progress: number; // 0-100
    activityProgress: ActivityProgress[];
    certificateUrl?: string;
}

// Initial mock enrollments
export let enrollments: Enrollment[] = [
    {
        id: 'enroll-1',
        userId: 'user-1',
        courseId: 'course-1',
        status: 'active',
        enrolledAt: '2024-10-15',
        startedAt: '2024-10-16',
        progress: 65,
        activityProgress: [
            { activityId: 'act-1-1-1', completed: true, completedAt: '2024-10-16' },
            { activityId: 'act-1-1-2', completed: true, completedAt: '2024-10-17' },
            { activityId: 'act-1-1-3', completed: true, completedAt: '2024-10-17' },
            { activityId: 'act-1-1-4', completed: true, completedAt: '2024-10-18', score: 85 },
            { activityId: 'act-1-2-1', completed: true, completedAt: '2024-10-20' },
            { activityId: 'act-1-2-2', completed: true, completedAt: '2024-10-21' },
            { activityId: 'act-1-2-3', completed: false },
            { activityId: 'act-1-2-4', completed: false },
        ],
    },
    {
        id: 'enroll-2',
        userId: 'user-1',
        courseId: 'course-3',
        status: 'active',
        enrolledAt: '2024-11-01',
        startedAt: '2024-11-02',
        progress: 25,
        activityProgress: [
            { activityId: 'act-3-1-1', completed: true, completedAt: '2024-11-02' },
            { activityId: 'act-3-1-2', completed: true, completedAt: '2024-11-03' },
            { activityId: 'act-3-1-3', completed: false },
            { activityId: 'act-3-1-4', completed: false },
        ],
    },
    {
        id: 'enroll-3',
        userId: 'user-2',
        courseId: 'course-2',
        status: 'completed',
        enrolledAt: '2024-08-01',
        startedAt: '2024-08-02',
        completedAt: '2024-09-15',
        progress: 100,
        certificateUrl: '/certificates/user-2-course-2.pdf',
        activityProgress: [
            { activityId: 'act-2-1-1', completed: true, completedAt: '2024-08-02' },
            { activityId: 'act-2-1-2', completed: true, completedAt: '2024-08-05' },
            { activityId: 'act-2-1-3', completed: true, completedAt: '2024-08-07' },
            { activityId: 'act-2-1-4', completed: true, completedAt: '2024-08-10', score: 92 },
            { activityId: 'act-2-2-1', completed: true, completedAt: '2024-08-15' },
            { activityId: 'act-2-2-2', completed: true, completedAt: '2024-08-20' },
            { activityId: 'act-2-2-3', completed: true, completedAt: '2024-09-01' },
            { activityId: 'act-2-2-4', completed: true, completedAt: '2024-09-15', score: 88 },
        ],
    },
    {
        id: 'enroll-4',
        userId: 'user-2',
        courseId: 'course-4',
        status: 'active',
        enrolledAt: '2024-11-10',
        progress: 0,
        activityProgress: [],
    },
];

// Helper functions
export function getEnrollmentById(id: string): Enrollment | undefined {
    return enrollments.find(e => e.id === id);
}

export function getEnrollmentsByUser(userId: string): Enrollment[] {
    return enrollments.filter(e => e.userId === userId);
}

export function getEnrollmentsByCourse(courseId: string): Enrollment[] {
    return enrollments.filter(e => e.courseId === courseId);
}

export function getUserEnrollment(userId: string, courseId: string): Enrollment | undefined {
    return enrollments.find(e => e.userId === userId && e.courseId === courseId);
}

export function isUserEnrolled(userId: string, courseId: string): boolean {
    return enrollments.some(e => e.userId === userId && e.courseId === courseId);
}

export function createEnrollment(userId: string, courseId: string): Enrollment {
    const newEnrollment: Enrollment = {
        id: `enroll-${Date.now()}`,
        userId,
        courseId,
        status: 'active',
        enrolledAt: new Date().toISOString().split('T')[0],
        progress: 0,
        activityProgress: [],
    };
    enrollments.push(newEnrollment);
    return newEnrollment;
}

export function updateActivityProgress(
    enrollmentId: string,
    activityId: string,
    score?: number
): boolean {
    const enrollment = getEnrollmentById(enrollmentId);
    if (!enrollment) return false;

    const existingProgress = enrollment.activityProgress.find(p => p.activityId === activityId);
    if (existingProgress) {
        existingProgress.completed = true;
        existingProgress.completedAt = new Date().toISOString().split('T')[0];
        if (score !== undefined) existingProgress.score = score;
    } else {
        enrollment.activityProgress.push({
            activityId,
            completed: true,
            completedAt: new Date().toISOString().split('T')[0],
            score,
        });
    }

    // Recalculate progress
    const course = courses.find(c => c.id === enrollment.courseId);
    if (course) {
        const totalActivities = course.modules.reduce((sum, m) => sum + m.activities.length, 0);
        const completedActivities = enrollment.activityProgress.filter(p => p.completed).length;
        enrollment.progress = Math.round((completedActivities / totalActivities) * 100);

        // Check if completed
        if (enrollment.progress === 100) {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date().toISOString().split('T')[0];
        }
    }

    return true;
}

// Get enriched enrollment with course data
export function getEnrichedEnrollment(enrollment: Enrollment) {
    const course = courses.find(c => c.id === enrollment.courseId);
    const user = users.find(u => u.id === enrollment.userId);
    return {
        ...enrollment,
        course,
        user,
    };
}

export function getUserEnrolledCourses(userId: string) {
    return getEnrollmentsByUser(userId).map(e => ({
        ...e,
        course: courses.find(c => c.id === e.courseId),
    }));
}
