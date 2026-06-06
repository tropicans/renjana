"use client";

import { BookOpen, Laptop, Users, Building } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function LearningMethodsSection() {
    const { t } = useLanguage();

    return (
        <section className="py-24 px-6 bg-[#fbfbfb] dark:bg-[#151d28] border-y border-gray-100 dark:border-gray-800">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 block">
                        {t.home.methodsTitle}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white">
                        {t.home.methodsSubtitle}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                        {t.home.methodsDescription}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                    {/* Mandiri */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen className="text-blue-600 dark:text-blue-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                            {t.home.methodSelfPaced}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t.home.methodSelfPacedDesc}
                        </p>
                    </div>

                    {/* Daring / Online */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Laptop className="text-indigo-600 dark:indigo-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                            {t.home.methodOnline}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t.home.methodOnlineDesc}
                        </p>
                    </div>

                    {/* Luring / Offline */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Building className="text-emerald-600 dark:text-emerald-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                            {t.home.methodOffline}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t.home.methodOfflineDesc}
                        </p>
                    </div>

                    {/* Hybrid */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl apple-shadow border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="text-rose-600 dark:text-rose-400 size-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                            {t.home.methodHybrid}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            {t.home.methodHybridDesc}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
