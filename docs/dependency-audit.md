# Dependency Audit

Date: 2026-05-09

Scope:
- `package.json`
- `package-lock.json`
- direct import usage under `src/`, `prisma/`, and tests
- `npm audit --json`
- `npm outdated --json`
- `npm ls --depth=0`
- targeted upstream package status and advisory checks

## Executive Summary

Current dependency set is serviceable but carries several risks:
- no direct packages are marked deprecated
- production auth depends on prerelease `next-auth@5.0.0-beta.31`
- runtime security exposure exists through `jspdf -> dompurify`
- dev-tooling security findings exist through `flatted` and `brace-expansion`
- UI stack has mild overlap, especially icons and decorative animation
- some packages are heavy relative to narrow usage
- Prisma is materially behind current major release line

## Findings by Category

### 1. Deprecated Packages

Direct dependencies in `package.json` do not currently show deprecated status.

Observed maintenance warning instead:
- `next-auth@5.0.0-beta.31`
  - not deprecated
  - still prerelease/beta
  - production auth on beta package is maintenance and stability risk

References:
- https://authjs.dev/getting-started/migrating-to-v5
- https://github.com/nextauthjs/next-auth/releases/tag/next-auth%405.0.0-beta.31
- https://github.com/nextauthjs/next-auth/issues/12188

### 2. Security Issues

#### Runtime-facing

1. `jspdf -> dompurify@3.3.1`
- severity: moderate in audit
- source: transitive dependency of `jspdf@4.2.1`
- repo usage: `src/lib/certificate-service.ts`
- risk: lower than browser HTML sanitization path, but still present in shipped SBOM and production dependency graph

References:
- https://github.com/parallax/jsPDF/issues/3963
- https://github.com/parallax/jsPDF/pull/3948
- https://security.snyk.io/package/npm/jspdf/4.2.0

#### Dev / CI tooling

2. `eslint -> file-entry-cache -> flat-cache -> flatted`
- severity: high advisory upstream
- dev-only exposure
- still relevant for local development and CI environments

References:
- https://github.com/WebReflection/flatted/security/advisories/GHSA-rf6f-7fwh-wjgh
- https://github.com/WebReflection/flatted/security/advisories/GHSA-25h7-pfq9-p65f
- https://github.com/eslint/eslint/issues/20732

3. `brace-expansion`
- severity: moderate in audit
- enters through lint/tooling dependency chain
- dev-only risk

#### Platform note

`next@16.2.6` is on security-release line, not obviously stranded on older vulnerable minor.

References:
- https://vercel.com/changelog/next-js-may-2026-security-release
- https://github.com/vercel/next.js/releases/tag/v16.2.6

### 3. Dependency Overlap

#### Icons
- `lucide-react` used broadly
- `@radix-ui/react-icons` was previously narrow and has now been removed in favor of `lucide-react`
- icon overlap in current manifest is reduced

#### Animation / visual effects
- `framer-motion` used in multiple UI components
- `@tsparticles/react`, `@tsparticles/engine`, `@tsparticles/slim` used only in `src/components/ui/sparkles.tsx`
- `tw-animate-css` also present for animation utilities
- custom Tailwind/CSS animation classes also exist

Assessment:
- overlap is not catastrophic
- decorative animation stack is broader than feature value suggests

#### Styling utilities
- `class-variance-authority`, `clsx`, `tailwind-merge` are justified together
- no action needed here

### 4. Unnecessary or Weak-Value Packages

#### Removed in this repo

1. `@radix-ui/react-icons`
- removed after audit by standardizing on `lucide-react`

#### Strong removal candidates still remaining

2. `@tsparticles/react`
3. `@tsparticles/engine`
4. `@tsparticles/slim`
- only observed usage in one decorative component
- meaningful maintenance and bundle surface for low business value feature

#### Keep
- `@tanstack/react-query`
- `prisma` / `@prisma/client`
- `bcryptjs`
- `dotenv`
- `recharts`
- `jspdf`
- `framer-motion`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

### 5. Heavy Packages

