# Stack Research

**Domain:** LMS & Portal Dashboard Visuals
**Researched:** 2026-06-06
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.6 | App Router Framework | Canonical app framework already in place. |
| React | 19.2.3 | UI Library | Core component rendering engine. |
| Recharts | 3.7.0 | Charting Library | Already in codebase, excellent React integration for interactive dashboards. |
| Tailwind CSS | v4 | Styling | Styling standard for clean layouts and micro-animations. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | 0.562.0 | Icons | Used across dashboard cards and sidebar links. |
| Framer Motion | 12.24.0 | Interactive animations | Used for smooth visual transitions and timeline animations. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Test Runner | Enforce 100% test suite reliability on dashboard data fetchers. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Recharts | Chart.js | If simpler configuration is needed, but Recharts is already configured and standard. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind v3 | Codebase is migrated to v4 | Tailwind v4 |
| Recharts (Server Components) | Charts need React lifecycle | Dynamic imports with `ssr: false` for client-side charts |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Recharts@3.7.0 | React@19.2.3 | Standard compatibility verified. |

## Sources

- Official Recharts documentation
- Renjana LMS package.json config
