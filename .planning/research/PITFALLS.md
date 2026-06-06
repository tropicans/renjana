# Pitfalls Research

**Domain:** Landing Page & Learner Dashboard
**Researched:** 2026-06-06
**Confidence:** HIGH

## Common Mistakes & Warning Signs

### 1. Recharts SSR Hydration Mismatch
- **Problem**: Recharts depends on browser-only APIs (`window`, `document`, `ResizeObserver`). Importing Recharts in Next.js Server Components or rendering it during initial server render leads to hydration mismatches.
- **Prevention**: Use dynamic imports with `{ ssr: false }` for any component that renders Recharts, or render charts only after the component is mounted (using `useEffect` and `useState` for mounting).

### 2. Learner Feedback Scoping Leak
- **Problem**: Showing graded evidence could accidentally query other learners' evidence if not gated properly by `userId` filter.
- **Prevention**: In any endpoint fetching evidence feedbacks, strictly scope the Prisma query using the authenticated user's ID (`userId: user.id`).

### 3. Hardcoded Mock Data Stagnation
- **Problem**: Static text like "40% user berhenti di Modul 3" is good for MVP, but should not block real database progression metrics.
- **Prevention**: Use database queries to calculate actual completion drop-offs per module if feasible, or make sure mock messages are labelled clearly.

## Sources

- Next.js SSR hydration guidelines
- Recharts official Next.js integration notes
