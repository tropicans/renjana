# Requirements: Renjana LMS Phase 3 Improvements

**Defined:** 2026-06-06
**Core Value:** Ensure instructors can securely grade learner evidence and view scoped metrics while maintaining 100% test suite reliability.

## v1 Requirements

Requirements for current milestone.

### Instructor Stats

- [ ] **STAT-01**: Retrieve actual database count for `totalEvidences` in `/api/instructor/stats` (instructors dashboard) scoped to the instructor's learners.
- [ ] **STAT-02**: Enforce secure access controls on `/api/evidence` to return only evidence uploaded by learners scoped to the instructor's courses/class groups.

### Learner Submissions & Instructor Feedback

- [ ] **FEEDB-01**: Create `PUT /api/evidence/[id]` endpoint to allow instructors to grade evidence submissions (1-5 star rating and comment feedback) and persist results in the database.
- [ ] **FEEDB-02**: Replace mock data list in `src/app/instructor/feedback/page.tsx` with live evidence list fetched from `/api/evidence`.
- [ ] **FEEDB-03**: Display submission details (learner name, title, program, upload date, file attachment link) in the feedback list and review panel.
- [ ] **FEEDB-04**: Wire up the "Submit Feedback" form on the instructor page to invoke the `PUT /api/evidence/[id]` endpoint and reload the query.
- [ ] **FEEDB-05**: Filter the pending submissions list to only display evidence uploads that have not yet been graded.

### Test Suite Reliability

- [ ] **TEST-01**: Fix `tests/registration-document-review-boundaries.test.ts` document review boundary assertions to align with correct error responses.
- [ ] **TEST-02**: Fix `tests/registration-submit-rules.test.ts` registration submit status assertions to match the returned 409 status code.

## v2 Requirements

Deferred to future milestones.

### Learner Feedback View

- **FEEDB-v2-01**: Let learners view the grading/comments on their uploaded evidence from the learner dashboard.
- **FEEDB-v2-02**: Notify learners when an instructor grades their submission.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom assignment workflows | Complex features, standard lessons evidence uploads are sufficient for current needs |
| Automated grading algorithms | Out of scope, manual grading by instructors is preferred |

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAT-01 | Phase 1 | Pending |
| STAT-02 | Phase 1 | Pending |
| FEEDB-01 | Phase 2 | Pending |
| FEEDB-02 | Phase 2 | Pending |
| FEEDB-03 | Phase 2 | Pending |
| FEEDB-04 | Phase 2 | Pending |
| FEEDB-05 | Phase 2 | Pending |
| TEST-01 | Phase 3 | Pending |
| TEST-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-06*
*Last updated: 2026-06-06 after initial definition*
