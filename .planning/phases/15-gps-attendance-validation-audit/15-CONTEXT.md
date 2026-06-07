# Phase 15: GPS Attendance Validation Audit - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit and verify the GPS-based attendance check-in coordinates validation logic. Ensure the check-in radius constraint works correctly against the event's configured coordinates, allowing successful check-in for users within the permitted radius and blocking users outside the radius with a clear, localized message.

</domain>

<decisions>
## Implementation Decisions

### Geolocation Coordinates Config
- **D-01:** Target coordinates for check-in are hardcoded to the Monas (Monumen Nasional) location in Jakarta: Latitude `-6.175392`, Longitude `106.827153`.
- **D-02:** The permitted checking-in radius limit is set to exactly 500 meters (0.5 km) from the target coordinates.

### Handling Missing Geolocation in Request
- **D-03:** If a check-in request is made for an offline event but `latitude` or `longitude` is missing (null/undefined), the API must reject the request with a `400 Bad Request` and return the error message: `"Akses lokasi (GPS) diperlukan untuk absensi luring"`.

### Modality Enforcement
- **D-04:** Enforce GPS coordinates and radius check-in validation for courses with modality of type `"OFFLINE_EVENT"` or `"HYBRID"`. Other modalities (e.g. `"ONLINE"`) do not require GPS validation.

### the agent's Discretion
- The implementation of the Haversine distance formula and specific verification logic structure inside `/api/attendance` is left to the agent's discretion, provided it returns precise distance checks and correct status/error payloads.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Attendance APIs & Logic
- `src/app/api/attendance/route.ts` — Attendance check-in API route handler
- `src/lib/api.ts` — Central client API definitions containing the checkIn fetch helper
- `docs/panduan-pengguna.md` — User guide detailing GPS check-in rules
- `docs/skenario-uat.md` — UAT check-in scenario (LRN-004)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `checkIn` client fetch wrapper in `src/lib/api.ts` for frontend integration.
- Database `Attendance` model to persist checked-in latitude and longitude.

### Established Patterns
- NextAuth user authentication validation inside route handlers via `requireApiAuthPolicy`.
- Access controls matching role scoping.

### Integration Points
- `/api/attendance` POST route handler in `src/app/api/attendance/route.ts` where the GPS coordinates and radius validations must be injected.
- Database update updates the enrollment status to `COMPLETED` when the user checks in to an offline event.

</code_context>

<specifics>
## Specific Ideas
- Monas coordinates: `-6.175392, 106.827153`.
- Distance check calculation using the Haversine formula.
- Return the exact string `"Di luar jangkauan"` as the error when coordinates are outside the 500m radius limit.

</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 15-GPS Attendance Validation Audit*
*Context gathered: 2026-06-07*
