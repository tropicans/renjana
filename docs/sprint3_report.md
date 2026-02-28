# Sprint 3 Report — Learning Engine (Progress & Tracker)
**Project:** Renjana LMS  
**Sprint:** 3 of 6  
**Date:** 28 Februari 2026  
**Status:** ✅ Completed  

---

## Ringkasan

Sprint 3 mengimplementasikan learning engine yang melacak progress per lesson secara real-time ke database. Halaman `/learn/[courseId]` sekarang fully functional dengan data asli.

---

## Deliverables

### 1. Progress API Routes

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| PUT | `/api/progress` | Mark lesson complete → auto-recalculate completion % |
| GET | `/api/progress/[enrollmentId]` | Get all progress records for an enrollment |

**Key Features:**
- Auto-recalculates `completionPercentage` on enrollment
- Auto-sets enrollment status to `COMPLETED` at 100%
- Validates enrollment ownership (user can only update own progress)

### 2. API Client Updates

Added to `src/lib/api.ts`:
- `fetchProgress(enrollmentId)` — get progress data
- `markLessonComplete(enrollmentId, lessonId)` — mark lesson done

### 3. Learn Page Rewrite

**File:** `src/app/learn/[courseId]/page.tsx`

| Feature | Before | After |
|---------|--------|-------|
| Course data | `getCourseById()` mock | `useQuery` → `/api/courses/:id` |
| Enrollment | `getUserEnrollment()` mock | `useQuery` → `/api/enrollments` |
| Progress | `activityProgress[]` in-memory | `useQuery` → `/api/progress/:id` |
| Complete | `updateActivityProgress()` mock | `useMutation` → `PUT /api/progress` |
| Refresh | Manual state update | React Query `invalidateQueries` |

**UI Features (preserved from Phase 1):**
- Sidebar with collapsible modules + lesson list
- Green checkmarks for completed lessons
- Progress bar with real-time percentage
- Content viewer with type icons (Video/Quiz/Reading/Assignment)
- "Tandai Selesai" button with loading spinner
- Auto-advance to next lesson
- Completion celebration toast at 100%
- Award badge when course is complete

---

## File Changes

| Action | File |
|--------|------|
| NEW | `src/app/api/progress/route.ts` |
| NEW | `src/app/api/progress/[enrollmentId]/route.ts` |
| MODIFIED | `src/lib/api.ts` (added progress functions) |
| MODIFIED | `src/app/learn/[courseId]/page.tsx` (full rewrite) |

---

## Build Result
```
✓ Compiled successfully
Exit code: 0
```

---

*Sprint 3 selesai. Lanjut ke Sprint 4: Attendance & Evidence System.*
