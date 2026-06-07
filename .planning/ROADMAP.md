# Roadmap: Renjana LMS Milestone v5.0

## Overview

This roadmap defines the phases required to audit and fix core platform features, including course/event registration and checkout, GPS-based attendance validation, evidence upload and instructor grading, landscape A4 certificate generation, and NextAuth session redirects / middleware route gating.

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
- [x] **Phase 12: Public Pages & Header Localization Audit/Fix** - Audit and fix dynamic localization/translations in headers, catalog, and public pages. (completed v4.0)
- [x] **Phase 13: Learner Dashboard Localization Audit/Fix** - Audit and resolve mixed-language strings in the Learner dashboard modules, timeline, stats cards, and charts. (completed v4.0)
- [x] **Phase 14: Registration & Checkout Flow Audit** - Audit and fix course/event registration and checkout flows. (completed v5.0)
- [ ] **Phase 15: GPS Attendance Validation Audit** - Verify and fix GPS-based attendance check-in coordinates validation logic.
- [ ] **Phase 16: Evidence Upload & Instructor Grading Audit** - Test and resolve evidence upload and instructor grading capabilities.
- [ ] **Phase 17: Certificate PDF Generation Audit** - Test and resolve landscape A4 certificate PDF generation and download triggers.
- [ ] **Phase 18: NextAuth & Middleware Gating Audit** - Verify and fix NextAuth session redirects and middleware RBAC route gating.

## Phase Details

### Phase 14: Registration & Checkout Flow Audit
- **Requirements**: AUDIT-06
- **Success Criteria**:
  1. Learners can successfully register for an event/course from the catalog.
  2. Checkout triggers the correct payment process (Midtrans integration) and payment status updates properly on webhook received.
  3. No errors occur when verifying or updating payment records.

### Phase 15: GPS Attendance Validation Audit
- **Requirements**: AUDIT-07
- **Success Criteria**:
  1. GPS check-in correctly calculates distance to the event's configured coordinates.
  2. Users within the permitted radius can check in successfully.
  3. Users outside the radius are blocked with a clear, localized message.

### Phase 16: Evidence Upload & Instructor Grading Audit
- **Requirements**: AUDIT-08
- **Success Criteria**:
  1. Learners can upload files as evidence for modules/lessons.
  2. Instructors can view all submitted evidence scoped to their classes.
  3. Instructors can grade and add feedback, which is correctly persisted in the database.

### Phase 17: Certificate PDF Generation Audit
- **Requirements**: AUDIT-09
- **Success Criteria**:
  1. Certificates are generated in landscape A4 format using jsPDF.
  2. Users can download their certificates from the portal upon meeting the completion criteria.
  3. The PDF generation runs without rendering errors.

### Phase 18: NextAuth & Middleware Gating Audit
- **Requirements**: AUDIT-10
- **Success Criteria**:
  1. All protected routes in `/admin`, `/instructor`, `/manager`, `/finance`, and `/dashboard` are correctly protected by middleware/auth.
  2. Role-based redirects function correctly for authenticated users depending on their role.
  3. API routes independently enforce role-gating policies.

## Progress

**Execution Order:**
Phases execute in numeric order: 14 → 15 → 16 → 17 → 18

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
| 12. Public Pages & Header Localization Audit/Fix | 1/1 | Completed | 2026-06-07 |
| 13. Learner Dashboard Localization Audit/Fix | 1/1 | Completed | 2026-06-07 |
| 14. Registration & Checkout Flow Audit | 1/1 | Completed | 2026-06-07 |
| 15. GPS Attendance Validation Audit | 0/1 | Not Started | — |
| 16. Evidence Upload & Instructor Grading Audit | 0/1 | Not Started | — |
| 17. Certificate PDF Generation Audit | 0/1 | Not Started | — |
| 18. NextAuth & Middleware Gating Audit | 0/1 | Not Started | — |

---
*Roadmap defined: 2026-06-07*
*Last updated: 2026-06-07 after v5.0 definition*
