# Requirements: Renjana LMS Milestone v3.0

**Defined:** 2026-06-07
**Core Value:** Verify and audit all role portal flows (ADMIN, INSTRUCTOR, MANAGER, FINANCE, LEARNER) to identify, debug, and fix any functional, access gating, visual, or performance issues.

## Active Requirements (v3.0)

### Role Portal Flow Audit (AUDIT)

- [ ] **AUDIT-01**: Audit and fix any bugs/issues in the ADMIN portal flows (events, class groups, registration reviews, and configurations).
- [ ] **AUDIT-02**: Audit and fix any bugs/issues in the INSTRUCTOR portal flows (scoped evidence viewing, grading feedback, and instructor dashboard metrics).
- [ ] **AUDIT-03**: Audit and fix any bugs/issues in the MANAGER portal flows (impact analysis, risk overview, metrics cards).
- [ ] **AUDIT-04**: Audit and fix any bugs/issues in the FINANCE portal flows (registration invoices list, details view, payment status updates).
- [ ] **AUDIT-05**: Audit and fix any bugs/issues in the LEARNER portal flows (events browsing, registration steps, learning portal, quizzes, and visual progress timeline).

## Completed Requirements

### v2.0 (Shipped: 2026-06-07)
- ✓ **INTRO-01**: Add introductory text on the landing page explaining the digital, independent, and flexible learning programs.
- ✓ **INTRO-02**: Add an introduction to the LMS and LXP concepts on the landing page.
- ✓ **INTRO-03**: Explain the 4 learning methods: Mandiri (self-paced), Hybrid, Online (Daring), and Offline (Luring) on the landing page.
- ✓ **LEARN-01**: Display user profile details (avatar, full name, role) and high-level stats (Total Registrations, Completed Courses, Approved Events, Hours Learned) dynamically on the dashboard.
- ✓ **LEARN-02**: Build a visual progress timeline or milestone tracker representing active/completed courses and modules.
- ✓ **LEARN-03**: Create a prominent "Continue Learning Card" displaying the active course, module status, progress bar, and a reminder to resume.
- ✓ **LEARN-04**: Add learning trends/activity graphs (weekly study time or progress rate) using Recharts.
- ✓ **LEARN-05**: Implement automated insights (dynamic tips, drop-off warnings like "40% of users stop at Module 3", or motivational messages).
- ✓ **LEARN-06**: Display instructor grades and comments on the learner's uploaded evidence files inside the learner dashboard.

### v1.0 (Shipped: 2026-06-06)
- ✓ **STAT-01**: Retrieve actual database count for `totalEvidences` in `/api/instructor/stats`.
- ✓ **STAT-02**: Enforce secure access controls on `/api/evidence`.
- ✓ **FEEDB-01**: Create `PUT /api/evidence/[id]` endpoint to grade evidence submissions.
- ✓ **FEEDB-02**: Replace mock data list in instructor feedback page with live evidence list.
- ✓ **FEEDB-03**: Display submission details in the feedback list and review panel.
- ✓ **FEEDB-04**: Wire up the "Submit Feedback" form on the instructor page.
- ✓ **FEEDB-05**: Filter the pending submissions list to only display evidence uploads that have not yet been graded.
- ✓ **TEST-01**: Fix `tests/registration-document-review-boundaries.test.ts` document review boundary assertions.
- ✓ **TEST-02**: Fix `tests/registration-submit-rules.test.ts` registration submit status assertions.

## Future Requirements

- **ADMIN-v4-01**: Admin Dashboard: Trend charts per program, participant database and CSV/Excel downloads.
- **INST-v4-01**: Instructor Dashboard: Trend charts per program, update course modules capability.
- **REG-v4-01**: Webinar/PKPA/Mediator activity registration flows, participant list, attendance, and automated certificate generation.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom assignment workflows | Complex features, standard lessons evidence uploads are sufficient for current needs |
| Automated grading algorithms | Out of scope, manual grading by instructors is preferred |
| Learner-facing evidence upload UI | Deferred to future phases (learner evidence is currently verified via registrations and direct admin review) |

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIT-01    | Phase 7 | Pending |
| AUDIT-02    | Phase 8 | Pending |
| AUDIT-03    | Phase 9 | Pending |
| AUDIT-04    | Phase 10 | Pending |
| AUDIT-05    | Phase 11 | Pending |

**Coverage:**

- Active requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-07*
*Last updated: 2026-06-07 after v3.0 definition*
