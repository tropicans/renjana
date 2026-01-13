"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, MapPin } from "lucide-react";

export default function NewLocationPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Location created successfully!");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/locations"
                    className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500/50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">New Location</h1>
                    <p className="text-gray-500 dark:text-gray-400">Add a new venue for LURING sessions</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-bold">Location Details</h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Location Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Ruang Training A"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Building *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Gedung Utama"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Floor</label>
                            <input
                                type="text"
                                placeholder="e.g., Lantai 2"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Capacity</label>
                            <input
                                type="number"
                                placeholder="e.g., 30"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Status</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Full Address</label>
                        <textarea
                            rows={3}
                            placeholder="Enter full address..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                {/* GPS Coordinates */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6 space-y-6">
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">GPS Configuration</h2>
                    <p className="text-sm text-amber-700 dark:text-amber-300">GPS coordinates are used to validate learner check-ins for LURING sessions.</p>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Latitude</label>
                            <input
                                type="text"
                                placeholder="e.g., -6.2088"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 focus:border-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Longitude</label>
                            <input
                                type="text"
                                placeholder="e.g., 106.8456"
                                className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 focus:border-amber-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Geofence Radius (meters)</label>
                        <input
                            type="number"
                            placeholder="e.g., 100"
                            defaultValue={100}
                            className="w-full max-w-xs px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 focus:border-amber-500 outline-none transition-all"
                        />
                        <p className="text-xs text-amber-600">Learners must be within this radius to check-in.</p>
                    </div>

                    <button type="button" className="px-4 py-2 rounded-xl border border-amber-300 bg-white dark:bg-gray-900 font-semibold text-sm hover:bg-amber-100 transition-all">
                        📍 Get Current Location
                    </button>
                </div>

                {/* QR Code */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">QR Code</h2>
                    <p className="text-sm text-gray-500">A unique QR code will be generated automatically for this location.</p>

                    <div className="flex items-center gap-4">
                        <div className="h-24 w-24 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Preview</span>
                        </div>
                        <div>
                            <p className="font-semibold">QR code will be generated after saving</p>
                            <p className="text-sm text-gray-500">Print and display at the location entrance</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/locations"
                        className="flex-1 px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-center hover:border-red-500/50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-red-500 text-white px-6 py-4 rounded-full font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                        <Save className="h-5 w-5" />
                        Create Location
                    </button>
                </div>
            </form>
        </div>
    );
}
