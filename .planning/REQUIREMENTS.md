# Requirements: Renjana LMS Milestone v2.0

**Defined:** 2026-06-06
**Core Value:** Provide an engaging, informative landing page and a highly visual, data-rich learner experience on the dashboard to improve module completion and onboarding.

## Active Requirements (v2.0)

### Landing Page Introduction (INTRO)

- [ ] **INTRO-01**: Add introductory text on the landing page explaining the digital, independent, and flexible learning programs.
- [ ] **INTRO-02**: Add an introduction to the LMS and LXP concepts on the landing page.
- [ ] **INTRO-03**: Explain the 4 learning methods: Mandiri (self-paced), Hybrid, Online (Daring), and Offline (Luring) on the landing page.

### Learner Dashboard Enhancements (LEARN)

- [ ] **LEARN-01**: Display user profile details (avatar, full name, role) and high-level stats (Total Registrations, Completed Courses, Approved Events, Hours Learned) dynamically on the dashboard.
- [ ] **LEARN-02**: Build a visual progress timeline or milestone tracker representing active/completed courses and modules.
- [ ] **LEARN-03**: Create a prominent "Continue Learning Card" displaying the active course, module status, progress bar, and a reminder to resume.
- [ ] **LEARN-04**: Add learning trends/activity graphs (weekly study time or progress rate) using Recharts.
- [ ] **LEARN-05**: Implement automated insights (dynamic tips, drop-off warnings like "40% of users stop at Module 3", or motivational messages).
- [ ] **LEARN-06**: Display instructor grades and comments on the learner's uploaded evidence files inside the learner dashboard.

## Completed Requirements (v1.0)

- ✓ **STAT-01**: Retrieve actual database count for `totalEvidences` in `/api/instructor/stats`.
- ✓ **STAT-02**: Enforce secure access controls on `/api/evidence`.
- ✓ **FEEDB-01**: Create `PUT /api/evidence/[id]` endpoint to grade evidence submissions.
- ✓ **FEEDB-02**: Replace mock data list in instructor feedback page with live evidence list.
- ✓ **FEEDB-03**: Display submission details in the feedback list and review panel.
- ✓ **FEEDB-04**: Wire up the "Submit Feedback" form on the instructor page.
- ✓ **FEEDB-05**: Filter the pending submissions list to only display evidence uploads that have not yet been graded.
- ✓ **TEST-01**: Fix `tests/registration-document-review-boundaries.test.ts` document review boundary assertions.
- ✓ **TEST-02**: Fix `tests/registration-submit-rules.test.ts` registration submit status assertions.

## Future Requirements (v3.0)

- **ADMIN-v3-01**: Admin Dashboard: Trend charts per program, participant database and CSV/Excel downloads.
- **INST-v3-01**: Instructor Dashboard: Trend charts per program, update course modules capability.
- **REG-v3-01**: Webinar/PKPA/Mediator activity registration flows, participant list, attendance, and automated certificate generation.

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
| INTRO-01    | —     | Pending |
| INTRO-02    | —     | Pending |
| INTRO-03    | —     | Pending |
| LEARN-01    | —     | Pending |
| LEARN-02    | —     | Pending |
| LEARN-03    | —     | Pending |
| LEARN-04    | —     | Pending |
| LEARN-05    | —     | Pending |
| LEARN-06    | —     | Pending |

**Coverage:**

- Active requirements: 9 total
- Mapped to phases: 0
- Unmapped: 9

---
*Requirements defined: 2026-06-06*
*Last updated: 2026-06-06 after v2.0 definition*
