<!-- generated-by: gsd-doc-writer -->
# Testing Guide

This document explains the testing strategy, framework setup, and guidelines for writing and running tests in Renjana LMS.

## Test Framework and Setup

The project uses **Vitest** for running unit and integration tests.

- **Framework**: Vitest `^3.2.4`
- **Config file**: `vitest.config.ts`
- **Environment**: Node.js execution environment

Tests are located in the `tests/` directory at the project root and are named with the `*.test.ts` pattern.

## Running Tests

Ensure all dependencies are installed: `npm install`.

### Run All Tests
To run the full test suite once:
```bash
npm run test
```

### Interactive Watch Mode
To run tests in watch mode during development:
```bash
npm run test:watch
```

### Run a Specific Test File
To run only a single test file (e.g. `tests/registrations-route.test.ts`):
```bash
npx vitest run tests/registrations-route.test.ts
```

## Writing New Tests

New test files should be placed inside the `tests/` directory with the `.test.ts` extension.

### Test Patterns and Mocking

Because API handlers depend on NextAuth sessions, database queries, and notification dispatches, test files should mock these dependencies using `vi.mock` and `vi.hoisted`.

#### Example Route Handler Test

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

// Define mocks before imports using vi.hoisted
const mocks = vi.hoisted(() => ({
    requireAuth: vi.fn(),
    prisma: {
        event: {
            findUnique: vi.fn(),
        },
    },
}));

// Mock the auth and database utilities
vi.mock("@/lib/auth-utils", () => ({
    requireAuth: mocks.requireAuth,
}));

vi.mock("@/lib/db", () => ({
    prisma: mocks.prisma,
}));

import { POST } from "@/app/api/registrations/route";

describe("POST /api/registrations", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.requireAuth.mockResolvedValue({
            user: { id: "user-1", role: "LEARNER" },
            error: null,
        });
    });

    it("rejects when event is not open", async () => {
        mocks.prisma.event.findUnique.mockResolvedValue({
            id: "event-1",
            status: "DRAFT",
        });

        // Mutating requests must have Origin header checked by request-security
        const headers = new Headers();
        headers.set("Origin", "http://localhost");
        headers.set("Content-Type", "application/json");

        const response = await POST(new Request("http://localhost/api/registrations", {
            method: "POST",
            body: JSON.stringify({
                eventId: "event-1",
                participantMode: "ONLINE",
            }),
            headers,
        }));

        expect(response.status).toBe(403);
        await expect(response.json()).resolves.toEqual({
            error: "Registration is not open for this event",
        });
    });
});
```

### Key Guidelines for Writing Tests

1. **Clean Mocks**: Always call `vi.clearAllMocks()` in `beforeEach` to prevent test contamination.
2. **CSRF & Security Gating**: API routes mutating state (POST, PUT, DELETE) use request-security logic which asserts that the `Origin` header is present. Always add the `Origin` header in test requests for mutating handlers.
3. **Keep it Fast**: Unit tests should mock external services (like Midtrans payment gateways) and run entirely in-memory using mocked Prisma calls.

## Coverage Requirements

- There are no coverage thresholds enforced in `vitest.config.ts`.
- Contributors are encouraged to write unit tests covering core business rule changes, particularly registration flows, role gates, and certificate eligibility.

## CI Integration

- The project integrates GitHub Actions for PR operations. The `.github/workflows/opencode.yml` runs comment-driven code reviews.
- Unit tests are currently run manually prior to commit and deployment. Make sure all tests pass by running `npm run test` before creating a PR or deploying the container stack.
