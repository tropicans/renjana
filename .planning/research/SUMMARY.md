# Research Summary: Landing Page & Learner Dashboard

**Milestone:** v2.0
**Researched:** 2026-06-06
**Synthesis Confidence:** HIGH

This document summarizes the stack, features, architecture, and pitfalls research for implementing the landing page intro sections and learner dashboard enhancements.

## Key Findings

### 1. Stack Additions & Changes
- Leverage Next.js 16.2 App Router, Tailwind CSS v4, and Recharts 3.7.0.
- Use dynamic imports (`ssr: false`) for chart components to prevent SSR hydration errors.

### 2. Feature Table Stakes vs. Differentiators
- **Table Stakes**: Clear learning intro content on the home page, high-level learner profile/stats, and a "Continue Learning Card" to resume.
- **Differentiators**: Interactive visual timeline/milestone track, AI-driven activity insights, and direct visibility of graded evidence and comments.

### 3. Architecture & Integration
- Uses existing Prisma database models (`Enrollment`, `Progress`, `Lesson`, `Module`, `Evidence`). No database schema migrations are necessary.
- Update `/api/dashboard/stats` to return additional dashboard metrics and course/lesson data for progress tracking.

### 4. Critical Pitfalls
- Hydration errors in Recharts.
- Security scoping leaks in learner feedback query endpoints.

---
*Synthesized: 2026-06-06*
