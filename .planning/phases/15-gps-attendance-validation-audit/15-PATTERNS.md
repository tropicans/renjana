# Phase 15: GPS Attendance Validation Audit — Pattern Map

**Generated:** 2026-06-07
**Status:** Complete

---

## Files Overview

| # | File | Action | Role | Data Flow Layer |
|---|------|--------|------|-----------------|
| 1 | `src/app/api/attendance/route.ts` | MODIFY | Route Handler | API Layer — receives requests, validates, persists |
| 2 | `src/lib/geo.ts` | NEW | Domain Utility | Lib Layer — pure function, no I/O |
| 3 | `tests/geo.test.ts` | NEW | Unit Test | Test Layer — pure function tests |
| 4 | `tests/attendance-route.test.ts` | NEW | Route Test | Test Layer — mocked route handler tests |

---

## 1. `src/app/api/attendance/route.ts` (MODIFY)

### Closest Analog
**`src/app/api/attendance/route.ts` itself** — the existing handler already follows the project's route handler pattern. The modification inserts validation logic between the lesson existence check and the attendance record creation.

Secondary analogs for validation-before-create patterns:
- `src/app/api/registrations/route.ts` — validates event lifecycle before creating registration
- `src/app/api/payments/checkout/route.ts` — validates gateway config and registration state before creating payment

### Current Handler Structure (to be modified)
```typescript
// src/app/api/attendance/route.ts — Lines 1-69 (POST handler)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { requireApiAuthPolicy } from "@/lib/route-policy";

export async function POST(req: Request) {
    // Auth check via requireApiAuthPolicy
    const policy = await requireApiAuthPolicy(req, { sameOrigin: true });
    if (!policy.ok) return policy.response;
    const { user } = policy;

    // Body parsing
    const { lessonId, courseId, latitude, longitude, notes } = await req.json();

    // Input validation
    if (!lessonId && !courseId) {
        return NextResponse.json({ error: "lessonId or courseId is required" }, { status: 400 });
    }

    // ... lesson resolution (L18-29) ...
    // ... lesson existence check (L31-38) ...

    // >>> GPS VALIDATION INJECTION POINT <<<
    // Insert between L38 (lesson not found check) and L40 (attendance create)

    // Create attendance record (L40-52)
    const attendance = await prisma.attendance.create({
        data: {
            userId: user!.id,
            lessonId: resolvedLessonId,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            notes: notes ?? null,
        },
        // ...
    });

    // Auto-complete offline events (L54-67)
    if (lesson.module?.course?.type === "OFFLINE_EVENT") {
        await prisma.enrollment.updateMany({ /* ... */ });
    }

    return NextResponse.json({ attendance }, { status: 201 });
}
```

### Error Response Pattern (project standard)
```typescript
// Standard pattern used across ALL route handlers
return NextResponse.json({ error: "Human-readable message" }, { status: 400 });
return NextResponse.json({ error: "Forbidden" }, { status: 403 });
return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
```

### Auth Pattern (from route-policy.ts)
```typescript
// src/lib/route-policy.ts — Lines 21-51
export async function requireApiAuthPolicy(request: Request, options: RoutePolicyOptions = {}): Promise<RoutePolicyResult> {
    const authResult = options.roles?.length
        ? await requireRole(...options.roles)
        : await requireAuth();
    if (authResult.error || !authResult.user) {
        return { ok: false, response: authResult.error as Response };
    }
    // ... sameOrigin, rateLimit checks ...
    return { ok: true, user: authResult.user };
}
```

### Course Type Access Pattern (already in handler)
```typescript
// The handler already loads the full chain: Attendance → Lesson → Module → Course
const lesson = await prisma.lesson.findUnique({
    where: { id: resolvedLessonId },
    include: { module: { include: { course: true } } }
});

// Access course type via:
lesson.module?.course?.type  // String: "ONLINE" | "OFFLINE_EVENT" | "HYBRID"
```

