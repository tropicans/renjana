"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search, MapPin, Edit, Trash2, QrCode, Users } from "lucide-react";

// Mock locations data
const mockLocations = [
    { id: "loc-1", name: "Ruang Training A", building: "Gedung Utama", floor: "Lantai 2", capacity: 30, gpsLat: -6.2088, gpsLng: 106.8456, qrCode: "LOC-001", status: "active" },
    { id: "loc-2", name: "Aula Serbaguna", building: "Gedung Utama", floor: "Lantai 3", capacity: 100, gpsLat: -6.2090, gpsLng: 106.8458, qrCode: "LOC-002", status: "active" },
    { id: "loc-3", name: "Ruang Meeting B", building: "Gedung Annexe", floor: "Lantai 1", capacity: 15, gpsLat: -6.2092, gpsLng: 106.8460, qrCode: "LOC-003", status: "active" },
    { id: "loc-4", name: "Ruang Workshop", building: "Gedung Pelatihan", floor: "Lantai 1", capacity: 40, gpsLat: -6.2085, gpsLng: 106.8450, qrCode: "LOC-004", status: "inactive" },
];

export default function LocationsPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [showQRModal, setShowQRModal] = React.useState<string | null>(null);

    const filteredLocations = mockLocations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.building.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeLocations = mockLocations.filter(l => l.status === "active").length;
    const totalCapacity = mockLocations.reduce((sum, l) => sum + l.capacity, 0);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Locations</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage training venues for LURING sessions</p>
                </div>
                <Link href="/admin/locations/new" className="bg-red-500 text-white px-6 py-3 rounded-full font-bold hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20">
                    <Plus className="h-4 w-4" />
                    Add Location
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Locations</p>
                            <p className="text-2xl font-extrabold">{mockLocations.length}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Locations</p>
                            <p className="text-2xl font-extrabold">{activeLocations}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Capacity</p>
                            <p className="text-2xl font-extrabold">{totalCapacity}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-red-500 outline-none transition-all"
                />
            </div>

            {/* Locations Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredLocations.map((location) => (
                    <div key={location.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 hover:border-amber-500/50 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{location.name}</h3>
                                    <p className="text-sm text-gray-500">{location.building} • {location.floor}</p>
                                </div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${location.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                }`}>
                                {location.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-400">Capacity</p>
                                <p className="font-bold">{location.capacity} pax</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">QR Code</p>
                                <p className="font-mono text-sm">{location.qrCode}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400">GPS Coordinates</p>
                                <p className="font-mono text-sm">{location.gpsLat}, {location.gpsLng}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowQRModal(location.id)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <QrCode className="h-4 w-4" />
                                View QR
                            </button>
                            <button className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-red-500/50 transition-all">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQRModal(null)}>
                    <div className="bg-white dark:bg-[#1a242f] rounded-2xl p-8 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-center">QR Code</h3>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                            <div className="text-center">
                                <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                                <p className="mt-4 font-mono text-lg">{mockLocations.find(l => l.id === showQRModal)?.qrCode}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 text-center mb-4">
                            Learners scan this QR code to check-in for LURING sessions at this location.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQRModal(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold"
                            >
                                Close
                            </button>
                            <button className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-semibold">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
