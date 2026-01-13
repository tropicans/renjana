"use client";

import React from "react";
import { Calendar, Check, X, Users, Clock, Search, Download, MapPin, Wifi, QrCode } from "lucide-react";

// Mock session data with modality
const mockSessions = [
    {
        id: "session-1",
        title: "Live Session: Case Study Workshop",
        date: "Jan 6, 2026",
        time: "10:00 AM - 12:00 PM",
        cohort: "Batch 2026-A",
        totalLearners: 45,
        presentCount: 42,
        modality: "LURING" as const,
        location: "Ruang Training A",
        qrCode: "LOC-001-S1",
        learners: [
            { id: "l1", name: "Andi Wijaya", present: true, checkinTime: "09:52 AM", checkinMethod: "QR" },
            { id: "l2", name: "Budi Santoso", present: false, checkinTime: null, checkinMethod: null },
            { id: "l3", name: "Citra Dewi", present: true, checkinTime: "09:48 AM", checkinMethod: "GPS" },
            { id: "l4", name: "Dian Pratama", present: true, checkinTime: "09:55 AM", checkinMethod: "QR" },
            { id: "l5", name: "Eka Putra", present: false, checkinTime: null, checkinMethod: null },
        ],
    },
    {
        id: "session-2",
        title: "Module 3: Legal Framework Discussion",
        date: "Jan 4, 2026",
        time: "2:00 PM - 4:00 PM",
        cohort: "Batch 2025-D",
        totalLearners: 32,
        presentCount: 30,
        modality: "DARING" as const,
        platform: "Zoom",
        meetingUrl: "https://zoom.us/j/123456",
        learners: [],
    },
    {
        id: "session-3",
        title: "Hybrid Workshop: Negotiation Skills",
        date: "Jan 8, 2026",
        time: "9:00 AM - 1:00 PM",
        cohort: "Batch 2026-A",
        totalLearners: 45,
        presentCount: 40,
        modality: "HYBRID" as const,
        location: "Aula Serbaguna",
        platform: "Zoom",
        learners: [],
    },
];

