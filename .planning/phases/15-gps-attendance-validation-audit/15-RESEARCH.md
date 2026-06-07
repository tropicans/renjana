# Phase 15: GPS Attendance Validation Audit - Research

**Date:** 2026-06-07
**Status:** Complete

## Current Implementation Analysis

The attendance POST handler at `src/app/api/attendance/route.ts` (119 lines total) currently:

1. **Auth check** (L8-9): Uses `requireApiAuthPolicy(req, { sameOrigin: true })` — enforces authenticated user + same-origin request. No role restriction — any authenticated user can check in.
2. **Body parsing** (L13): Extracts `{ lessonId, courseId, latitude, longitude, notes }` from request JSON.
3. **Input validation** (L14-16): Only checks that at least one of `lessonId` or `courseId` is provided. Returns 400 if neither exists.
4. **Lesson resolution** (L18-29): If only `courseId` is provided, resolves to the first lesson of the course (ordered by module order, then lesson order).
5. **Lesson existence check** (L31-38): Verifies the lesson exists and eagerly loads `module.course` via Prisma include.
6. **Attendance record creation** (L40-52): Creates an `Attendance` record with `userId`, `lessonId`, `latitude` (nullable), `longitude` (nullable), and `notes` (nullable). **GPS coordinates are stored but NEVER validated.**
7. **Auto-complete enrollment** (L54-67): If the lesson's course type is `"OFFLINE_EVENT"`, auto-sets the enrollment to `COMPLETED` with 100% progress.
8. **Response** (L69): Returns the attendance record with 201 status.

### Critical Gap
**There is ZERO GPS validation logic.** The handler accepts latitude/longitude as optional fields, stores them, but never:
- Checks if they are required (for offline events)
- Calculates distance from any target coordinates
- Rejects out-of-range check-ins

The handler also does NOT use `withRequestObservability` wrapper (unlike other route handlers in the project), which is a secondary concern but worth noting.

## Database Schema Insights

### Attendance Model (L217-231 of schema.prisma)
```prisma
model Attendance {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  lessonId   String   @map("lesson_id")
  checkedAt  DateTime @default(now()) @map("checked_at")
  latitude   Float?
  longitude  Float?
  notes      String?
  user       User     @relation(...)
  lesson     Lesson   @relation(...)
  @@map("attendances")
}
```
- `latitude` and `longitude` are nullable `Float?` — correct for storing GPS coordinates.
- No distance or validation fields exist in the model (nor should they — validation is a gate, not persisted data).

### Course Model (L124-143)
- `type` field is `String @default("ONLINE")` with values `"ONLINE"`, `"OFFLINE_EVENT"`, `"HYBRID"`.
- This is a **String**, NOT an enum. The handler already uses `lesson.module?.course?.type === "OFFLINE_EVENT"` for the auto-complete logic.

### Event Model (L351-392)
- `modality` uses the `EventModality` enum: `ONLINE | OFFLINE | HYBRID`.
- **Note the discrepancy**: `Course.type` uses string `"OFFLINE_EVENT"` while `Event.modality` uses enum `OFFLINE`. The handler currently checks `course.type`, not event modality.
- The Event model has a `location` field (String?) but **NO latitude/longitude fields** — coordinates are hardcoded per 15-CONTEXT.md decision D-01.

### Key Relationship Chain
`Attendance → Lesson → Module → Course` — The handler already includes this full chain (L32-35), providing access to `lesson.module.course.type`.

## Existing Patterns

### No Existing GPS/Distance Utilities
- **No Haversine function** exists anywhere in the codebase (confirmed via search for "haversine", "distance" in src/).
- This utility will need to be created from scratch.

### Error Response Pattern
Established pattern in the handler:
```typescript
return NextResponse.json({ error: "message" }, { status: 400 });
```
The `src/lib/api.ts` client-side `apiFetch` wrapper throws on non-OK responses, extracting the `error` field for toast display.

### Auth Pattern
The handler uses `requireApiAuthPolicy` (from `src/lib/route-policy.ts`) which enforces authentication + same-origin checks. This is the standard pattern for mutating API routes.

## Client-Side Flow

### checkIn Helper (src/lib/api.ts L553-558)
```typescript
export function checkIn(data: {
  lessonId?: string;
  courseId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}) {
  return apiFetch<{ attendance: ApiAttendance }>("/api/attendance", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
```
- `latitude` and `longitude` are typed as `number | undefined` (optional).
- The client already supports sending GPS coordinates — no frontend changes needed for the API contract.

### Check-in UI
- `/dashboard/checkin/page.tsx` is a **redirect stub** — it simply redirects to `/my-registrations`. There is no actual check-in form UI at this path.
- **No component in `src/components/` or `src/app/learn/` currently calls `checkIn` or sends GPS data.** The check-in UI component apparently doesn't exist yet, or was removed.
- The user guide (panduan-pengguna.md L39) mentions the flow: "peserta membuka `/dashboard/checkin`. Sistem akan mendeteksi GPS peserta; jika berada dalam radius 500 meter dari lokasi pelatihan (Monas), check-in berhasil."

### Implication
This phase is purely **server-side (API route handler) validation**. The frontend already has the type contract to send coordinates. The focus is on the backend rejecting invalid check-ins.

## GPS Validation Injection Point

The validation logic should be inserted **AFTER the lesson existence check (L38) and BEFORE the attendance record creation (L41)**, specifically:

```
Line 38: if (!lesson) return ... (lesson not found)
>>> INSERT GPS VALIDATION HERE <<<
Line 40: // Create attendance record
```

