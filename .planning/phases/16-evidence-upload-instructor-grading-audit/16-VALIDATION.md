---
phase: 16
slug: evidence-upload-instructor-grading-audit
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-07
---

# Phase 16 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tests/evidence-grading.test.ts tests/evidence-gated-file.test.ts` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/evidence-grading.test.ts tests/evidence-gated-file.test.ts`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 16-01-T1 | 01 | 1 | AUDIT-08 | — | Storage path resolves to a non-public folder | integration | `npx vitest run tests/evidence-grading.test.ts` | ✅ W0 | ⬜ pending |
| 16-01-T2 | 01 | 1 | AUDIT-08 | UX-002 | Serves file content via gated authentication API | integration | `npx vitest run tests/evidence-gated-file.test.ts` | ❌ W0 | ⬜ pending |
| 16-02-T1 | 01 | 2 | AUDIT-08 | — | Deletes ungraded evidence and cleans up local storage file | integration | `npx vitest run tests/evidence-grading.test.ts` | ✅ W0 | ⬜ pending |
| 16-02-T2 | 01 | 2 | AUDIT-08 | — | Dashboard displays correct CTAs, empty state, and list data | manual | — | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/evidence-gated-file.test.ts` — stubs for secure file download testing

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Evidence Upload UI interaction | AUDIT-08 | Involves browser Drag-and-Drop file interaction | Open `/dashboard/evidence` as LEARNER, drag-and-drop a PDF/image file, submit, and confirm it uploads and displays in history. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-07
