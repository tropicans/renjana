"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Save, Video, BookOpen, Radio, HelpCircle, FileText, MapPin, Wifi, Shuffle } from "lucide-react";

const activityTypes = [
    { value: "video", label: "Video", icon: Video, color: "bg-blue-500" },
    { value: "reading", label: "Reading", icon: BookOpen, color: "bg-green-500" },
    { value: "live-session", label: "Live Session", icon: Radio, color: "bg-purple-500" },
    { value: "quiz", label: "Quiz", icon: HelpCircle, color: "bg-orange-500" },
    { value: "assignment", label: "Assignment", icon: FileText, color: "bg-red-500" },
];

const modalityTypes = [
    { value: "LURING", label: "Luring (Offline)", icon: MapPin, color: "bg-amber-500", description: "Tatap muka fisik dengan evidence GPS/QR" },
    { value: "DARING", label: "Daring (Online)", icon: Wifi, color: "bg-blue-500", description: "Virtual via platform dengan auto-attendance" },
    { value: "HYBRID", label: "Hybrid", icon: Shuffle, color: "bg-purple-500", description: "Kombinasi luring & daring dengan flexible rules" },
];

const mockLocations = [
    { id: "loc-1", name: "Ruang Training A - Gedung Utama" },
    { id: "loc-2", name: "Aula Serbaguna - Lantai 3" },
    { id: "loc-3", name: "Ruang Meeting B - Gedung Annexe" },
];

export default function NewActivityTemplatePage() {
    const [selectedType, setSelectedType] = React.useState("video");
    const [selectedModality, setSelectedModality] = React.useState("DARING");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Activity template created successfully!");
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/activities"
                    className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-500/50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">New Activity Template</h1>
                    <p className="text-gray-500 dark:text-gray-400">Create a reusable activity template</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Activity Type Selection */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">Activity Type</h2>
                    <div className="grid gap-3 sm:grid-cols-5">
                        {activityTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setSelectedType(type.value)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${selectedType === type.value
                                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                        : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className={`h-10 w-10 rounded-xl ${type.color} flex items-center justify-center`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-sm">{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Training Modality Selection */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">Training Modality</h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {modalityTypes.map((modality) => {
                            const Icon = modality.icon;
                            return (
                                <button
                                    key={modality.value}
                                    type="button"
                                    onClick={() => setSelectedModality(modality.value)}
                                    className={`p-5 rounded-xl border-2 transition-all text-left ${selectedModality === modality.value
                                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                        : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`h-10 w-10 rounded-xl ${modality.color} flex items-center justify-center`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-bold">{modality.label}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{modality.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Modality Configuration */}
                {selectedModality === "LURING" && (
                    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-amber-600" />
                            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">Luring Configuration</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Location *</label>
                                <select required className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 focus:border-amber-500 outline-none transition-all">
                                    <option value="">Select location</option>
                                    {mockLocations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Max Participants</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 30"
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-gray-900 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Evidence Required</label>
                            <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-white dark:bg-gray-900 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                    <span className="text-sm">QR Code</span>
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-white dark:bg-gray-900 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                                    <span className="text-sm">GPS Location</span>
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-white dark:bg-gray-900 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded" />
                                    <span className="text-sm">Photo</span>
                                </label>
                                <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200 bg-white dark:bg-gray-900 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded" />
                                    <span className="text-sm">Signature</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {selectedModality === "DARING" && (
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <Wifi className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200">Daring Configuration</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Platform</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none transition-all">
                                    <option value="zoom">Zoom</option>
                                    <option value="meet">Google Meet</option>
                                    <option value="teams">Microsoft Teams</option>
                                    <option value="webex">Webex</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Session Type</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none transition-all">
                                    <option value="live">Live Session</option>
                                    <option value="recorded">Recorded Video</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Meeting URL</label>
                                <input
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Min. Watch Time (%)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 80"
                                    defaultValue={80}
                                    className="w-full px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="autoAttendance" defaultChecked className="w-4 h-4 rounded" />
                            <label htmlFor="autoAttendance" className="text-sm">Auto-track attendance from platform</label>
                        </div>
                    </div>
                )}

                {selectedModality === "HYBRID" && (
                    <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <Shuffle className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">Hybrid Configuration</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Completion Rule</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 focus:border-purple-500 outline-none transition-all">
                                    <option value="all">All sessions required</option>
                                    <option value="percentage">Percentage based</option>
                                    <option value="either">Either luring OR daring</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Min. Completion (%)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 75"
                                    defaultValue={75}
                                    className="w-full px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 focus:border-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="rounded-xl border border-purple-200 bg-white dark:bg-gray-900 p-4 space-y-3">
                            <p className="font-semibold text-sm">Session Mix</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Luring Sessions</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 3"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 outline-none transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Daring Sessions</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 5"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-purple-500 outline-none transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="flexAttendance" defaultChecked className="w-4 h-4 rounded" />
                            <label htmlFor="flexAttendance" className="text-sm">Allow flexible attendance (learner chooses mode per session)</label>
                        </div>
                    </div>
                )}

                {/* Basic Information */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">Basic Information</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Template Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Introduction to Mediation"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Category</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all">
                                <option value="">Select category</option>
                                <option value="core">Core Content</option>
                                <option value="practice">Practice</option>
                                <option value="assessment">Assessment</option>
                                <option value="supplementary">Supplementary</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Description *</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Describe the activity objectives and expected outcomes..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all resize-none"
                        />
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Estimated Duration</label>
                            <input
                                type="text"
                                placeholder="e.g., 30 minutes"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Points</label>
                            <input
                                type="number"
                                placeholder="e.g., 100"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Passing Score (%)</label>
                            <input
                                type="number"
                                placeholder="e.g., 70"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Configuration - Type specific */}
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                    <h2 className="text-xl font-bold">Content Configuration</h2>

                    {selectedType === "video" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Video URL</label>
                                <input
                                    type="url"
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="autoplay" className="w-4 h-4 rounded" />
                                <label htmlFor="autoplay" className="text-sm">Enable autoplay</label>
                            </div>
                        </div>
                    )}

                    {selectedType === "reading" && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Reading Content / PDF URL</label>
                            <input
                                type="url"
                                placeholder="Link to PDF or document..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                            />
                        </div>
                    )}

                    {selectedType === "live-session" && (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500">
                            <p>💡 Live session configuration is handled in the <strong>Training Modality</strong> section above.</p>
                        </div>
                    )}

                    {selectedType === "quiz" && (
                        <div className="space-y-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Number of Questions</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 10"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Time Limit (minutes)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 30"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="shuffle" className="w-4 h-4 rounded" />
                                <label htmlFor="shuffle" className="text-sm">Shuffle questions</label>
                            </div>
                        </div>
                    )}

                    {selectedType === "assignment" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Assignment Instructions</label>
                                <textarea
                                    rows={4}
                                    placeholder="Provide detailed instructions for the assignment..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Submission Type</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-red-500 outline-none transition-all">
                                    <option value="file">File Upload</option>
                                    <option value="text">Text Entry</option>
                                    <option value="url">URL Link</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Link
                        href="/admin/activities"
                        className="flex-1 px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 font-bold text-center hover:border-red-500/50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-red-500 text-white px-6 py-4 rounded-full font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                        <Save className="h-5 w-5" />
                        Create Template
                    </button>
                </div>
            </form>
        </div>
    );
}
