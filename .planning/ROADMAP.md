# Roadmap: Renjana LMS Milestone v4.0

## Overview

This roadmap defines the phases required to audit and resolve mixed language strings across public pages, headers, and the learner dashboard, ensuring a 100% consistent English or Indonesian user experience.

## Phases

- [x] **Phase 1: Instructor Stats & Scoping** - Secure and scope evidence statistics and listings for instructors. (completed v1.0)
- [x] **Phase 2: Database-Backed Evidence Feedback** - Implement grading, review, and saving feedback for learner evidence. (completed v1.0)
- [x] **Phase 3: Test Suite Recovery** - Fix failing tests in document review and registration submit rules. (completed v1.0)
- [x] **Phase 4: Landing Page Intro & Basic Learner Info** - Add learning introduction/methods to the landing page, and show basic learner stats & evidence feedback on the dashboard. (completed v2.0)
- [x] **Phase 5: Learner Dashboard Visual Progress & Timeline** - Implement the "Continue Learning Card" and an interactive progress timeline/milestone track. (completed v2.0)
- [x] **Phase 6: Learner Dashboard Trends & Automated Insights** - Add learning trend graphs (Recharts) and dynamic automated/motivational insights. (completed v2.0)
- [x] **Phase 7: Admin Portal Flow Audit** - Audit and fix bugs in ADMIN portal event configs, class assignments, and registration flows. (completed v3.0)
- [x] **Phase 8: Instructor Portal Flow Audit** - Audit and fix bugs in INSTRUCTOR portal scoped evidence views and metrics. (completed v3.0)
- [x] **Phase 9: Manager Portal Flow Audit** - Audit and fix bugs in MANAGER portal metrics cards and learning charts. (completed v3.0)
- [x] **Phase 10: Finance Portal Flow Audit** - Audit and fix bugs in FINANCE portal invoices list, payments status, and review flows. (completed v3.0)
- [x] **Phase 11: Learner Portal Flow Audit** - Audit and fix bugs in LEARNER portal catalog, quizzes, timeline, and registration flows. (completed v3.0)
- [ ] **Phase 12: Public Pages & Header Localization Audit/Fix** - Audit and fix dynamic localization/translations in headers, catalog, and public pages.
- [ ] **Phase 13: Learner Dashboard Localization Audit/Fix** - Audit and resolve mixed-language strings in the Learner dashboard modules, timeline, stats cards, and charts.

## Phase Details

### Phase 12: Public Pages & Header Localization Audit/Fix
- **Requirements**: LANG-01
- **Success Criteria**:
  1. Header navigation links dynamically update when language is switched.
  2. Public pages (e.g. Catalog, Event Detail) are free of mixed English and Indonesian text.
  3. Dynamic translations are retrieved via `useLanguage` rather than hardcoded text.

### Phase 13: Learner Dashboard Localization Audit/Fix
- **Requirements**: LANG-02
- **Success Criteria**:
  1. Continue Learning banner displays localized text (e.g., date formatting, progress labels).
  2. Progress timeline/subway map nodes and buttons are fully localized.
  3. Stats cards and Recharts tooltips/legends use matching localized labels.
  4. Locale switches cleanly on the learner dashboard without page refresh issues or unlocalized fallbacks.

## Progress

**Execution Order:**
Phases execute in numeric order: 12 → 13

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Instructor Stats & Scoping | 1/1 | Completed | 2026-06-06 |
| 2. Database-Backed Evidence Feedback | 1/1 | Completed | 2026-06-06 |
| 3. Test Suite Recovery | 1/1 | Completed | 2026-06-06 |
| 4. Landing Page Intro & Basic Learner Info | 1/1 | Completed | 2026-06-07 |
| 5. Learner Dashboard Visual Progress & Timeline | 1/1 | Completed | 2026-06-07 |
| 6. Learner Dashboard Trends & Automated Insights | 1/1 | Completed | 2026-06-07 |
| 7. Admin Portal Flow Audit | 1/1 | Completed | 2026-06-07 |
| 8. Instructor Portal Flow Audit | 1/1 | Completed | 2026-06-07 |
| 9. Manager Portal Flow Audit | 1/1 | Completed | 2026-06-07 |
| 10. Finance Portal Flow Audit | 1/1 | Completed | 2026-06-07 |
| 11. Learner Portal Flow Audit | 1/1 | Completed | 2026-06-07 |
| 12. Public Pages & Header Localization Audit/Fix | 0/1 | Not Started | — |
| 13. Learner Dashboard Localization Audit/Fix | 0/1 | Not Started | — |

---
*Roadmap defined: 2026-06-07*
*Last updated: 2026-06-07 after v4.0 definition*
