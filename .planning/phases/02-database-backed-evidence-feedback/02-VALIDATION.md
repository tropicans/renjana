---
phase: 2
slug: database-backed-evidence-feedback
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tests/evidence-grading.test.ts` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/evidence-grading.test.ts`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | FEEDB-01 | — | N/A | db-push | `npx prisma generate` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | FEEDB-02 | — | Validasi input rating 1-5, requireRole INSTRUCTOR/ADMIN | integration | `npx vitest run tests/evidence-grading.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | FEEDB-03 | — | GET default hanya mengembalikan rating null | integration | `npx vitest run tests/evidence-grading.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | FEEDB-04 | — | React Query cache invalidation setelah rating diupdate | manual | See manual instructions | ✅ | ⬜ pending |
| 02-01-05 | 01 | 1 | FEEDB-05 | — | Tautan membuka fileUrl di tab baru | manual | See manual instructions | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/evidence-grading.test.ts` — stubs for API PUT and GET validation tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rendering visual rating form & comments | FEEDB-04 | Visual rendering and browser interaction | 1. Login as instructor.<br>2. Go to /instructor/feedback.<br>3. Check if list loads pending feedback.<br>4. Select item, rate star, comment, submit.<br>5. Check if item disappears and form resets. |
| Open document in new tab | FEEDB-05 | Browser tab opening behavior | 1. Select a pending feedback item.<br>2. Click "Lihat Dokumen".<br>3. Verify that the file opens in a new tab (`target="_blank"`). |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
