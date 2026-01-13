"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Wifi, Shuffle, DollarSign, Save, Plus, Trash2 } from "lucide-react";

// Mock pricing data
const mockPricingByModality = [
    { id: "p1", programName: "Mediator Certification", luring: 12000000, daring: 8500000, hybrid: 10000000 },
    { id: "p2", programName: "Advanced Mediation Skills", luring: 8000000, daring: 5500000, hybrid: 6500000 },
    { id: "p3", programName: "Legal Framework Fundamentals", luring: 5000000, daring: 3500000, hybrid: 4000000 },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
};

export default function PricingPage() {
    const [prices, setPrices] = React.useState(mockPricingByModality);

    const updatePrice = (id: string, modality: "luring" | "daring" | "hybrid", value: number) => {
        setPrices(prices.map(p => p.id === id ? { ...p, [modality]: value } : p));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Pricing by Modality</h1>
                    <p className="text-gray-500 dark:text-gray-400">Set different pricing tiers for Luring, Daring, and Hybrid sessions</p>
                </div>
                <button className="bg-violet-500 text-white px-6 py-3 rounded-full font-bold hover:bg-violet-600 transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-amber-600" />
                        <span className="font-bold">Luring</span>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-700">{formatCurrency(prices.reduce((sum, p) => sum + p.luring, 0) / prices.length)}</p>
                    <p className="text-xs text-amber-600 mt-1">Avg. price per program</p>
                </div>
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Wifi className="h-5 w-5 text-blue-600" />
                        <span className="font-bold">Daring</span>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-700">{formatCurrency(prices.reduce((sum, p) => sum + p.daring, 0) / prices.length)}</p>
                    <p className="text-xs text-blue-600 mt-1">Avg. price per program</p>
                </div>
                <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <Shuffle className="h-5 w-5 text-purple-600" />
                        <span className="font-bold">Hybrid</span>
                    </div>
                    <p className="text-2xl font-extrabold text-purple-700">{formatCurrency(prices.reduce((sum, p) => sum + p.hybrid, 0) / prices.length)}</p>
                    <p className="text-xs text-purple-600 mt-1">Avg. price per program</p>
                </div>
            </div>

            {/* Pricing Table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <th className="text-left p-5 font-bold text-sm">Program</th>
                            <th className="text-center p-5 font-bold text-sm">
                                <div className="flex items-center justify-center gap-2">
                                    <MapPin className="h-4 w-4 text-amber-500" />
                                    Luring
                                </div>
                            </th>
                            <th className="text-center p-5 font-bold text-sm">
                                <div className="flex items-center justify-center gap-2">
                                    <Wifi className="h-4 w-4 text-blue-500" />
                                    Daring
                                </div>
                            </th>
                            <th className="text-center p-5 font-bold text-sm">
                                <div className="flex items-center justify-center gap-2">
                                    <Shuffle className="h-4 w-4 text-purple-500" />
                                    Hybrid
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {prices.map((program, index) => (
                            <tr key={program.id} className={index !== prices.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}>
                                <td className="p-5">
                                    <span className="font-semibold">{program.programName}</span>
                                </td>
                                <td className="p-5">
                                    <div className="relative max-w-[180px] mx-auto">
                                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={program.luring}
                                            onChange={(e) => updatePrice(program.id, "luring", parseInt(e.target.value) || 0)}
                                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 text-right font-mono text-sm focus:border-amber-500 outline-none"
                                        />
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="relative max-w-[180px] mx-auto">
                                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={program.daring}
                                            onChange={(e) => updatePrice(program.id, "daring", parseInt(e.target.value) || 0)}
                                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-right font-mono text-sm focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="relative max-w-[180px] mx-auto">
                                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={program.hybrid}
                                            onChange={(e) => updatePrice(program.id, "hybrid", parseInt(e.target.value) || 0)}
                                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 text-right font-mono text-sm focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                <h3 className="font-bold mb-4">Pricing Notes</h3>
                <div className="space-y-2 text-sm text-gray-500">
                    <p>• <strong>Luring</strong> pricing typically higher due to venue, instructor presence, and materials costs</p>
                    <p>• <strong>Daring</strong> pricing lower due to reduced overhead and scalability benefits</p>
                    <p>• <strong>Hybrid</strong> pricing balanced between both modes based on session mix</p>
                </div>
            </div>
        </div>
    );
}
