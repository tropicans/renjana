# Phase 1: Instructor Stats & Scoping - Pattern Map

**Mapped:** 2026-06-06
**Files analyzed:** 2
**Analogs found:** 2 / 2

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/api/instructor/stats/route.ts` | controller | request-response | [learners/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/learners/route.ts) | exact |
| `src/app/api/evidence/route.ts` | controller | request-response | [learners/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/learners/route.ts) | exact |

---

## Pattern Assignments

### `src/app/api/instructor/stats/route.ts` (controller, request-response)

**Analog:** [learners/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/learners/route.ts)

**Imports Pattern** (from learners/route.ts lines 1-4):
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getInstructorScope } from "@/lib/instructor-scope";
```

**Auth and Scoping Pattern** (from learners/route.ts lines 7-28):
```typescript
export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role === "INSTRUCTOR") {
        const scope = await getInstructorScope(user!.id, user!.name);
        if (scope.enrollmentPairs.length === 0) {
            return NextResponse.json({
                enrollments: [],
                stats: {
                    totalLearners: 0,
                    activeEnrollments: 0,
                    completedEnrollments: 0,
                    avgCompletion: 0,
                },
            });
        }
```

**Testing / Verification Pattern** (from [instructor-scope.test.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/tests/instructor-scope.test.ts) lines 85-119):
```typescript
    it("returns zero evidence and scoped aggregates for instructor stats", async () => {
        mocks.requireAuth.mockResolvedValue({
            user: { id: "inst-1", role: "INSTRUCTOR", name: "Instructor One" },
            error: null,
        });
        mocks.getInstructorScope.mockResolvedValue({
            courseIds: ["course-1"],
            eventIds: ["event-1"],
            classGroupIds: ["group-1"],
            enrollmentPairs: [{ userId: "learner-1", courseId: "course-1" }],
        });
        mocks.prisma.enrollment.findMany.mockResolvedValue([
            {
                id: "enroll-1",
                userId: "learner-1",
                courseId: "course-1",
                status: "COMPLETED",
                completionPercentage: 100,
                enrolledAt: new Date("2025-01-01T00:00:00.000Z"),
                user: { fullName: "Learner One" },
                course: { id: "course-1", title: "Course One" },
            },
        ]);
        mocks.prisma.attendance.count.mockResolvedValue(4);

        const response = await statsGet();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.stats.totalCourses).toBe(1);
        expect(body.stats.totalEnrollments).toBe(1);
        expect(body.stats.completedEnrollments).toBe(1);
        expect(body.stats.totalAttendances).toBe(4);
        expect(body.stats.totalEvidences).toBe(0);
    });
```

---

### `src/app/api/evidence/route.ts` (controller, request-response)

**Analog:** [learners/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/learners/route.ts)

**Imports Pattern**:
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { getInstructorScope } from "@/lib/instructor-scope";
```

**Auth and Scoping / Early Short-circuit Pattern**:
To be integrated into `GET /api/evidence` for `INSTRUCTOR` role, ensuring it doesn't run database queries if they teach no classes (empty scope):
```typescript
    if (role === "INSTRUCTOR") {
        const scope = await getInstructorScope(user!.id, user!.name);
        const learnerIds = Array.from(new Set(scope.enrollmentPairs.map((pair) => pair.userId)));
        
        if (learnerIds.length === 0) {
            return NextResponse.json({ evidences: [] });
        }

        const records = await prisma.evidence.findMany({
            where: {
                userId: { in: learnerIds },
            },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });
        return NextResponse.json({ evidences: records });
    }
```

---

## Shared Patterns

### Authentication & Gating
All instructor and admin route handlers call `requireAuth()` at the top and explicitly gate role access using custom role codes.
**Source:** [learners/route.ts](file:///c:/Users/X1%20Carbon/Downloads/Projects/self-hosted-ai-starter-kit/Dev/renjana/src/app/api/instructor/learners/route.ts) lines 8-15:
```typescript
    const { user, error } = await requireAuth();
    if (error) return error;

    const role = user!.role;
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
```

### Instructor Scoping & Performance (D-01 & D-02)
To resolve access to student records:
1. Call `getInstructorScope(userId, userName)`.
2. Stop processing and return empty responses instantly if `scope.enrollmentPairs` is empty.
3. Map `enrollmentPairs` or `learnerIds` into Prisma queries using `OR` or `in` clauses.

---

## No Analog Found
*None. The existing learner scope pattern is an exact match for both endpoints.*

---

## Metadata

**Analog search scope:** `src/app/api/instructor/`
**Files scanned:** 5
**Pattern extraction date:** 2026-06-06
