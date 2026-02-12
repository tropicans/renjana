"use client";

import React from "react";
import { User, Bell, Shield, Moon, Mail, Save } from "lucide-react";

export default function SettingsPage() {
    const [darkMode, setDarkMode] = React.useState(false);
    const [emailNotifications, setEmailNotifications] = React.useState(true);
    const [pushNotifications, setPushNotifications] = React.useState(true);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account preferences</p>
            </div>

            {/* Profile Settings */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-bold">Profile</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Full Name</label>
                        <input
                            type="text"
                            defaultValue="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            defaultValue="john.doe@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Phone</label>
                        <input
                            type="tel"
                            defaultValue="+62 812 3456 7890"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Organization</label>
                        <input
                            type="text"
                            defaultValue="PT Example Company"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold">Notifications</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-semibold">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEmailNotifications(!emailNotifications)}
                            className={`w-12 h-6 rounded-full transition-all ${emailNotifications ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all ${emailNotifications ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="font-semibold">Push Notifications</p>
                                <p className="text-sm text-gray-500">Receive push notifications</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPushNotifications(!pushNotifications)}
                            className={`w-12 h-6 rounded-full transition-all ${pushNotifications ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all ${pushNotifications ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                        <Moon className="h-5 w-5 text-violet-500" />
                    </div>
                    <h2 className="text-xl font-bold">Appearance</h2>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Moon className="h-5 w-5 text-gray-400" />
                        <div>
                            <p className="font-semibold">Dark Mode</p>
                            <p className="text-sm text-gray-500">Use dark theme</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-12 h-6 rounded-full transition-all ${darkMode ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                </div>
            </div>

            {/* Security Settings */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a242f] p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold">Security</h2>
                </div>

                <div className="space-y-4">
                    <button className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all">
                        <p className="font-semibold">Change Password</p>
                        <p className="text-sm text-gray-500">Update your password</p>
                    </button>
                    <button className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all">
                        <p className="font-semibold">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <button className="w-full bg-primary text-white py-4 rounded-full font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                <Save className="h-5 w-5" />
                Save Changes
            </button>
        </div>
    );
}
