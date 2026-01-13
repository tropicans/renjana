"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

export default function NewProgramPage() {
    const [modules, setModules] = React.useState([
        { id: 1, title: "", description: "" }
    ]);

    const addModule = () => {
        setModules([...modules, { id: Date.now(), title: "", description: "" }]);
    };

    const removeModule = (id: number) => {
        if (modules.length > 1) {
            setModules(modules.filter(m => m.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Program created successfully!");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/programs"
                    className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500/50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">New Program</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create a new training program</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">Basic Information</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Program Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Mediator Certification Program"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Category *</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all">
                                <option value="">Select category</option>
                                <option value="certification">Certification</option>
                                <option value="workshop">Workshop</option>
                                <option value="corporate">Corporate Training</option>
                                <option value="fundamentals">Fundamentals</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Description *</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Describe the program objectives and outcomes..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Duration</label>
                            <input
                                type="text"
                                placeholder="e.g., 12 weeks"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Price (IDR)</label>
                            <input
                                type="number"
                                placeholder="e.g., 8500000"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Max Participants</label>
                            <input
                                type="number"
                                placeholder="e.g., 50"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Modules */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Modules</h2>
                        <button
                            type="button"
                            onClick={addModule}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-red-500/50 transition-all flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Module
                        </button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((module, index) => (
                            <div key={module.id} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Module {index + 1}</span>
                                    {modules.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeModule(module.id)}
                                            className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                        type="text"
                                        placeholder="Module title"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Module description"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/programs"
                        className="flex-1 px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-center hover:border-red-500/50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-red-500 text-white px-6 py-4 rounded-full font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                        <Save className="h-5 w-5" />
                        Create Program
                    </button>
                </div>
            </form>
        </div>
    );
}
