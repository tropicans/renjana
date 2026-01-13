"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, QrCode, Camera, CheckCircle, AlertCircle, Navigation } from "lucide-react";

// Mock check-in data
const mockSession = {
    id: "act-3",
    title: "Attend Live Session: Negotiation Techniques",
    program: "Advanced Mediation Skills",
    location: "Ruang Training A - Gedung Utama, Lantai 2",
    date: "Jan 12, 2026",
    time: "09:00 - 12:00 WIB",
    instructor: "Dr. Sarah Wijaya",
    requiresQR: true,
    requiresGPS: true,
    requiresPhoto: false,
};

export default function CheckInPage() {
    const [step, setStep] = React.useState<"initial" | "gps" | "qr" | "success">("initial");
    const [gpsStatus, setGpsStatus] = React.useState<"pending" | "success" | "error">("pending");

    const handleGetLocation = () => {
        setStep("gps");
        // Simulate GPS check
        setTimeout(() => {
            setGpsStatus("success");
        }, 2000);
    };

    const handleScanQR = () => {
        setStep("qr");
    };

    const handleCompleteCheckIn = () => {
        setStep("success");
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/actions"
                    className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-primary/50 transition-all"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Check-In</h1>
                    <p className="text-gray-500 dark:text-gray-400">LURING Session Attendance</p>
                </div>
            </div>

            {/* Session Info */}
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 p-6">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">{mockSession.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{mockSession.program}</p>
                        <div className="mt-3 space-y-1 text-sm">
                            <p><span className="text-gray-500">📍</span> {mockSession.location}</p>
                            <p><span className="text-gray-500">📅</span> {mockSession.date}</p>
                            <p><span className="text-gray-500">⏰</span> {mockSession.time}</p>
                            <p><span className="text-gray-500">👤</span> {mockSession.instructor}</p>
                        </div>
                    </div>
                </div>
            </div>

            {step === "initial" && (
                <div className="space-y-4">
                    {/* Requirements */}
                    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6">
                        <h3 className="font-bold mb-4">Check-in Requirements</h3>
                        <div className="space-y-3">
                            {mockSession.requiresGPS && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Navigation className="h-5 w-5 text-blue-500" />
                                    <span>GPS Location Verification</span>
                                </div>
                            )}
                            {mockSession.requiresQR && (
                                <div className="flex items-center gap-3 text-sm">
                                    <QrCode className="h-5 w-5 text-purple-500" />
                                    <span>QR Code Scan</span>
                                </div>
                            )}
                            {mockSession.requiresPhoto && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Camera className="h-5 w-5 text-green-500" />
                                    <span>Photo Evidence</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleGetLocation}
                        className="w-full bg-primary text-white py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <Navigation className="h-5 w-5" />
                        Start Check-In
                    </button>
                </div>
            )}

            {step === "gps" && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 text-center">
                    {gpsStatus === "pending" && (
                        <>
                            <div className="h-24 w-24 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 animate-pulse">
                                <Navigation className="h-12 w-12 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-xl mb-2">Verifying Location...</h3>
                            <p className="text-gray-500">Please wait while we verify your GPS location</p>
                        </>
                    )}

                    {gpsStatus === "success" && (
                        <>
                            <div className="h-24 w-24 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-green-600">Location Verified!</h3>
                            <p className="text-gray-500 mb-6">You are within the allowed area</p>
                            <button
                                onClick={handleScanQR}
                                className="w-full bg-primary text-white py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <QrCode className="h-5 w-5" />
                                Scan QR Code
                            </button>
                        </>
                    )}

                    {gpsStatus === "error" && (
                        <>
                            <div className="h-24 w-24 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-red-600">Location Not Verified</h3>
                            <p className="text-gray-500 mb-6">You are not within the allowed area. Please move closer to the venue.</p>
                            <button
                                onClick={handleGetLocation}
                                className="w-full border border-gray-200 dark:border-gray-700 py-4 rounded-full font-bold hover:border-primary/50 transition-all"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            )}

            {step === "qr" && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-8 text-center">
                    <div className="h-64 w-64 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                        <div className="text-center">
                            <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-sm text-gray-500">Camera viewfinder</p>
                        </div>
                    </div>
                    <h3 className="font-bold text-xl mb-2">Scan QR Code</h3>
                    <p className="text-gray-500 mb-6">Point your camera at the QR code displayed at the venue entrance</p>
                    <button
                        onClick={handleCompleteCheckIn}
                        className="w-full bg-primary text-white py-4 rounded-full font-bold hover:opacity-90 transition-all"
                    >
                        Complete Check-In (Demo)
                    </button>
                </div>
            )}

            {step === "success" && (
                <div className="rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-8 text-center">
                    <div className="h-24 w-24 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="font-bold text-2xl mb-2 text-green-700 dark:text-green-400">Check-In Successful!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Your attendance has been recorded</p>
                    <div className="text-sm text-gray-500 mb-6">
                        <p>Time: {new Date().toLocaleTimeString()}</p>
                        <p>Location: Verified ✓</p>
                        <p>QR Code: Verified ✓</p>
                    </div>
                    <Link
                        href="/dashboard/actions"
                        className="inline-block w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-all"
                    >
                        Back to Actions
                    </Link>
                </div>
            )}
        </div>
    );
}
