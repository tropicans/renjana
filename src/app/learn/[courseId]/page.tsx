"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourseById, Course, Module, Activity } from "@/lib/data/courses";
import { getUserEnrollment, updateActivityProgress, Enrollment } from "@/lib/data/enrollments";
import { useUser } from "@/lib/context/user-context";
import { useToast } from "@/components/ui/toast";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    PlayCircle,
    FileText,
    HelpCircle,
    CheckCircle2,
    Circle,
    Clock,
    ChevronDown,
    ChevronRight,
    Video,
    Users,
    Award
} from "lucide-react";

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useUser();
    const toast = useToast();
    const courseId = params.courseId as string;

    const [course, setCourse] = useState<Course | undefined>(undefined);
    const [enrollment, setEnrollment] = useState<Enrollment | undefined>(undefined);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push(`/login?redirect=/learn/${courseId}`);
            return;
        }

        const foundCourse = getCourseById(courseId);
        setCourse(foundCourse);

        if (user && foundCourse) {
            const foundEnrollment = getUserEnrollment(user.id, courseId);
            if (!foundEnrollment) {
                router.push(`/course/${courseId}`);
                return;
            }
            setEnrollment(foundEnrollment);

            // Expand all modules and select first uncompleted activity
            const moduleIds = new Set(foundCourse.modules.map(m => m.id));
            setExpandedModules(moduleIds);

            // Find first uncompleted activity
            for (const module of foundCourse.modules) {
                for (const activity of module.activities) {
                    const isCompleted = foundEnrollment.activityProgress.some(
                        p => p.activityId === activity.id && p.completed
                    );
                    if (!isCompleted) {
                        setSelectedActivity(activity);
                        return;
                    }
                }
            }
            // All completed - select last activity
            const lastModule = foundCourse.modules[foundCourse.modules.length - 1];
            const lastActivity = lastModule.activities[lastModule.activities.length - 1];
            setSelectedActivity(lastActivity);
        }
    }, [authLoading, isAuthenticated, user, courseId, router]);

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const isActivityCompleted = (activityId: string) => {
        return enrollment?.activityProgress.some(p => p.activityId === activityId && p.completed) || false;
    };

    const completeActivity = async () => {
        if (!selectedActivity || !enrollment) return;

        setIsCompleting(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        updateActivityProgress(enrollment.id, selectedActivity.id);

        // Refresh enrollment
        if (user) {
            const refreshedEnrollment = getUserEnrollment(user.id, courseId);
            setEnrollment(refreshedEnrollment);

            // Check if course is now complete
            if (refreshedEnrollment?.progress === 100) {
                toast.success("🎉 Selamat! Anda telah menyelesaikan course ini!");
            } else {
                toast.success("Aktivitas selesai! Lanjutkan ke aktivitas berikutnya.");
            }
        }

        setIsCompleting(false);

        // Auto-advance to next activity
        if (course) {
            let foundCurrent = false;
            for (const module of course.modules) {
                for (const activity of module.activities) {
                    if (foundCurrent) {
                        setSelectedActivity(activity);
                        return;
                    }
                    if (activity.id === selectedActivity.id) {
                        foundCurrent = true;
                    }
                }
            }
        }
    };

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'quiz': return <HelpCircle className="h-4 w-4" />;
            case 'assignment': return <FileText className="h-4 w-4" />;
            case 'reading': return <FileText className="h-4 w-4" />;
            case 'live-session': return <Users className="h-4 w-4" />;
            default: return <PlayCircle className="h-4 w-4" />;
        }
    };

    if (authLoading || !course || !enrollment) {
        return (
            <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] flex">
            {/* Sidebar - Course Navigation */}
            <aside className="w-80 bg-white dark:bg-[#1a242f] border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                    <h2 className="font-bold text-lg line-clamp-2">{course.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} jam</span>
                        <span className="mx-2">•</span>
                        <span className="text-primary font-semibold">{enrollment.progress}% selesai</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${enrollment.progress}%` }}
                        />
                    </div>
                </div>

                {/* Modules List */}
                <div className="flex-1 overflow-y-auto">
                    {course.modules.map((module, index) => (
                        <div key={module.id} className="border-b border-gray-100 dark:border-gray-800">
                            <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                        {index + 1}
                                    </span>
                                    <span className="font-semibold text-sm">{module.title}</span>
                                </div>
                                {expandedModules.has(module.id) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                            </button>
                            {expandedModules.has(module.id) && (
                                <div className="pb-2">
                                    {module.activities.map((activity) => {
                                        const isCompleted = isActivityCompleted(activity.id);
                                        const isSelected = selectedActivity?.id === activity.id;
                                        return (
                                            <button
                                                key={activity.id}
                                                onClick={() => setSelectedActivity(activity)}
                                                className={`w-full pl-16 pr-4 py-3 flex items-center gap-3 text-left text-sm transition-colors ${isSelected
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                                                )}
                                                <span className={`flex-1 ${isCompleted ? 'text-gray-500 line-through' : ''}`}>
                                                    {activity.title}
                                                </span>
                                                <span className="text-xs text-gray-400">{activity.duration}m</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Completion Status */}
                {enrollment.progress === 100 && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="font-bold text-green-700 dark:text-green-400">Selamat!</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Course selesai</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Content - Activity Viewer */}
            <main className="flex-1 flex flex-col">
                {selectedActivity ? (
                    <>
                        {/* Video/Content Area */}
                        <div className="aspect-video bg-black relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                                        {getActivityIcon(selectedActivity.type)}
                                    </div>
                                    <p className="text-lg font-bold">{selectedActivity.title}</p>
                                    <p className="text-sm text-white/60 mt-2">
                                        {selectedActivity.type === 'video' ? 'Video Content' :
                                            selectedActivity.type === 'quiz' ? 'Quiz Activity' :
                                                selectedActivity.type === 'assignment' ? 'Assignment' :
                                                    selectedActivity.type === 'live-session' ? 'Live Session' :
                                                        'Reading Material'}
                                    </p>
                                    <p className="text-xs text-white/40 mt-4">
                                        [Mock Content Player - {selectedActivity.duration} menit]
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Info & Actions */}
                        <div className="flex-1 p-8">
                            <div className="max-w-3xl">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                                            {selectedActivity.type}
                                        </span>
                                        <h1 className="text-2xl font-bold mt-2">{selectedActivity.title}</h1>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        {selectedActivity.duration} menit
                                    </div>
                                </div>

                                <div className="prose dark:prose-invert max-w-none mb-8">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Ini adalah konten placeholder untuk aktivitas "{selectedActivity.title}".
                                        Dalam implementasi nyata, konten video, quiz, atau materi bacaan akan ditampilkan di sini.
                                    </p>
                                </div>

                                {/* Complete Button */}
                                {!isActivityCompleted(selectedActivity.id) ? (
                                    <button
                                        onClick={completeActivity}
                                        disabled={isCompleting}
                                        className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isCompleting ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                Tandai Selesai
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-500">
                                        <CheckCircle2 className="h-6 w-6" />
                                        <span className="font-bold">Aktivitas ini sudah selesai</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Pilih aktivitas untuk memulai</p>
                    </div>
                )}
            </main>
        </div>
    );
}
