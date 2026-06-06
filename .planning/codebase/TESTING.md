# Testing Patterns

**Analysis Date:** 2026-06-06

## Test Framework

**Runner:**
- Vitest 3.2.4
- Configuration: `vitest.config.ts` (sets environment to `node`, clears/restores mocks, defines `@` alias resolve mapping).

**Assertion Library:**
- Vitest built-in expect.
- Matchers used: `toBe`, `toEqual`, `toThrow`, `toHaveBeenCalledWith`, `toHaveLength`, `rejects.toThrow`.

**Run Commands:**
```bash
npm run test                                      # Run all tests once
npm run test:watch                                # Run tests in watch mode
npx vitest run tests/instructor-scope.test.ts     # Run a single test file
```

## Test File Organization

**Location:**
- Located in the root `tests/` directory (separate from `src/` to keep runtime containers clean).

**Naming:**
- Named using `[feature-or-route].test.ts` (e.g. `instructor-scope.test.ts`, `registrations-route.test.ts`).

**Structure:**
```
tests/
├── admin-registrations-readiness.test.ts
├── approval-enrollment-sync.test.ts
├── instructor-scope.test.ts
├── registrations-route.test.ts
└── role-routing.test.ts
```

## Test Structure

**Suite Organization:**
Tests are organized using standard `describe` blocks per feature/file, with inner `describe` blocks targeting specific routes or functions.
```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("feature name", () => {
    beforeEach(() => {
        vi.clearAllMocks(); // Clear call histories before every test runs
    });

    it("should accomplish specific behavior", async () => {
        // arrange: set up mock return values
        // act: invoke target route or function
        // assert: verify responses and call parameters
    });
});
```

**Setup/Teardown Policies:**
- Use `beforeEach` to reset all spy/mock histories (`vi.clearAllMocks()`).
- Use `clearMocks: true` and `restoreMocks: true` settings in `vitest.config.ts` to automate standard mock cleanup.

## Mocking

**Framework:**
- Vitest built-in mocking engine (`vi`).

**Hoisted Mock Pattern:**
Because `vi.mock` is hoisted to the top of the file during compilation, variables passed to it must be defined early. Use `vi.hoisted` to declare mock objects:
```typescript
const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    prisma: {
        enrollment: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));
```

**Setting Mock Behaviors:**
- Mock resolved values: `mocks.requireAuth.mockResolvedValue({ user: { id: "1" }, error: null })`.
- Mock rejected values: `mocks.requireAuth.mockRejectedValue(new Error("Unauthorized"))`.

**What to Mock:**
- Database Client: Mock the `prisma` singleton to avoid reading/writing the actual database during unit runs.
- Authentication calls: Mock `requireAuth` or `requireRole`.
- External APIs: Mock fetch endpoints (e.g., Midtrans API calls).

## Fixtures and Factories

**Data Mocking Patterns:**
- Mock response data declared directly inside the test spec block or as variables within the `describe` scope.
- Use explicit arrays of records representing database results (e.g. mock enrollment objects with nested user and course details).

## Coverage

- Coverage target: No specific target is enforced. Tests are focused on critical route handlers, permissions gating, registration checks, and payment state mappings.
- Coverage tracking is optional and can be run via vitest CLI coverage flags if required.

## Test Types

**Route Handler Tests (Integration):**
- Import route handler functions (e.g. `GET`, `POST`) directly into the test file.
- Construct `Request` objects containing headers and request bodies, invoke the route handlers, and verify `NextResponse` outputs:
  ```typescript
  const response = await GET();
  const body = await response.json();
  expect(response.status).toBe(200);
  ```

**Helper Unit Tests:**
- Test utility libraries (e.g. `getInstructorScope`, `isMidtransEnabled`) in isolation by verifying output shapes against inputs.

## Common Patterns

**Async Testing:**
All route handlers and database client calls are async. Test cases must use `async/await` syntax.

**Error Testing:**
Assert thrown exceptions or rejected promises:
```typescript
await expect(actionPromise).rejects.toThrow("Expected error message");
```
Assert JSON error responses from API handlers:
```typescript
const response = await POST(request);
expect(response.status).toBe(403);
await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
```

---

*Testing analysis: 2026-06-06*
*Update when test patterns change*
