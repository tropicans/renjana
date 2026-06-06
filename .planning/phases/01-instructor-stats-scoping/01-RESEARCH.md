# Phase 1: Instructor Stats & Scoping - Research

## Context Overview
Phase 1 focuses on securing and scoping evidence statistics and listings for the instructor role. This requires:
1. Fetching the actual database count for `totalEvidences` in `/api/instructor/stats` (scoped to learners registered in Class Groups taught by the instructor).
2. Enforcing secure access control in `GET /api/evidence` to return only evidence uploaded by learners scoped to the requesting instructor.
3. Ensuring administrators (ADMIN) continue to have global, unscoped access.
4. Handling empty scope efficiently (no database query triggers for instructors without classes).

## 1. Scoped `totalEvidences` Query in `/api/instructor/stats`

### Existing Code Analysis
In `src/app/api/instructor/stats/route.ts`, the `totalEvidences` stat for the `INSTRUCTOR` role is currently hardcoded to `0`:
```typescript
        return NextResponse.json({
            stats: {
                totalCourses,
                totalEnrollments,
                completedEnrollments,
                totalAttendances,
                totalEvidences: 0, // <--- Hardcoded value
                avgProgress,
                courses,
            },
            recentEnrollments: enrollments.slice(0, 5),
        });
```

### Scoping Strategy
To query the database for the correct count of scoped evidence, we leverage `getInstructorScope` which is already called at the top of the route handler:
1. Extract the unique `learnerIds` from the resolved scoped enrollments:
   ```typescript
   const learnerIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.userId)));
   ```
2. Run a count query on the `Evidence` model:
   ```typescript
   const totalEvidences = learnerIds.length === 0
       ? 0
       : await prisma.evidence.count({
           where: {
               userId: { in: learnerIds },
           },
       });
   ```
3. Replace the hardcoded `totalEvidences: 0` in the JSON response with the dynamic `totalEvidences` count.

### Empty Scope Performance (D-01)
If the instructor has no classes, `scope.enrollmentPairs.length === 0`. The handler already immediately short-circuits and returns empty stats without querying `prisma.enrollment` or `prisma.attendance`:
```typescript
        if (scope.enrollmentPairs.length === 0) {
            return NextResponse.json({
                stats: {
                    totalCourses: 0,
                    totalEnrollments: 0,
                    completedEnrollments: 0,
                    totalAttendances: 0,
                    totalEvidences: 0,
                    avgProgress: 0,
                    courses: [],
                },
                recentEnrollments: [],
            });
        }
```
This satisfies the D-01 constraint natively and avoids unnecessary database operations.

---

## 2. Scoping Evidence Records in `/api/evidence`

### Existing Code Analysis
In `src/app/api/evidence/route.ts`, the `GET` handler retrieves all evidence for both `ADMIN` and `INSTRUCTOR` roles:
```typescript
    // Admins/Instructors see all evidence
    if (role === "ADMIN" || role === "INSTRUCTOR") {
        const records = await prisma.evidence.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { uploadedAt: "desc" },
        });
        return NextResponse.json({ evidences: records });
    }
```

### Scoping Strategy
To ensure instructors only see evidence uploaded by learners scoped to their class groups, we must separate the role handling logic for `ADMIN` and `INSTRUCTOR`:
1. **Imports**: Import `getInstructorScope` at the top of `src/app/api/evidence/route.ts`:
   ```typescript
   import { getInstructorScope } from "@/lib/instructor-scope";
   ```
2. **ADMIN check**: Keep it unscoped, returning all database records:
   ```typescript
   if (role === "ADMIN") {
       const records = await prisma.evidence.findMany({
           include: {
               user: { select: { id: true, fullName: true, email: true } },
           },
           orderBy: { uploadedAt: "desc" },
       });
       return NextResponse.json({ evidences: records });
   }
   ```
3. **INSTRUCTOR check**: Securely resolve the scope, apply the filter, and support early return for empty scopes (D-01):
   ```typescript
   if (role === "INSTRUCTOR") {
       const scope = await getInstructorScope(user!.id, user!.name);
       const learnerIds = Array.from(new Set(scope.enrollmentPairs.map((pair) => pair.userId)));
       
       // D-01: Return empty list instantly if empty scope
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

## Validation Architecture

We will verify these changes through automated unit and integration tests using **Vitest**.

### 1. Modifying Existing Test Case (`tests/instructor-scope.test.ts`)
The existing test case `"returns zero evidence and scoped aggregates for instructor stats"` asserts that `body.stats.totalEvidences` is `0`. We will update this test to mock and verify the evidence count call.

**Proposed Test Update:**
```typescript
    it("returns real evidence and scoped aggregates for instructor stats", async () => {
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
        mocks.prisma.evidence.count.mockResolvedValue(3); // Mock evidence count

        const response = await statsGet();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.stats.totalCourses).toBe(1);
        expect(body.stats.totalEnrollments).toBe(1);
        expect(body.stats.completedEnrollments).toBe(1);
        expect(body.stats.totalAttendances).toBe(4);
        expect(body.stats.totalEvidences).toBe(3); // Assert actual mocked count
        expect(mocks.prisma.evidence.count).toHaveBeenCalledWith({
            where: {
                userId: { in: ["learner-1"] },
            },
        });
    });
```

### 2. New Test Cases to Add (`tests/instructor-scope.test.ts`)
We will add new tests within `tests/instructor-scope.test.ts` to cover the scoping logic in `/api/evidence`.

```typescript
import { GET as evidenceGet } from "@/app/api/evidence/route";
```

#### A. Instructor with Scoped Learners
- Mock role: `INSTRUCTOR`, `enrollmentPairs: [{ userId: "learner-1", courseId: "course-1" }]`.
- Mock `prisma.evidence.findMany` to return a list of mocked evidence.
- Call `GET` on `/api/evidence`.
- Assert that `prisma.evidence.findMany` is called with:
  ```typescript
  where: { userId: { in: ["learner-1"] } }
  ```
- Assert that the response has status code `200` and returns the records.

#### B. Instructor with Empty Scope (D-01)
- Mock role: `INSTRUCTOR`, `enrollmentPairs: []`.
- Call `GET` on `/api/evidence`.
- Assert that `prisma.evidence.findMany` is NOT called.
- Assert that the response is `200` with `{ evidences: [] }`.

#### C. Admin (Unscoped Global Access)
- Mock role: `ADMIN`.
- Mock `prisma.evidence.findMany` to return a list of mocked evidence.
- Call `GET` on `/api/evidence`.
- Assert that `prisma.evidence.findMany` is called with NO `userId` filter.
- Assert that all records are returned.

#### D. Learner (Self Access Only)
- Mock role: `LEARNER` with id `"learner-1"`.
- Mock `prisma.evidence.findMany` to return learner's own evidence.
- Call `GET` on `/api/evidence`.
- Assert that `prisma.evidence.findMany` is called with `where: { userId: "learner-1" }`.

### 3. Execution & Verification Flow
1. Run targeted tests to verify scoping assertions:
   ```bash
   npx vitest run tests/instructor-scope.test.ts
   ```
2. Run standard project linters:
   ```bash
   npm run lint
   ```
3. Build the application to ensure TypeScript/standalone compatibility:
   ```bash
   npm run build
   ```
4. Smoke test the dashboard and evidence view inside a docker environment:
   ```bash
   docker compose up -d --build
   ```
