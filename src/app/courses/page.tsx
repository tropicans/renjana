"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/ui/site-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { ChevronRight, ArrowRight, Loader2, BookOpen, Clock, Users } from "lucide-react";
import { fetchCourses } from "@/lib/api";

export default function CoursesPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["courses"],
        queryFn: () => fetchCourses(),
    });

    const courses = data?.courses ?? [];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white transition-colors duration-300">
            <SiteHeader />

            <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 pt-24">
                {/* Hero Header */}
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">Choose Your Program</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
                            Elevate your legal practice with world-class training designed for the modern professional.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-24 text-red-500">
                        Failed to load courses. Please try again.
                    </div>
                )}

                {/* Course Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <ScrollReveal key={course.id} delay={index * 100}>
                                <div className="group flex flex-col bg-white dark:bg-white/5 rounded-xl apple-shadow overflow-hidden border border-gray-100 dark:border-white/5 hover:-translate-y-1 transition-all duration-300 h-full">
                                    {/* Course Thumbnail or Placeholder */}
                                    <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <BookOpen className="h-16 w-16 text-primary/30" />
                                    </div>
                                    <div className="p-8 flex flex-col flex-1">
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-3">
                                            {course.status}
                                        </span>
                                        <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                                            {course.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                {course._count.modules} modules
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {course.totalDurationMin} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {course._count.enrollments} enrolled
                                            </span>
                                        </div>
                                        <Link
                                            href={`/course/${course.id}`}
                                            className="flex items-center gap-1 text-primary font-bold text-sm hover:gap-2 transition-all"
                                        >
                                            See Details <ChevronRight className="size-4" />
                                        </Link>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && courses.length === 0 && (
                    <div className="text-center py-24 text-gray-500">
                        No courses available yet. Check back soon!
                    </div>
                )}

                {/* CTA Section */}
                <ScrollReveal delay={200}>
                    <div className="mt-24 bg-primary/5 dark:bg-primary/10 rounded-2xl p-12 md:p-16 text-center border border-primary/10">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to advance your legal career?</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-10 text-lg">
                            Join thousands of legal professionals who have enhanced their skills through our premium development programs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/register"
                                className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                                Get Started Now
                            </Link>
                            <Link
                                href="/contact"
                                className="flex items-center gap-2 font-bold text-primary hover:underline underline-offset-4"
                            >
                                Contact Admissions <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-white/10 py-12 bg-white dark:bg-background-dark">
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <div className="flex justify-center gap-8 mb-8 text-gray-400 dark:text-gray-500 font-medium text-sm flex-wrap">
                        <Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link>
                        <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
                        <Link className="hover:text-primary transition-colors" href="#">Accessibility</Link>
                        <Link className="hover:text-primary transition-colors" href="/contact">Contact Us</Link>
                    </div>
                    <p className="text-gray-400 dark:text-gray-600 text-xs">
                        © {new Date().getFullYear()} Renjana Legal Training. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