const modalityConfig = {
    LURING: { label: "Luring", icon: MapPin, class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    DARING: { label: "Daring", icon: Wifi, class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    HYBRID: { label: "Hybrid", icon: MapPin, class: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

export default function AttendancePage() {
    const [selectedSession, setSelectedSession] = React.useState(mockSessions[0]);
    const [attendance, setAttendance] = React.useState<Record<string, boolean>>(
        Object.fromEntries(selectedSession.learners.map((l) => [l.id, l.present]))
    );
    const [modalityFilter, setModalityFilter] = React.useState<string | null>(null);
    const [showQRModal, setShowQRModal] = React.useState(false);

    const toggleAttendance = (learnerId: string) => {
        setAttendance((prev) => ({ ...prev, [learnerId]: !prev[learnerId] }));
    };

    const markAllPresent = () => {
        setAttendance(Object.fromEntries(selectedSession.learners.map((l) => [l.id, true])));
    };

    const markAllAbsent = () => {
        setAttendance(Object.fromEntries(selectedSession.learners.map((l) => [l.id, false])));
    };

    const presentCount = Object.values(attendance).filter(Boolean).length;

    const filteredSessions = modalityFilter
        ? mockSessions.filter(s => s.modality === modalityFilter)
        : mockSessions;

    const ModalityIcon = modalityConfig[selectedSession.modality].icon;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Attendance</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage session attendance for your cohorts</p>
                </div>
                <div className="flex gap-3">
                    {selectedSession.modality === "LURING" && (
                        <button
                            onClick={() => setShowQRModal(true)}
                            className="bg-amber-500 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-amber-600 transition-all flex items-center gap-2"
                        >
                            <QrCode className="h-4 w-4" />
                            Show QR Code
                        </button>
                    )}
                    <button className="bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-full font-semibold text-sm hover:border-emerald-500/50 transition-all flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Modality Filter */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setModalityFilter(null)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${modalityFilter === null
                            ? "bg-emerald-500 text-white"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50"
                        }`}
                >
                    All Sessions
                </button>
                <button
                    onClick={() => setModalityFilter("LURING")}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${modalityFilter === "LURING"
                            ? "bg-amber-500 text-white"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-amber-500/50"
                        }`}
                >
                    <MapPin className="h-4 w-4" />
                    Luring
                </button>
                <button
                    onClick={() => setModalityFilter("DARING")}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${modalityFilter === "DARING"
                            ? "bg-blue-500 text-white"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-blue-500/50"
                        }`}
                >
                    <Wifi className="h-4 w-4" />
                    Daring
                </button>
                <button
                    onClick={() => setModalityFilter("HYBRID")}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${modalityFilter === "HYBRID"
                            ? "bg-purple-500 text-white"
                            : "bg-white dark:bg-[#1a242f] border border-gray-200 dark:border-gray-700 hover:border-purple-500/50"
                        }`}
                >
                    <MapPin className="h-4 w-4" />
                    Hybrid
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Session List */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Sessions</h2>
                    <div className="space-y-3">
                        {filteredSessions.map((session) => {
                            const SessionIcon = modalityConfig[session.modality].icon;
                            return (
                                <div
                                    key={session.id}
                                    onClick={() => setSelectedSession(session)}
                                    className={`cursor-pointer rounded-2xl border bg-white dark:bg-[#1a242f] p-5 transition-all hover:border-emerald-500/50 ${selectedSession.id === session.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-100 dark:border-gray-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${modalityConfig[session.modality].class}`}>
                                            <SessionIcon className="h-3 w-3" />
                                            {modalityConfig[session.modality].label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold">{session.title}</h3>
                                    <div className="mt-3 space-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{session.date}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{session.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>{session.presentCount}/{session.totalLearners} present</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Attendance Management */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="font-bold text-lg">{selectedSession.title}</h2>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${modalityConfig[selectedSession.modality].class}`}>
                                    <ModalityIcon className="h-3 w-3" />
                                    {modalityConfig[selectedSession.modality].label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400">{selectedSession.cohort} • {selectedSession.date}</p>
                            {selectedSession.modality === "LURING" && "location" in selectedSession && (
                                <p className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {selectedSession.location}
                                </p>
                            )}
                            {(selectedSession.modality === "DARING" || selectedSession.modality === "HYBRID") && "platform" in selectedSession && (
                                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                    <Wifi className="h-3.5 w-3.5" />
                                    {selectedSession.platform}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-extrabold">{presentCount}/{selectedSession.learners.length}</p>
                            <p className="text-xs text-gray-400">Present</p>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    <div className="flex gap-3">
                        <button onClick={markAllPresent} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-emerald-500/50 transition-all flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Mark All Present
                        </button>
                        <button onClick={markAllAbsent} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm hover:border-red-500/50 transition-all flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Mark All Absent
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search learners..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a242f] focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>

                    {/* Attendance List */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] overflow-hidden">
                        {selectedSession.learners.length > 0 ? selectedSession.learners.map((learner, index) => (
                            <div
                                key={learner.id}
                                className={`flex items-center justify-between p-5 ${index !== selectedSession.learners.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-lg">
                                        {learner.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="font-semibold">{learner.name}</span>
                                        {learner.checkinTime && (
                                            <p className="text-xs text-gray-400">
                                                Checked in: {learner.checkinTime} via {learner.checkinMethod}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleAttendance(learner.id)}
                                    className={`flex h-10 w-28 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all ${attendance[learner.id]
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        }`}
                                >
                                    {attendance[learner.id] ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Present
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-4 w-4" />
                                            Absent
                                        </>
                                    )}
                                </button>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-gray-500">
                                <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                <p>No learners data for this session</p>
                            </div>
                        )}
                    </div>

                    <button className="w-full bg-emerald-500 text-white py-4 rounded-full font-bold hover:bg-emerald-600 transition-all">
                        Save Attendance
                    </button>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && selectedSession.modality === "LURING" && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQRModal(false)}>
                    <div className="bg-white dark:bg-[#1a242f] rounded-2xl p-8 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-2 text-center">Session QR Code</h3>
                        <p className="text-sm text-gray-500 text-center mb-4">{selectedSession.title}</p>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                            <div className="text-center">
                                <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                                <p className="mt-4 font-mono text-lg">{"qrCode" in selectedSession ? selectedSession.qrCode : "N/A"}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 text-center mb-4">
                            Display this QR code for learners to scan when they arrive.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold"
                            >
                                Close
                            </button>
                            <button className="flex-1 bg-amber-500 text-white px-4 py-3 rounded-xl font-semibold">
                                Print QR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
