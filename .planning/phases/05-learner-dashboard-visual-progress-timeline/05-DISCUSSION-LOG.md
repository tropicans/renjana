# Phase 5: Learner Dashboard Visual Progress & Timeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-07
**Phase:** 05-Learner Dashboard Visual Progress & Timeline
**Areas discussed:** Continue Learning Card Detail & Layout, Visual Progress Timeline Structure

---

## Continue Learning Card Detail & Layout

### Q1: What detailed learning status should be featured on the Continue Learning Card?
| Option | Description | Selected |
|--------|-------------|----------|
| Next Incomplete Lesson | Show the exact next lesson title, type icon (e.g. Video, Quiz), and estimated duration. | ✓ |
| Module Progress Summary | Show the current active module title and a summary like "Module 2: 3 of 5 lessons completed". | |
| Course Progress Only | Keep it minimal, showing only the course title and the completion percentage. | |

**User's choice:** Next Incomplete Lesson

### Q2: What style of resume reminder should be integrated into the card?
| Option | Description | Selected |
|--------|-------------|----------|
| Friendly/Motivational Reminder | e.g. "Terakhir belajar [Date]. Selesaikan materi ini untuk terus melangkah!" or similar friendly push. | ✓ |
| Timeline/Schedule Alert | e.g. "Jadwal kelas ini berakhir dalam X hari. Ayo selesaikan!" if the linked event has an end date. | |
| Minimalist | No reminder text, just the "Resume Course" button. | |

**User's choice:** Friendly/Motivational Reminder

### Q3: What visual layout structure should we use for the Continue Learning Card?
| Option | Description | Selected |
|--------|-------------|----------|
| Premium Split Layout | Left side shows course/lesson detail & status/reminder; right side has circular progress and the "Resume Course" CTA. | ✓ |
| Course Thumbnail Backdrop | Full-width card with the course thumbnail as a background (dark glassmorphic overlay) for a rich, streaming-portal feel. | |
| Compact Horizontal Bar | A sleek, thin banner to minimize vertical space usage. | |

**User's choice:** Premium Split Layout

### Q4: How should the "last active" date be determined for the resume reminder?
| Option | Description | Selected |
|--------|-------------|----------|
| Last Completed Lesson Date | Retrieve the latest 'completedAt' timestamp from the learner's progress table (and fall back to 'enrolledAt' if no lessons are completed yet). | ✓ |
| Enrollment Date Only | Always display the date they enrolled in the course (e.g. "Terdaftar sejak [Date]. Yuk lanjutkan belajar!"). | |
| Static Message | Do not display a date, just show a generic motivational message. | |

**User's choice:** Last Completed Lesson Date

---

## Visual Progress Timeline Structure

### Q1: What visual timeline layout should we use to represent the course modules and lessons?
| Option | Description | Selected |
|--------|-------------|----------|
| Vertical Node Connector Map | A vertical subway-style map where modules and lessons are represented as connected nodes (matching the course reader's sidebar look). | ✓ |
| Collapsible Accordion Modules | Collapsible accordion cards for each module, expanding to reveal a list/checklist of lessons. | |
| Horizontal Milestone Carousel | A horizontal track showing modules as major milestones that the user can click to see details. | |

**User's choice:** Vertical Node Connector Map

### Q2: How should lesson statuses be represented sequentially in the timeline?
| Option | Description | Selected |
|--------|-------------|----------|
| Sequential Flow | Mark the first incomplete lesson in the course order as "Up Next/In Progress" (highlighted), lessons before it as "Completed" (green check), and lessons after it as "Pending/Locked" (grayed out). | ✓ |
| Simple Status Map | Only show two statuses: "Completed" vs. "Not Completed". Do not highlight a specific "Up Next" lesson. | |

**User's choice:** Sequential Flow

### Q3: What detail level should each lesson node in the timeline display?
| Option | Description | Selected |
|--------|-------------|----------|
| Detailed Nodes | Show the activity type icon (e.g. Video, Quiz), lesson title, and duration (e.g. "15 min") for each lesson. | ✓ |
| Minimalist Nodes | Show only the status dot/icon and the lesson title. | |

**User's choice:** Detailed Nodes

### Q4: How should the timeline handle large numbers of modules/lessons?
| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible Modules | Keep modules collapsible. Automatically expand only the current active module (the one with the "Up Next" lesson) by default, and let the user click other modules to toggle them. | ✓ |
| Scrollable Container | Always expand all modules but wrap the timeline in a fixed-height, scrollable container (e.g., max-h-[400px] overflow-y-auto). | |
| Full Height List | Always render all modules and lessons fully expanded, showing the complete list. | |

**User's choice:** Collapsible Modules

---

## the agent's Discretion

Visual styles, colors, border glow highlights, spacing, padding, transition micro-animations, and icon indicators.

## Deferred Ideas

None — discussion stayed within phase scope.
