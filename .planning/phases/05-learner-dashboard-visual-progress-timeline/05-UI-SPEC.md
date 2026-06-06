---
phase: 5
slug: learner-dashboard-visual-progress-timeline
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-07
---

# Phase 5 — UI Design Contract

> Visual and interaction contract for frontend phases.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (vanilla CSS + Tailwind v4 primitives) |
| Icon library | lucide-react |
| Font | Outfit / Inter (from global template) |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing |
| md | 16px | Default element spacing |
| lg | 24px | Section padding |
| xl | 32px | Layout gaps |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | Medium | 1.5 |
| Label | 12px | Bold | 1.25 |
| Heading | 20px / 24px | Extrabold | 1.2 |
| Display | 32px | Extrabold | 1.1 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | #f6f7f8 / #101922 | Page background |
| Secondary (30%) | #ffffff / #1a242f | Dashboard cards, timeline cards, sidebar |
| Accent (10%) | var(--color-primary) | Primary action buttons ("Resume Course"), active status indicators |
| Destructive | #ef4444 | Alerts and warnings |

Accent reserved for: Primary CTA buttons ("Resume Course") and active step highlights in the vertical timeline.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Resume Course |
| Empty state heading | Belum ada kelas aktif |
| Empty state body | Anda belum memiliki registrasi atau kelas aktif. Jelajahi batch dan event yang sedang dibuka lalu daftarkan diri Anda. |
| Error state | Gagal memuat detail pembelajaran. Silakan coba kembali. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not required |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
