---
phase: 5
slug: learner-dashboard-visual-progress-timeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-07
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2.4 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tests/dashboard-timeline.test.ts` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/dashboard-timeline.test.ts`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | LEARN-03 | — | N/A | unit | `npx vitest run tests/dashboard-timeline.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 2 | LEARN-02 | — | N/A | unit | `npx vitest run tests/dashboard-timeline.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/dashboard-timeline.test.ts` — stubs and unit tests for LEARN-02 and LEARN-03.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Continue Learning Card UI | LEARN-03 | Visual layout alignment and split formatting | Log in as learner, verify card visual structure, progress chart, and details. |
| Collapsible Module Timeline | LEARN-02 | Click/interactive toggle behavior | Click module headers in the dashboard timeline, verify accordion collapse/expand. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
