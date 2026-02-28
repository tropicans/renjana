"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/context/user-context";
import { useToast } from "@/components/ui/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyEnrollments, enrollInCourse } from "@/lib/api";
import { Check, Loader2, LogIn } from "lucide-react";

interface EnrollButtonProps {
    courseId: string;
    variant?: "default" | "large";
    className?: string;
}

export function EnrollButton({ courseId, variant = "default", className }: EnrollButtonProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useUser();
    const toast = useToast();
    const queryClient = useQueryClient();

    const { data: enrollmentData } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: fetchMyEnrollments,
        enabled: !!user,
    });

    const isEnrolled = enrollmentData?.enrollments?.some((e) => e.courseId === courseId) ?? false;

    const enrollMutation = useMutation({
        mutationFn: () => enrollInCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            toast.success("Berhasil mendaftar! Mulai belajar sekarang.");
        },
        onError: (err) => {
            toast.error(err.message || "Gagal mendaftar. Coba lagi.");
        },
    });

    const handleEnroll = () => {
        if (!isAuthenticated || !user) {
            router.push(`/login?redirect=/course/${courseId}`);
            return;
        }
        enrollMutation.mutate();
    };

    const goToLearn = () => {
        router.push(`/learn/${courseId}`);
    };

    if (isEnrolled) {
        return (
            <button
                onClick={goToLearn}
                className={`flex items-center justify-center gap-2 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-all ${variant === "large" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
                    } ${className}`}
            >
                <Check className="h-5 w-5" />
                Lanjutkan Belajar
            </button>
        );
    }

    if (!isAuthenticated) {
        return (
            <Link
                href={`/login?redirect=/course/${courseId}`}
                className={`flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-all ${variant === "large" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"
                    } ${className}`}
            >
                <LogIn className="h-5 w-5" />
                Login untuk Enroll
            </Link>
        );
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={enrollMutation.isPending}
            className={`flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-all disabled:opacity-50 ${variant === "large" ? "px-8 py-4 text-base shadow-lg shadow-primary/20" : "px-6 py-3 text-sm"
                } ${className}`}
        >
            {enrollMutation.isPending ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                </>
            ) : (
                "Enroll Now"
            )}
        </button>
    );
}