Observed installed size scan from `node_modules`:
- `next` — 147.86 MB
- `prisma` — 44.04 MB
- `lucide-react` — 34.48 MB
- `jspdf` — 28.79 MB
- `@prisma/client` — 7.99 MB
- `recharts` — 6.08 MB
- `framer-motion` — 5.25 MB
- `@tsparticles/engine` — 1.90 MB
- `@tsparticles/slim` — 1.32 MB
- `@tanstack/react-query` — 0.70 MB
- `next-auth` — 0.19 MB
- `@tsparticles/react` — 0.02 MB

Interpretation:
- `next`, `prisma`, `@prisma/client` are expected core cost
- `lucide-react` is large on disk but usually tree-shaken in app bundles
- `jspdf` is heavy for narrow server-side certificate usage
- particle stack is expensive relative to single decorative use

### 6. Maintenance Risk

#### High

1. `next-auth@5.0.0-beta.31`
- auth is critical path
- prerelease dependency in production system
- API/support stability risk

#### Medium-high

2. `prisma@5.22.0` and `@prisma/client@5.22.0`
- latest observed line from `npm outdated` was `7.8.0`
- major-version drift increases future migration cost

References:
- https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- https://www.prisma.io/changelog/2025-11-19

#### Medium

3. `jspdf@4.2.1`
- runtime transitive vulnerability path
- older line

4. `recharts@3.7.0`
- behind current line
- ecosystem had recent churn around `react-smooth` deprecation/internalization

References:
- https://github.com/recharts/recharts/releases/tag/v3.7.0
- https://github.com/recharts/recharts/pull/5924
- https://github.com/recharts/recharts/issues/3873

#### Medium-low

5. `lucide-react@0.562.0`
- behind current major line
- not urgent, but drift exists

6. `@tsparticles/*`
- more maintenance surface than business value

### 7. Extraneous Packages in Local Install

Observed extraneous packages from local `npm ls --depth=0` state:
- `@emnapi/core@1.8.1`
- `@emnapi/runtime@1.8.1`
- `@emnapi/wasi-threads@1.1.0`
- `@napi-rs/wasm-runtime@0.2.12`
- `@tybys/wasm-util@0.10.1`

These are not declared in manifest.

Meaning:
- local install is dirty
- audit noise may differ from clean CI install

Recommended hygiene step:
- rebuild `node_modules` with clean `npm ci`

## Direct Usage Notes

Observed notable usage patterns:
- `@tanstack/react-query` used broadly in admin/client pages
- `framer-motion` used in multiple UI animation components
- `jspdf` used in certificate generation path
- `@tsparticles/*` only used in `src/components/ui/sparkles.tsx`
- `@radix-ui/react-icons` was previously limited to UI/demo files and has now been removed
- `dotenv/config` used in Prisma scripts
- `bcryptjs` used in seed/auth-related script path

## Recommended Actions

### Priority 1
1. Address `jspdf -> dompurify` vulnerability path
   - prefer upgrading `jspdf` or pinning patched transitive if supported and verified
   - verify certificate generation output after change

2. Plan migration off `next-auth@5.0.0-beta.31`
   - avoid leaving authentication stack on prerelease dependency

### Priority 2
3. Refresh lint/tooling chain to clear `flatted` and `brace-expansion` advisories
4. Clean local install state with fresh `npm ci`

### Priority 3
5. Re-evaluate particle stack; remove if decorative effect is nonessential
6. Schedule Prisma major upgrade before drift grows further

## Keep / Watch / Remove Matrix

### Keep
- `next`
- `react`
- `react-dom`
- `@tanstack/react-query`
- `prisma`
- `@prisma/client`
- `bcryptjs`
- `dotenv`
- `recharts`
- `framer-motion`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-slot`
- `@radix-ui/react-label`
- `@radix-ui/react-separator`

### Keep but watch
- `next-auth`
- `jspdf`
- `recharts`
- `lucide-react`
- Prisma pair

### Remove candidates
- `@tsparticles/react`
- `@tsparticles/engine`
- `@tsparticles/slim`

## Final Assessment

Highest-confidence problems:
- auth stack on beta package
- runtime transitive vuln through `jspdf`
- dev-tooling advisories in lint chain
- decorative dependency surface larger than needed
- Prisma major lag

No evidence found that core data/auth/chart/query packages are outright unnecessary. Main issue is risk concentration, not gross package sprawl.