### Pseudocode for injection:
```typescript
// After line 38...

// GPS validation for offline/hybrid events
const courseType = lesson.module?.course?.type;
if (courseType === "OFFLINE_EVENT" || courseType === "HYBRID") {
    // D-03: Reject missing GPS for offline events
    if (latitude == null || longitude == null) {
        return NextResponse.json(
            { error: "Akses lokasi (GPS) diperlukan untuk absensi luring" },
            { status: 400 }
        );
    }
    
    // D-01/D-02: Check distance from Monas within 500m
    const TARGET_LAT = -6.175392;
    const TARGET_LNG = 106.827153;
    const MAX_RADIUS_KM = 0.5;
    
    const distanceKm = haversineDistance(latitude, longitude, TARGET_LAT, TARGET_LNG);
    if (distanceKm > MAX_RADIUS_KM) {
        return NextResponse.json(
            { error: "Di luar jangkauan" },
            { status: 403 }
        );
    }
}

// Continue to line 41: Create attendance record...
```

## Haversine Formula

The Haversine formula calculates great-circle distance between two points on a sphere:

```typescript
function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
```

**Design decision**: This utility should be placed in a separate file (e.g., `src/lib/geo.ts`) for testability and reuse, rather than inlined in the route handler.

## Testing Landscape

### Existing Tests
- **34 test files** exist in `tests/`.
- **No attendance test file exists** — there is no `attendance-route.test.ts` or similar.
- The `instructor-scope.test.ts` file references `prisma.attendance.count` mock but doesn't test the attendance route handler itself.

### Test Pattern (from instructor-scope.test.ts)
The established testing pattern is:
1. Use `vi.hoisted()` to define mock objects for Prisma and auth helpers.
2. Use `vi.mock()` to mock `@/lib/db`, `@/lib/auth-utils`, `@/lib/route-policy`.
3. Import the route handler function (e.g., `POST` from the route file).
4. Create `Request` objects and call the handler directly.
5. Assert on response status codes and JSON body.

### Tests Needed for This Phase
1. **Haversine utility tests** — Pure function, easy to unit test with known coordinate pairs.
2. **Attendance POST route tests**:
   - ONLINE course: GPS not required, check-in succeeds without coordinates.
   - OFFLINE_EVENT: Missing GPS → 400 with Indonesian error message.
   - OFFLINE_EVENT: GPS within 500m → 201 success.
   - OFFLINE_EVENT: GPS outside 500m → 403 "Di luar jangkauan".
   - HYBRID course: Same GPS rules as OFFLINE_EVENT.
   - Edge: Coordinates exactly at 500m boundary.

## Risks and Edge Cases

1. **Course.type vs Event.modality discrepancy**: `Course.type` uses `"OFFLINE_EVENT"` (string) while `Event.modality` uses the `EventModality` enum (`OFFLINE | HYBRID`). The context document (D-04) mentions `"OFFLINE_EVENT"` and `"HYBRID"` — these match `Course.type` values. The handler should check `course.type`, which is what it already accesses.

2. **HYBRID semantics**: A HYBRID course has both online and offline participants. The context (D-04) says GPS validation applies to HYBRID too. This makes sense — if a participant is physically attending a hybrid event, they need GPS validation. However, this could block online participants from checking in if they don't have GPS. Consider: should HYBRID validation only apply when the user's registration `participantMode` is `OFFLINE`? The current context doesn't mention this nuance — it says all HYBRID courses require GPS. Follow the context as-is.

3. **Hardcoded coordinates**: Per D-01, Monas coordinates are hardcoded. This means all offline events assume the same location. Future phases might need per-event coordinates, but that's out of scope.

4. **No `withRequestObservability` wrapper**: The current handler doesn't use it. Adding it would be a good practice improvement but is out of scope unless explicitly included.

5. **Float precision**: GPS coordinates as `Float` in Prisma/PostgreSQL should be `DOUBLE PRECISION` (float8). Prisma `Float` maps to PostgreSQL `DOUBLE PRECISION`, so precision is adequate for GPS coordinates (about 15 significant digits).

6. **Latitude/longitude as 0**: Value `0` is a valid coordinate (equator/prime meridian intersection). The null check should use `== null` (which catches both null and undefined) rather than falsy checks that would reject `0`.

7. **HTTP status code choice**: Missing GPS → 400 (bad request, missing required field). Out of range → the context says "blocked with clear message." Using 403 (Forbidden) or 422 (Unprocessable Entity) are both reasonable. The error message `"Di luar jangkauan"` should be returned in the `error` field.

## Validation Architecture

### How to Verify the Implementation

1. **Unit tests** for the Haversine formula with known distances:
   - Monas to a point 100m away → should return ~0.1 km.
   - Monas to a point 1km away → should return ~1.0 km.
   - Same point → should return 0.

2. **Route handler tests** mocking Prisma to simulate:
   - Online course check-in (no GPS validation).
   - Offline course check-in with valid GPS.
   - Offline course check-in with out-of-range GPS.
   - Offline course check-in with missing GPS.

3. **Build verification**: `npm run build` to ensure no type errors.

4. **Manual smoke test** (optional): Use curl or Postman to hit the API with test coordinates.

### Exact Error Messages (from 15-CONTEXT.md)
- Missing GPS for offline: `"Akses lokasi (GPS) diperlukan untuk absensi luring"` (D-03)
- Out of range: `"Di luar jangkauan"` (from Specifics section)

### Key Constants
- Target latitude: `-6.175392`
- Target longitude: `106.827153`  
- Max radius: `500 meters` = `0.5 km`
