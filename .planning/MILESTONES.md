# Milestones

## v5.0 (Shipped: 2026-06-07)

**Phases completed:** 5 phases, 8 plans, 25 tasks

**Key accomplishments:**

- **Registration & Checkout Audit**: Fixed course/event registration and checkout flows with proper checkout triggers and payment webhook integrations.
- **GPS Attendance Validation**: Verified coordinates verification via Haversine distance calculations, restricting check-in access correctly based on distance.
- **Evidence Upload & Instructor Scoped Grading**: Securely gated evidence file uploads/serving and scoped instructor grading pages and metrics to their class groups.
- **Certificate A4 PDF Generation**: Implemented dynamic landscape A4 PDF generation and download streaming, and enabled admin forced-regeneration.
- **NextAuth & Middleware Gating**: Resolved Edge runtime compatibility by splitting NextAuth configuration, migrating to Next.js 16 Proxy layer, and implementing robust integration tests.
- **100% Test and Lint Pass**: Satisfied ESLint completely and achieved 100% pass rate across all 170 tests (40 test suites).

---

## v1.0 (Shipped: 2026-06-06)

**Phases completed:** 3 phases, 3 plans, 11 tasks

**Key accomplishments:**

- Secure scoping of learner evidence and statistics count for the INSTRUCTOR role with full administrator bypass and empty-set query optimization
- Implement database-backed grading, comments, list filtering, and frontend UI integration for learner evidence review.
- Restored test suite reliability to 100% success rate and excluded the internal GSD .agent folder from ESLint configurations.

---

## v2.0 (Shipped: 2026-06-07)

**Phases completed:** 3 phases (Phases 4, 5, 6), 3 plans, 12 tasks

**Key accomplishments:**

- Landing page introductory educational content on digital/flexible learning, LMS/LXP, and learning methods (Mandiri, hybrid, Online, Offline).
- Premium Continue Learning Card displaying course progress, next lesson info, and an Indonesian locale-formatted motivational reminder of the last active date.
- Interactive vertical subway-style connector map progress timeline on the learner dashboard with collapsible modules (automatically expanding only the active module by default) and sequential status highlights.
- Dashboard-visuals components using Recharts progress indicator and dynamic context-aware AI insights.

---
