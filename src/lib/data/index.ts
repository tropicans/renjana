// Central Data Export
export * from './users';
export * from './courses';
export * from './enrollments';

// Dashboard Stats Helpers
import { users } from './users';
import { courses } from './courses';
import { enrollments } from './enrollments';

export interface DashboardStats {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    revenue: number;
}

export function getDashboardStats(): DashboardStats {
    return {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        revenue: enrollments.reduce((sum, e) => {
            const course = courses.find(c => c.id === e.courseId);
            return sum + (course?.price || 0);
        }, 0),
    };
}

export function getLearnerStats(userId: string) {
    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const activeCount = userEnrollments.filter(e => e.status === 'active').length;
    const completedCount = userEnrollments.filter(e => e.status === 'completed').length;
    const averageProgress = userEnrollments.length > 0
        ? Math.round(userEnrollments.reduce((sum, e) => sum + e.progress, 0) / userEnrollments.length)
        : 0;

    return {
        enrolledCourses: userEnrollments.length,
        activeCourses: activeCount,
        completedCourses: completedCount,
        averageProgress,
        totalHoursLearned: userEnrollments.reduce((sum, e) => {
            const course = courses.find(c => c.id === e.courseId);
            return sum + ((course?.duration || 0) * (e.progress / 100));
        }, 0),
    };
}

export function getInstructorStats(instructorId: string) {
    const instructorCourses = courses.filter(c => c.instructor.id === instructorId);
    const courseIds = instructorCourses.map(c => c.id);
    const courseEnrollments = enrollments.filter(e => courseIds.includes(e.courseId));

    return {
        totalCourses: instructorCourses.length,
        totalLearners: courseEnrollments.length,
        activeLearners: courseEnrollments.filter(e => e.status === 'active').length,
        averageRating: instructorCourses.length > 0
            ? instructorCourses.reduce((sum, c) => sum + c.rating, 0) / instructorCourses.length
            : 0,
        completionRate: courseEnrollments.length > 0
            ? Math.round((courseEnrollments.filter(e => e.status === 'completed').length / courseEnrollments.length) * 100)
            : 0,
    };
}

export function getManagerStats() {
    const learners = users.filter(u => u.role === 'learner');
    const enrolledLearners = new Set(enrollments.map(e => e.userId)).size;

    return {
        totalLearners: learners.length,
        enrolledLearners,
        enrollmentRate: learners.length > 0 ? Math.round((enrolledLearners / learners.length) * 100) : 0,
        averageProgress: enrollments.length > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
            : 0,
        completionRate: enrollments.length > 0
            ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)
            : 0,
    };
}

export function getFinanceStats() {
    const totalRevenue = enrollments.reduce((sum, e) => {
        const course = courses.find(c => c.id === e.courseId);
        return sum + (course?.price || 0);
    }, 0);

    return {
        totalRevenue,
        totalTransactions: enrollments.length,
        averageOrderValue: enrollments.length > 0 ? Math.round(totalRevenue / enrollments.length) : 0,
        monthlyRevenue: Math.round(totalRevenue * 0.3), // Mock 30% as current month
    };
}
