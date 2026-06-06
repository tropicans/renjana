# Roadmap: Renjana LMS Milestone v2.0

## Overview

This roadmap defines the phases required to implement introductory educational content on the landing page and build a comprehensive visual Learner Dashboard with progress tracking, timeline, and automated insights.

## Phases

- [x] **Phase 1: Instructor Stats & Scoping** - Secure and scope evidence statistics and listings for instructors. (completed v1.0)
- [x] **Phase 2: Database-Backed Evidence Feedback** - Implement grading, review, and saving feedback for learner evidence. (completed v1.0)
- [x] **Phase 3: Test Suite Recovery** - Fix failing tests in document review and registration submit rules. (completed v1.0)
- [ ] **Phase 4: Landing Page Intro & Basic Learner Info** - Add learning introduction/methods to the landing page, and show basic learner stats & evidence feedback on the dashboard.
- [ ] **Phase 5: Learner Dashboard Visual Progress & Timeline** - Implement the "Continue Learning Card" and an interactive progress timeline/milestone track.
- [ ] **Phase 6: Learner Dashboard Trends & Automated Insights** - Add learning trend graphs (Recharts) and dynamic automated/motivational insights.

## Phase Details

### Phase 1: Instructor Stats & Scoping
*Completed in Milestone v1.0 on 2026-06-06*
- **Requirements**: STAT-01, STAT-02
- **Plans**: 1 plan (01-01)

### Phase 2: Database-Backed Evidence Feedback
*Completed in Milestone v1.0 on 2026-06-06*
- **Requirements**: FEEDB-01, FEEDB-02, FEEDB-03, FEEDB-04, FEEDB-05
- **Plans**: 1 plan (02-01)

### Phase 3: Test Suite Recovery
*Completed in Milestone v1.0 on 2026-06-06*
- **Requirements**: TEST-01, TEST-02
- **Plans**: 1 plan (03-01)

### Phase 4: Landing Page Intro & Basic Learner Info

**Goal**: Add landing page content about learning methods, LMS/LXP, and display learner profile stats and graded evidence comments on the dashboard.
**Depends on**: Nothing
**Requirements**: INTRO-01, INTRO-02, INTRO-03, LEARN-01, LEARN-06
**Success Criteria**:
1. Landing page displays the introductory sections for digital/flexible learning, LMS/LXP concepts, and definitions of Mandiri, Hybrid, Online, Offline learning.
2. Learner dashboard displays the user's avatar, name, email, and correct summary stats (registrations count, completed courses, approved events, total hours learned).
3. Learner dashboard displays a section showing graded evidence submissions with corresponding instructor ratings and comments.

**Plans**: 1 plan (04-01)

### Phase 5: Learner Dashboard Visual Progress & Timeline

**Goal**: Build visual progress timeline and a prominent "Continue Learning Card" with resume course action.
**Depends on**: Phase 4
**Requirements**: LEARN-02, LEARN-03
**Success Criteria**:
1. If the learner has an active enrollment, a prominent "Continue Learning Card" is rendered showing the active course title, progress bar, current module/lesson status, and a "Resume Course" button linking to the course reader.
2. An interactive visual timeline or milestone track is rendered on the learner dashboard, representing modules and lessons in the course, showing which are completed, in-progress, or locked.

**Plans**: 1 plan (05-01)

### Phase 6: Learner Dashboard Trends & Automated Insights

**Goal**: Implement activity trend charts and dynamic automated insights.
**Depends on**: Phase 5
**Requirements**: LEARN-04, LEARN-05
**Success Criteria**:
1. An activity trends chart is rendered on the learner dashboard using Recharts, showing weekly study time or progress over time.
2. The dashboard displays context-aware AI insights, such as motivational messages, study tips, or drop-off alerts (e.g. "40% of learners stop at Module 3") based on mock or database-backed trends.

**Plans**: 1 plan (06-01)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Instructor Stats & Scoping | 1/1 | Completed | 2026-06-06 |
| 2. Database-Backed Evidence Feedback | 1/1 | Completed | 2026-06-06 |
| 3. Test Suite Recovery | 1/1 | Completed | 2026-06-06 |
| 4. Landing Page Intro & Basic Learner Info | 0/1 | Not Started | — |
| 5. Learner Dashboard Visual Progress & Timeline | 0/1 | Not Started | — |
| 6. Learner Dashboard Trends & Automated Insights | 0/1 | Not Started | — |

---
*Roadmap defined: 2026-06-06*
*Last updated: 2026-06-06 after v2.0 definition*
