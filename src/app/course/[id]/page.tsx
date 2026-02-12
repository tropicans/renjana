"use client";

import { SiteHeader } from "@/components/ui/site-header";
import { EnrollButton } from "@/components/course/enroll-button";
import { getCourseById } from "@/lib/data/courses";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Clock, User, BookOpen, Calendar, ArrowLeft, Star, Users } from "lucide-react";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.id as string;

    // Get course from mock data
    const course = getCourseById(courseId);

    // Fallback to default course if not found
    const displayCourse = course || {
        id: courseId,
        title: "Pelatihan dan Sertifikasi Mediator",
        description: `Program Sertifikasi Mediator ini dirancang untuk memberikan pemahaman mendalam tentang teknik mediasi, negosiasi, dan resolusi konflik sesuai dengan Peraturan Mahkamah Agung (PERMA). Peserta akan dilatih oleh praktisi ahli dan akademisi berpengalaman.`,
        shortDescription: "Become a certified mediator recognized by the Supreme Court.",
        duration: 40,
        instructor: {
            id: "user-3",
            name: "Team Justitia Training Center",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Justitia",
            title: "Expert Trainers"
        },
        modality: "hybrid" as const,
        price: 7500000,
        learnerCount: 450,
        rating: 4.9,
        level: "advanced" as const,
        features: [
            "Sertifikat resmi dari lembaga terakreditasi MA",
            "Materi pembelajaran digital & fisik",
            "Networking dengan praktisi hukum",
            "Bimbingan pasca pelatihan"
        ],
        category: "certification" as const,
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800",
        modules: [
            {
                id: "mod-1",
                title: "Dasar-dasar Mediasi menurut PERMA",
                description: "Fundamentals",
                duration: 180,
                activities: []
            },
            {
                id: "mod-2",
                title: "Kode Etik Mediator",
                description: "Ethics",
                duration: 120,
                activities: []
            },
            {
                id: "mod-3",
                title: "Teknik Negosiasi dan Komunikasi Efektif",
                description: "Negotiation",
                duration: 180,
                activities: []
            },
            {
                id: "mod-4",
                title: "Administrasi Mediasi di Pengadilan",
                description: "Administration",
                duration: 120,
                activities: []
            },
            {
                id: "mod-5",
                title: "Simulasi Proses Mediasi (Roleplay)",
                description: "Simulation",
                duration: 240,
                activities: []
            },
            {
                id: "mod-6",
                title: "Ujian Sertifikasi",
                description: "Certification Exam",
                duration: 60,
                activities: []
            }
        ],
        createdAt: "2024-01-01"
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getModalityLabel = (modality: string) => {
        switch (modality) {
            case 'luring': return 'Offline';
            case 'daring': return 'Online';
            case 'hybrid': return 'Hybrid';
            default: return modality;
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111418] dark:text-white antialiased">
            <SiteHeader />

            <main className="pt-20 pb-24">
                {/* Breadcrumb */}
                <div className="bg-white dark:bg-[#0a0f14] border-b border-gray-100 dark:border-gray-800">
                    <div className="max-w-[1200px] mx-auto px-6 py-4">
                        <Link href="/courses" className="text-gray-500 hover:text-primary flex items-center gap-2 text-sm transition font-medium">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Courses
                        </Link>
                    </div>
                </div>

                {/* Hero Area */}
                <section className="py-16 px-6 bg-white dark:bg-[#0a0f14]">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2">
                                <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                                    {displayCourse.category}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                                    {displayCourse.title}
                                </h1>
                                <p className="text-xl text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                    {displayCourse.shortDescription}
                                </p>

                                {/* Rating & Learners */}
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold">{displayCourse.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Users className="h-5 w-5" />
                                        <span>{displayCourse.learnerCount.toLocaleString()} learners</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-background-light dark:bg-[#1a242f] rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Duration</span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Clock className="w-4 h-4 text-primary" />
                                            {displayCourse.duration} Jam
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Instructor</span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <User className="w-4 h-4 text-primary" />
                                            {displayCourse.instructor.name.split(' ')[0]}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Modality</span>
                                        <div className="flex items-center gap-2 font-semibold">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {getModalityLabel(displayCourse.modality)}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Level</span>
                                        <div className="flex items-center gap-2 font-semibold capitalize">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            {displayCourse.level}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing/Registration Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-[#1a242f] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 sticky top-24">
                                    {/* Course Image */}
                                    <Image
                                        src={displayCourse.image}
                                        alt={displayCourse.title}
                                        width={960}
                                        height={540}
                                        className="w-full aspect-video rounded-xl object-cover mb-6"
                                    />

                                    <div className="mb-8">
                                        <span className="text-gray-400 text-sm">Investment Fee</span>
                                        <div className="text-4xl font-extrabold mt-2">{formatPrice(displayCourse.price)}</div>
                                        <p className="text-xs text-gray-400 mt-3 italic">*Termasuk materi dan sertifikasi.</p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {displayCourse.features.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <EnrollButton courseId={displayCourse.id} variant="large" className="w-full" />

                                    <p className="text-center text-gray-400 text-xs mt-4">
                                        Secure payment powered by Renjana
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Sections */}
                <section className="py-16 px-6">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                <div>
                                    <h2 className="text-3xl font-bold mb-6">About this program</h2>
                                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {displayCourse.description}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Syllabus / Curriculum</h3>
                                    <div className="space-y-4">
                                        {displayCourse.modules.map((module, i) => (
                                            <div
                                                key={module.id}
                                                className="flex items-center gap-4 p-5 bg-white dark:bg-[#1a242f] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all"
                                            >
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium">{module.title}</span>
                                                    <p className="text-sm text-gray-500 mt-1">{module.duration} menit</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Instructor */}
                                <div>
                                    <h3 className="text-2xl font-bold mb-6">Instructor</h3>
                                    <div className="flex items-center gap-4 p-6 bg-white dark:bg-[#1a242f] rounded-xl border border-gray-100 dark:border-gray-800">
                                        <Image
                                            src={displayCourse.instructor.avatar}
                                            alt={displayCourse.instructor.name}
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold text-lg">{displayCourse.instructor.name}</h4>
                                            <p className="text-gray-500">{displayCourse.instructor.title}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-100 dark:border-white/10 py-12 bg-white dark:bg-background-dark">
                    <div className="max-w-[1200px] mx-auto px-6 text-center">
                        <p className="text-gray-400 dark:text-gray-600 text-xs">
                            © {new Date().getFullYear()} Renjana Legal Training. All rights reserved.
                        </p>
                    </div>
                </footer>
            </main>
        </div>
    );
}
