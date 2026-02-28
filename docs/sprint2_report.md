# Sprint 2 Report — Core API & Frontend Integration
**Project:** Renjana LMS  
**Sprint:** 2 of 6  
**Date:** 28 Februari 2026  
**Status:** ✅ Completed  

---

## Ringkasan

Sprint 2 mengganti semua mock/hardcoded data di frontend dengan data real dari PostgreSQL melalui Next.js API routes. React Query ditambahkan untuk client-side caching.

---

## Deliverables

### 1. API Routes (6 Endpoint Baru)

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/api/courses` | Publik | List published courses + module/lesson count |
| GET | `/api/courses/[id]` | Publik | Course detail + modules + lessons |
| GET | `/api/enrollments` | Login | User's enrollments with course data |
| POST | `/api/enrollments` | Login | Enroll in a course |
| GET | `/api/dashboard/stats` | Login | Role-based stats (admin/learner/instructor/etc) |
| GET | `/api/admin/users` | Admin | List all users |
| POST | `/api/admin/users` | Admin | Create new user |
| PUT | `/api/admin/users/[id]` | Admin | Update user |
| DELETE | `/api/admin/users/[id]` | Admin | Deactivate user |

### 2. Auth Utilities
- `getServerUser()` — get authenticated user from session
- `requireAuth()` — returns 401 if not authenticated
- `requireRole(...roles)` — returns 403 if wrong role

**File:** `src/lib/auth-utils.ts`

### 3. API Client (Frontend)
- Typed fetch functions for all endpoints
- `fetchCourses()`, `fetchCourseById()`, `fetchMyEnrollments()`, `enrollInCourse()`
- `fetchDashboardStats()`, `fetchAdminUsers()`, `createAdminUser()`, etc.

**File:** `src/lib/api.ts`

### 4. React Query
- `@tanstack/react-query` installed
- `QueryClientProvider` added to `providers.tsx`
- 30s staleTime default for caching

### 5. Frontend Migration
| Page | Before | After |
|------|--------|-------|
| `/dashboard` | `getLearnerStats()` mock | `useQuery` → `/api/dashboard/stats` |
| `/dashboard` | `getUserEnrolledCourses()` mock | `useQuery` → `/api/enrollments` |
| `/admin` | Hardcoded `mockStats` | `useQuery` → `/api/dashboard/stats` |
| `/admin` | Hardcoded `mockRecentActivity` | `useQuery` → `/api/admin/users` |
| `/courses` | Import `courses` array | `useQuery` → `/api/courses` |

---

## File Changes

| Action | File | Keterangan |
|--------|------|------------|
| NEW | `src/lib/auth-utils.ts` | Auth helpers for API routes |
| NEW | `src/lib/api.ts` | Typed API client |
| NEW | `src/app/api/courses/route.ts` | Courses list API |
| NEW | `src/app/api/courses/[id]/route.ts` | Course detail API |
| NEW | `src/app/api/enrollments/route.ts` | Enrollments API |
| NEW | `src/app/api/dashboard/stats/route.ts` | Dashboard stats API |
| NEW | `src/app/api/admin/users/route.ts` | Admin users API |
| NEW | `src/app/api/admin/users/[id]/route.ts` | Admin user update/delete API |
| MODIFIED | `src/components/providers.tsx` | Added QueryClientProvider |
| MODIFIED | `src/app/dashboard/page.tsx` | React Query integration |
| MODIFIED | `src/app/admin/page.tsx` | React Query integration |
| MODIFIED | `src/app/courses/page.tsx` | React Query integration |
| MODIFIED | `package.json` | Added @tanstack/react-query |

---

## Build Result
```
✓ Compiled successfully
✓ Running TypeScript ...
✓ Checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Collecting build traces
✓ Finalizing page optimization
Exit code: 0
```

---

*Sprint 2 selesai. Lanjut ke Sprint 3: Learning Engine (Progress & Tracker).*