---

## 2. `src/lib/geo.ts` (NEW)

### Closest Analogs

**Primary: `src/lib/evaluation-link.ts`** — Small, pure utility file with typed input, no external dependencies, named exports.
```typescript
// src/lib/evaluation-link.ts — Full file (22 lines)
type EvaluationLinkLike = {
    registrationId?: string | null;
    answers?: unknown;
};

type EvaluationAnswersPayload = {
    registrationId?: string | null;
};

function getRegistrationIdFromAnswers(answers: unknown) {
    if (!answers || typeof answers !== "object") return null;
    const value = answers as EvaluationAnswersPayload;
    return typeof value.registrationId === "string" && value.registrationId.trim()
        ? value.registrationId
        : null;
}

export function getEvaluationRegistrationId(evaluation: EvaluationLinkLike) {
    return evaluation.registrationId ?? getRegistrationIdFromAnswers(evaluation.answers);
}
```

**Secondary: `src/lib/event-validation.ts`** — Pure validation functions with explicit return types, no side effects.
```typescript
// src/lib/event-validation.ts — Lines 27-31 (helper function pattern)
function asDate(value: string | Date | null | undefined) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

// Lines 35-65 — Named export with typed input/output
export function validateEventRegistrationLifecycle(input: EventRegistrationLifecycleInput) {
    // ... pure validation logic ...
    return { ok: false as const, error: "message" };
}
```

### Pattern to Follow for `src/lib/geo.ts`
- **No imports** needed (pure math)
- **Private helper** `toRad()` not exported
- **Named export** `haversineDistance()` with explicit parameter types and return type `number`
- Constants can be module-level or inline
- File should be < 30 lines

---

## 3. `tests/geo.test.ts` (NEW)

### Closest Analog
**`tests/event-validation.test.ts`** — Pure function test, no mocks needed.
```typescript
// tests/event-validation.test.ts — Full file (38 lines)
import { describe, expect, it } from "vitest";
import { validateEventRegistrationLifecycle } from "@/lib/event-validation";

describe("validateEventRegistrationLifecycle", () => {
    it("rejects registrations for non-open statuses", () => {
        const result = validateEventRegistrationLifecycle({
            status: "DRAFT",
        });
        expect(result.ok).toBe(false);
        expect(result.error).toBe("Registration is not open for this event");
    });

    it("accepts registrations when status and window are valid", () => {
        const result = validateEventRegistrationLifecycle({
            status: "REGISTRATION_OPEN",
            registrationStart: "2099-01-01T00:00:00.000Z",
            registrationEnd: "2099-01-03T00:00:00.000Z",
            now: new Date("2099-01-02T00:00:00.000Z"),
        });
        expect(result.ok).toBe(true);
        expect(result.error).toBeNull();
    });
});
```

### Pattern to Follow for `tests/geo.test.ts`
- Import from `vitest`: `{ describe, expect, it }` — no mocks
- Import function from `@/lib/geo`
- Use `describe("haversineDistance", ...)` wrapper
- Test cases with known GPS coordinate pairs and expected distances
- Use `toBeCloseTo()` for floating-point assertions

---

## 4. `tests/attendance-route.test.ts` (NEW)

### Closest Analog
**`tests/payment-checkout-route.test.ts`** — Route handler test using `requireApiAuthPolicy` mock (same auth pattern as attendance handler).

```typescript
// tests/payment-checkout-route.test.ts — Lines 1-36 (setup pattern)
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    requireApiAuthPolicy: vi.fn(),
    prisma: {
        registration: { findUnique: vi.fn(), update: vi.fn() },
        registrationPayment: { create: vi.fn() },
    },
}));

function withOrigin(init?: RequestInit) {
    const headers = new Headers(init?.headers);
    headers.set("Origin", "http://localhost");
    return { ...init, headers };
}

vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/payments/checkout/route";

describe("POST /api/payments/checkout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireApiAuthPolicy.mockResolvedValue({
            ok: true,
            user: { id: "learner-1", email: "learner@example.com", name: "Learner One" },
        });
    });
    // ... test cases ...
});
```

