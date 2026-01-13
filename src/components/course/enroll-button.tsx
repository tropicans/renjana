"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { isUserEnrolled, createEnrollment } from "@/lib/data/enrollments";
import { useUser } from "@/lib/context/user-context";
import { useToast } from "@/components/ui/toast";
import { Check, Loader2, LogIn } from "lucide-react";
import { useState, useEffect } from "react";

interface EnrollButtonProps {
    courseId: string;
    variant?: "default" | "large";
    className?: string;
}

export function EnrollButton({ courseId, variant = "default", className }: EnrollButtonProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useUser();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Check enrollment status when user changes
    useEffect(() => {
        if (user) {
            setIsEnrolled(isUserEnrolled(user.id, courseId));
        }
    }, [user, courseId]);

    const handleEnroll = async () => {
        if (!isAuthenticated || !user) {
            router.push(`/login?redirect=/course/${courseId}`);
            return;
        }

        setIsLoading(true);

        // Simulate enrollment process
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create enrollment
        createEnrollment(user.id, courseId);
        setIsEnrolled(true);
        setIsLoading(false);

        // Show success toast
        toast.success("Berhasil mendaftar! Mulai belajar sekarang.");
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
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-all disabled:opacity-50 ${variant === "large" ? "px-8 py-4 text-base shadow-lg shadow-primary/20" : "px-6 py-3 text-sm"
                } ${className}`}
        >
            {isLoading ? (
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
