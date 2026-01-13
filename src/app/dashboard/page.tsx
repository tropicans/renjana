"use client";

import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActionCard } from "@/components/dashboard/action-card";
import { EnrolledCourses } from "@/components/course/enrolled-courses";
import { useUser } from "@/lib/context/user-context";
import { getLearnerStats, getUserEnrolledCourses } from "@/lib/data";
import {
    BookOpen,
    CheckCircle,
    Clock,
    ArrowRight,
    Sparkles,
    PlayCircle,
} from "lucide-react";

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useUser();

    // Get real stats from mock data
    const stats = user ? getLearnerStats(user.id) : null;
    const enrollments = user ? getUserEnrolledCourses(user.id) : [];

    // Find the first in-progress enrollment for "Next Action"
    const activeEnrollment = enrollments.find(e => e.status === 'active' && e.course);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Here's what's happening with your learning journey today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Enrolled Programs"
                    value={stats?.enrolledCourses || 0}
                    icon={BookOpen}
                    description="Active courses"
                />
                <StatCard
                    title="Completed Courses"
                    value={stats?.completedCourses || 0}
                    icon={CheckCircle}
                    trend={stats?.completedCourses ? { value: stats.completedCourses * 10, positive: true } : undefined}
                />
                <StatCard
                    title="In Progress"
                    value={stats?.activeCourses || 0}
                    icon={Sparkles}
                    description="Keep learning!"
                />
                <StatCard
                    title="Hours Learned"
                    value={Math.round(stats?.totalHoursLearned || 0)}
                    icon={Clock}
                    trend={{ value: 12, positive: true }}
                />
            </div>

            {/* Next Action - Prominent CTA */}
            {activeEnrollment && activeEnrollment.course ? (
                <div className="rounded-3xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-primary text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
                                    Continue Learning
                                </span>
                                <span className="text-sm text-primary font-semibold">
                                    {activeEnrollment.progress}% complete
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold">{activeEnrollment.course.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {activeEnrollment.course.instructor.name}
                            </p>
                            {/* Progress Bar */}
                            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${activeEnrollment.progress}%` }}
                                />
                            </div>
                        </div>
                        <Link
                            href={`/learn/${activeEnrollment.courseId}`}
                            className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                        >
                            <PlayCircle className="h-5 w-5" />
                            Resume Course
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold">Start Your Learning Journey</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                Browse our catalog and enroll in your first course today!
                            </p>
                        </div>
                        <Link
                            href="/courses"
                            className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 shrink-0"
                        >
                            Explore Courses
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="rounded-3xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8">
                    <div className="flex items-center gap-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <div>
                            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                                All Courses Completed! 🎉
                            </h2>
                            <p className="text-green-600 dark:text-green-500">
                                Great job! Browse more courses to continue learning.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* My Courses */}
            <EnrolledCourses />

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link
                        href="/courses"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <BookOpen className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">Browse Courses</h3>
                        <p className="text-sm text-gray-500 mt-1">Explore our catalog</p>
                    </Link>
                    <Link
                        href="/dashboard/evidence"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <Sparkles className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">Upload Evidence</h3>
                        <p className="text-sm text-gray-500 mt-1">Submit your work</p>
                    </Link>
                    <Link
                        href="/dashboard/feedback"
                        className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] hover:border-primary/50 transition-all group"
                    >
                        <CheckCircle className="h-8 w-8 text-primary mb-4" />
                        <h3 className="font-bold group-hover:text-primary transition-colors">View Feedback</h3>
                        <p className="text-sm text-gray-500 mt-1">Check instructor notes</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