### Pattern to Follow for `tests/attendance-route.test.ts`

**Mock setup:**
```typescript
const mocks = vi.hoisted(() => ({
    requireApiAuthPolicy: vi.fn(),
    prisma: {
        lesson: { findFirst: vi.fn(), findUnique: vi.fn() },
        attendance: { create: vi.fn() },
        enrollment: { updateMany: vi.fn() },
    },
}));

vi.mock("@/lib/route-policy", () => ({
    requireApiAuthPolicy: mocks.requireApiAuthPolicy,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));
```

**Test cases to implement:**
1. ONLINE course → no GPS validation, 201 success
2. OFFLINE_EVENT → missing GPS → 400 with `"Akses lokasi (GPS) diperlukan untuk absensi luring"`
3. OFFLINE_EVENT → GPS within 500m of Monas → 201 success
4. OFFLINE_EVENT → GPS outside 500m → 403 with `"Di luar jangkauan"`
5. HYBRID → same GPS rules as OFFLINE_EVENT
6. Auth policy rejection → 403

**Request construction pattern:**
```typescript
const response = await POST(new Request("http://localhost/api/attendance", {
    method: "POST",
    body: JSON.stringify({
        courseId: "course-1",
        latitude: -6.175392,
        longitude: 106.827153,
    }),
    headers: withOrigin({ headers: { "Content-Type": "application/json" } }).headers,
}));

expect(response.status).toBe(201);
await expect(response.json()).resolves.toEqual({
    attendance: expect.any(Object),
});
```

---

## Key Conventions Summary

| Concern | Pattern | Source |
|---------|---------|-------|
| Auth in POST handlers | `requireApiAuthPolicy(req, { sameOrigin: true })` + `if (!policy.ok) return policy.response` | `attendance/route.ts:8-9` |
| Error response format | `NextResponse.json({ error: "msg" }, { status: N })` | All route handlers |
| Lib file structure | Private helpers → named exports, explicit types, no default exports | `payment.ts`, `evaluation-link.ts` |
| Test mock setup | `vi.hoisted()` → `vi.mock()` → import handler → `beforeEach(vi.clearAllMocks)` | `payment-checkout-route.test.ts` |
| Pure function test | Direct import, `describe`/`it`, no mocks needed | `event-validation.test.ts` |
| Request construction in tests | `new Request(url, { method, body: JSON.stringify(...), headers: withOrigin(...) })` | `registrations-route.test.ts` |
| Origin header helper | `function withOrigin(init?)` adding `Origin: http://localhost` | All route test files |
| Vitest config | Node environment, `@/*` → `src/*` alias, clearMocks + restoreMocks | `vitest.config.ts` |
| Course type check | `lesson.module?.course?.type === "OFFLINE_EVENT"` (String, not enum) | `attendance/route.ts:55` |

---

## Critical Notes for Implementation

1. **Null check with `== null`**: Use `latitude == null` (not `=== null` or falsy check) to catch both `null` and `undefined` while accepting `0` as valid GPS coordinate (latitude 0 = equator).

2. **Course.type is a String**: Values are `"ONLINE"`, `"OFFLINE_EVENT"`, `"HYBRID"` — not the `EventModality` enum.

3. **The handler already loads the course chain**: `include: { module: { include: { course: true } } }` at line 34 — no additional Prisma query needed.

4. **Auto-complete logic scope**: Currently only checks `"OFFLINE_EVENT"` (line 55). After adding GPS validation for both `"OFFLINE_EVENT"` and `"HYBRID"`, the auto-complete logic may also need to include `"HYBRID"` — verify with CONTEXT decisions.

5. **No `withRequestObservability` wrapper**: The existing handler doesn't use it. Keep consistency — don't add it in this phase.
