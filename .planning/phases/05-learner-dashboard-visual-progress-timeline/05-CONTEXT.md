# Phase 5: Learner Dashboard Visual Progress & Timeline - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

If the learner has an active enrollment, render a prominent "Continue Learning Card" showing the active course title, progress bar, current module/lesson status, and a "Resume Course" button linking to the course reader. Render an interactive visual timeline or milestone track on the learner dashboard, representing modules and lessons in the course, showing which are completed, in-progress, or locked.

</domain>

<decisions>
## Implementation Decisions

### Continue Learning Card Detail & Layout
- **D-01 (Next Incomplete Lesson Detail):** The card must display the exact title, activity type icon (e.g. Video, Quiz), and estimated duration of the next incomplete lesson in the course sequence.
- **D-02 (Friendly/Motivational Reminder):** Integrate a motivational reminder displaying the date of the last completed lesson (e.g. "Terakhir belajar pada [Date]. Yuk lanjutkan belajar!").
- **D-03 (Premium Split Layout):** Left side displays the course name, next lesson detail, and the motivational resume reminder; right side displays the circular progress chart and the "Resume Course" button.
- **D-04 (Last Active Date Sourcing):** The "last active" date is sourced by retrieving the latest `completedAt` timestamp from the learner's `Progress` records for that enrollment, falling back to `enrolledAt` of the `Enrollment` model if no progress exists.

### Visual Progress Timeline Structure
- **D-05 (Vertical Node Connector Map):** Render a vertical connector map representing modules and lessons as connected nodes (similar style to the course reader page sidebar).
- **D-06 (Sequential Status Flow):** Mark the first incomplete lesson as "Up Next/In Progress" (highlighted), lessons before it as "Completed" (green checkmark), and subsequent lessons as "Pending/Locked" (grayed out).
- **D-07 (Detailed Nodes):** Display the activity type icon, lesson title, and duration (e.g. "15 min") next to each lesson node.
- **D-08 (Collapsible Modules):** Keep modules collapsible. Automatically expand only the current active module (containing the "Up Next" lesson) by default, and allow the user to click module headers to toggle other modules.

### the agent's Discretion
- Visual styles, exact Tailwind styling (border glow, card rounding, shadows), colors, and hover animations.
- Icons and font sizes for statuses, durations, and labels.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — Active and completed requirements list.
- `.planning/ROADMAP.md` — Project roadmap and phase mapping.

### Core Views
- `src/app/dashboard/page.tsx` — Current Learner Dashboard view.
- `src/app/learn/[courseId]/page.tsx` — Course reader view containing the timeline structure to mirror.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `fetchCourseById` in `src/features/client/api/learner.ts` — Fetches the course detail including its modules and lessons.
- `fetchProgress` in `src/features/client/api/learner.ts` — Fetches the progress percentage and individual lesson completed statuses.
- `ProgressChart` in `src/components/learner/dashboard-visuals.tsx` — Renders circular progress on the dashboard.

### Established Patterns
- Client-side data fetching using TanStack Query hooks.
- Glassmorphic card styling matching the global premium theme.

### Integration Points
- `src/app/dashboard/page.tsx` — Integrates the updated Continue Learning Card and the Vertical Node Timeline.

</code_context>

<specifics>
## Specific Ideas

- The vertical node connector map should reuse the design aesthetics from the course reader sidebar to feel consistent and native to the app, with smooth transitions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-learner-dashboard-visual-progress-timeline*
*Context gathered: 2026-06-07*
