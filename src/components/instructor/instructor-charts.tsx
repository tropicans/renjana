"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { TrendingUp } from "lucide-react";

interface InstructorTrendChartProps {
    courses: {
        id: string;
        title: string;
        _count: { enrollments: number };
    }[];
}

export function InstructorTrendChart({ courses }: InstructorTrendChartProps) {
    if (!courses || courses.length === 0) return null;

    // Transform course data into chart format
    const chartData = courses.map(course => ({
        name: course.title.length > 20 ? course.title.substring(0, 20) + "..." : course.title,
        fullTitle: course.title,
        Peserta: course._count.enrollments
    }));

    return (
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Sebaran Peserta per Program
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Perbandingan jumlah peserta pada program aktif yang Anda ampu</p>
                </div>
            </div>

            <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border, #e5e7eb)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-muted-foreground, #6b7280)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--color-muted-foreground, #6b7280)', fontSize: 12 }}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--color-muted, #f3f4f6)', opacity: 0.4 }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid var(--color-border, #e5e7eb)',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                backgroundColor: 'var(--color-background, #ffffff)'
                            }}
                            labelStyle={{ fontWeight: 'bold', color: 'var(--color-foreground, #111827)' }}
                        />
                        <Bar
                            dataKey="Peserta"
                            radius={[6, 6, 0, 0]}
                            barSize={40}
                        >
                            {
                                chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#3b82f6" /> // blue-500 equivalent representing Instructor theme
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
