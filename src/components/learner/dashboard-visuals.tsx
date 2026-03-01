"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles, TrendingUp } from "lucide-react";

interface ProgressChartProps {
    completionPercentage: number;
}

export function ProgressChart({ completionPercentage }: ProgressChartProps) {
    const data = [
        { name: "Completed", value: completionPercentage },
        { name: "Remaining", value: 100 - completionPercentage },
    ];

    const COLORS = ["#000000", "#e5e7eb"]; // Black for primary, gray for remaining

    return (
        <div className="relative w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? "var(--color-primary, #000)" : "var(--color-muted, #f3f4f6)"}
                                className="dark:opacity-80"
                            />
                        ))}
                    </Pie>
                    <Tooltip cursor={false} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold">{completionPercentage}%</span>
            </div>
        </div>
    );
}

interface InsightsCardProps {
    userName: string;
    completedCourses: number;
    activeCourses: number;
    totalHours: number;
}

export function InsightsCard({ userName, completedCourses, activeCourses, totalHours }: InsightsCardProps) {
    // Generate dynamic insights
    let insightText = "";

    if (completedCourses > 0 && activeCourses === 0) {
        insightText = `Luar biasa, ${userName}! Anda telah menyelesaikan semua modul Anda. Waktunya mengeksplorasi kelas baru?`;
    } else if (activeCourses > 0 && totalHours > 10) {
        insightText = `Anda berada di Top 20% pelajar paling rajin minggu ini dengan total ${Math.round(totalHours)} jam belajar!`;
    } else if (activeCourses > 0) {
        insightText = `Ayo lanjutkan! 40% partisipan biasanya berhenti di pertengahan jalan. Anda pasti bisa menyelesaikannya!`;
    } else {
        insightText = `Mulai perjalanan belajar Anda hari ini untuk membuka potensi maksimal karier hukum Anda.`;
    }

    return (
        <div className="rounded-3xl border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 p-6 flex items-start gap-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3 shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-1 dark:text-gray-200">AI Insight</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {insightText}
                </p>
            </div>
        </div>
    );
}

