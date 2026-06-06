# Roadmap: Renjana LMS Milestone v3.0

## Overview

This roadmap defines the phases required to audit and verify the existing flows for every role (ADMIN, INSTRUCTOR, MANAGER, FINANCE, LEARNER) to check whether any bugs or issues exist, and resolve them.

## Phases

- [x] **Phase 1: Instructor Stats & Scoping** - Secure and scope evidence statistics and listings for instructors. (completed v1.0)
- [x] **Phase 2: Database-Backed Evidence Feedback** - Implement grading, review, and saving feedback for learner evidence. (completed v1.0)
- [x] **Phase 3: Test Suite Recovery** - Fix failing tests in document review and registration submit rules. (completed v1.0)
- [x] **Phase 4: Landing Page Intro & Basic Learner Info** - Add learning introduction/methods to the landing page, and show basic learner stats & evidence feedback on the dashboard. (completed v2.0)
- [x] **Phase 5: Learner Dashboard Visual Progress & Timeline** - Implement the "Continue Learning Card" and an interactive progress timeline/milestone track. (completed v2.0)
- [x] **Phase 6: Learner Dashboard Trends & Automated Insights** - Add learning trend graphs (Recharts) and dynamic automated/motivational insights. (completed v2.0)
- [ ] **Phase 7: Admin Portal Flow Audit** - Audit and fix bugs in ADMIN portal event configs, class assignments, and registration flows.
- [ ] **Phase 8: Instructor Portal Flow Audit** - Audit and fix bugs in INSTRUCTOR portal scoped evidence views and metrics.
- [ ] **Phase 9: Manager Portal Flow Audit** - Audit and fix bugs in MANAGER portal metrics cards and learning charts.
- [ ] **Phase 10: Finance Portal Flow Audit** - Audit and fix bugs in FINANCE portal invoices list, payments status, and review flows.
- [ ] **Phase 11: Learner Portal Flow Audit** - Audit and fix bugs in LEARNER portal catalog, quizzes, timeline, and registration flows.

## Phase Details

### Phase 7: Admin Portal Flow Audit
- **Requirements**: AUDIT-01
- **Success Criteria**:
  1. Admin portal displays all events and class groups without crashes.
  2. Reviewing a registration transitions states cleanly.
  3. Assigning class groups works successfully with correct instructorship mappings.

### Phase 8: Instructor Portal Flow Audit
- **Requirements**: AUDIT-02
- **Success Criteria**:
  1. Instructor stats count matches actual database records.
  2. Feedback submissions list displays correct pending and graded states.
  3. Ratings and comments update the database securely and show up on the learner dashboard.

### Phase 9: Manager Portal Flow Audit
- **Requirements**: AUDIT-03
- **Success Criteria**:
  1. Manager dashboard displays aggregate analytics cards correctly.
  2. Charts and lists filter data without leaking unauthorized tenant information.

### Phase 10: Finance Portal Flow Audit
- **Requirements**: AUDIT-04
- **Success Criteria**:
  1. Finance list displays all transaction status codes cleanly.
  2. Payment approval/rejection updates payment status in the database and triggers proper enrollment sync.

### Phase 11: Learner Portal Flow Audit
- **Requirements**: AUDIT-05
- **Success Criteria**:
  1. Learners can view the course catalog and start registrations.
  2. Course reader displays lesson material download and mark-as-complete triggers correctly.
  3. Learner dashboard displays Continue Learning Card and visual progress timeline without console errors.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Instructor Stats & Scoping | 1/1 | Completed | 2026-06-06 |
| 2. Database-Backed Evidence Feedback | 1/1 | Completed | 2026-06-06 |
| 3. Test Suite Recovery | 1/1 | Completed | 2026-06-06 |
| 4. Landing Page Intro & Basic Learner Info | 1/1 | Completed | 2026-06-06 |
| 5. Learner Dashboard Visual Progress & Timeline | 1/1 | Completed | 2026-06-06 |
| 6. Learner Dashboard Trends & Automated Insights | 1/1 | Completed | 2026-06-06 |
| 7. Admin Portal Flow Audit | 0/1 | Not Started | — |
| 8. Instructor Portal Flow Audit | 0/1 | Not Started | — |
| 9. Manager Portal Flow Audit | 0/1 | Not Started | — |
| 10. Finance Portal Flow Audit | 0/1 | Not Started | — |
| 11. Learner Portal Flow Audit | 0/1 | Not Started | — |

---
*Roadmap defined: 2026-06-07*
*Last updated: 2026-06-07 after v3.0 definition*
