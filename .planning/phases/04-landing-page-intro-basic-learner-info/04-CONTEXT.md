# Phase 4: Landing Page Intro & Basic Learner Info - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Add learning introduction and definitions of methods to the landing page, and display user identity details, basic learning metrics, and graded evidence submissions with instructor ratings & comments on the learner dashboard.

</domain>

<decisions>
## Implementation Decisions

### User Identity Card
- **D-01:** Integrate a premium user profile card at the top of the Learner Dashboard (Header/Hero integration).
- **D-02:** The card should display the user's avatar (or colored circle with name initials), full name, email, and a styled role badge (`LEARNER`).

### Evidence Feedback Section
- **D-03:** Create a dedicated card list section titled "Ulasan & Feedback Tugas" on the Learner Dashboard page.
- **D-04:** This section will fetch and display the user's uploaded evidence files with status badges (Graded vs. Pending Review), star ratings (1-5), and the instructor's comment.

### Landing Page Intro
- **D-05:** Keep the current `LearningMethodsSection` text and structure as is, since it already covers the digital learning, LMS/LXP, and the 4 methods (Mandiri, Online, Offline, Hybrid).
- **D-06:** Apply premium Tailwind CSS v4 visual enhancements, such as smooth hover scale transitions, subtle borders, and glow shadows to the method cards.

### the agent's Discretion
- Exact sizing, colors, and layout spacing of the identity header card.
- Component layout of the evidence ulasan list.
- Exact glow shadow configurations for landing page method cards.

</decisions>

<specifics>
## Specific Ideas

- The User Identity Card should feel clean and integrated directly into the dashboard header, matching the global premium theme.
- Graded evidence entries should display the instructor's rating as a row of visual star icons for high-quality representation.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — Active and completed requirements list.
- `.planning/ROADMAP.md` — Project roadmap and phase mapping.
- `temp_req_utf8.txt` — Original source requirement specifications.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `fetchDashboardStats`, `fetchMyEnrollments`, `fetchMyRegistrations` in `src/features/client/api/learner.ts` (or equivalent client API wrapper) — for dashboard stats.
- `StatCard` in `src/components/dashboard/stat-card.tsx` — for high-level statistics rendering.
- `LearningMethodsSection` in `src/components/ui/learning-methods-section.tsx` — landing page methods section.

### Established Patterns
- Client-side data fetching using TanStack Query hooks.
- Lazy-loading client components with `dynamic(..., { ssr: false })` to prevent Recharts/browser API hydration mismatches.

### Integration Points
- `src/app/dashboard/page.tsx` — Learner portal home page.
- `src/app/page.tsx` — Public landing page.
- `src/app/api/dashboard/stats/route.ts` — Stats GET endpoint.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-landing-page-intro-basic-learner-info*
*Context gathered: 2026-06-06*
