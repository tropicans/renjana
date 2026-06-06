# Architecture Research

**Domain:** Landing Page & Learner Dashboard
**Researched:** 2026-06-06
**Confidence:** HIGH

## Proposed Architecture

This update does not require database migrations. It leverages existing models: `User`, `Enrollment`, `Progress`, `Lesson`, `Module`, `Evidence`, `Registration`.

### 1. Data Flow & Models

- **Landing Page**: Static configuration and translations in `src/lib/i18n/translations.ts` and `src/app/page.tsx` rendering.
- **Learner Stats**: Fetch enrollment, completed count, and progress records via Prisma.
- **Timeline Progress**: Map `Course` -> `Module` -> `Lesson` -> `Progress` to determine which items are complete or in progress.
- **Continue Learning Card**: Find the first active `Enrollment` (status `ACTIVE`), and find the first incomplete lesson in the course.
- **Evidence Feedback**: Query `Evidence` where `userId = user.id` and `rating` or `comment` is not null.

### 2. API Endpoints

- **GET `/api/dashboard/stats`**:
  - Update to also return the last active course, last lesson details, progress, and historical weekly study log/trends if needed.
- **GET `/api/learner/feedbacks`** (or fetch inline):
  - Return the graded evidence with instructor comments for the logged-in user.

### 3. Frontend Components

- **Landing Page**:
  - Modify `src/app/page.tsx` (or public home component) to add the learning introduction.
- **Learner Dashboard**:
  - Update `src/app/dashboard/page.tsx`.
  - Update `@/components/learner/dashboard-visuals.tsx` (add `ProgressTimeline`, `ContinueCard`, `TrendsChart`).

## Sources

- Next.js App Router route gating
- Prisma schema definitions
