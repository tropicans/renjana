import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Mail,
    Calendar,
    TrendingUp,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
} from "lucide-react";

// Mock learner data
const mockLearner = {
    id: "learner-1",
    name: "Andi Wijaya",
    email: "andi.wijaya@email.com",
    cohort: "Batch 2026-A",
    program: "Mediator Certification Program",
    enrolledDate: "Dec 1, 2025",
    progress: 85,
    status: "on-track",
    activitiesCompleted: 12,
    activitiesTotal: 15,
    evidenceSubmitted: 8,
    lastActivity: "2 hours ago",
};

const mockActivityTimeline = [
    {
        id: 1,
        title: "Completed Module 3: Legal Framework",
        type: "completion",
        date: "Jan 5, 2026",
        icon: CheckCircle,
    },
    {
        id: 2,
        title: "Submitted evidence for Case Study",
        type: "evidence",
        date: "Jan 4, 2026",
        icon: FileText,
    },
    {
        id: 3,
        title: "Started Module 4: Negotiation Skills",
        type: "start",
        date: "Jan 3, 2026",
        icon: Clock,
    },
    {
        id: 4,
        title: "Received feedback on Assignment 2",
        type: "feedback",
        date: "Jan 2, 2026",
        icon: MessageSquare,
    },
];

export default function LearnerDetailPage() {
    return (
        <div className="space-y-6">
            {/* Back button */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/instructor/learners">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Learners
                </Link>
            </Button>

            {/* Learner Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                        {mockLearner.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{mockLearner.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Mail className="h-4 w-4" />
                            <span>{mockLearner.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>Enrolled: {mockLearner.enrolledDate}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Send Message</Button>
                    <Button>Give Feedback</Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold">{mockLearner.progress}%</p>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${mockLearner.progress}%` }}
                        />
                    </div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Activities</p>
                    <p className="text-2xl font-bold mt-1">
                        {mockLearner.activitiesCompleted}/{mockLearner.activitiesTotal}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Completed</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Evidence</p>
                    <p className="text-2xl font-bold mt-1">{mockLearner.evidenceSubmitted}</p>
                    <p className="text-xs text-muted-foreground mt-1">Submitted</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Last Activity</p>
                    <p className="text-lg font-semibold mt-1">{mockLearner.lastActivity}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mockLearner.cohort}</p>
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Activity Timeline</h2>
                <div className="space-y-4">
                    {mockActivityTimeline.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                            <div key={activity.id} className="flex gap-4">
                                <div className="relative flex flex-col items-center">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-card">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    {index < mockActivityTimeline.length - 1 && (
                                        <div className="absolute top-10 h-full w-px bg-border" />
                                    )}
                                </div>
                                <div className="flex-1 pb-8">
                                    <p className="font-medium">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
