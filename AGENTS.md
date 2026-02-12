# AGENTS.md
Guidance for coding agents working in this repository.

## Project Snapshot
- Stack: Next.js 16 (App Router), React 19, TypeScript 5
- Styling: Tailwind CSS v4 + `tw-animate-css`
- UI: shadcn-style components, Radix primitives, Lucide icons
- Package manager: npm (`package-lock.json` committed)
- Path alias: `@/*` -> `src/*`
- Build output: `standalone` (`next.config.ts`)

## Repository Layout
- `src/app`: routes, layouts, page-level UI, route error boundaries
- `src/components`: reusable UI and domain components
- `src/lib`: utilities, context, i18n, mock data
- `public`: static assets
- `docs`: product/deployment documentation

## Setup Commands
### Prerequisites
- Node 20+ (Dockerfile uses `node:20-alpine`)

### Install dependencies
- Reproducible/CI: `npm ci`
- Local dev: `npm install`

## Build, Lint, Run
### Development
- `npm run dev` (serves on port `3214`)

### Production build
- `npm run build`

### Start production server
- `npm run start`

### Lint full repo
- `npm run lint`

### Lint a single file/folder
- `npm run lint -- src/components/ui/button.tsx`
- `npm run lint -- src/app`

## Test Commands (Current Reality)
There is no committed test framework setup yet.
- No `test` script in `package.json`
- No Jest/Vitest/Playwright/Cypress config files
- No `*.test.*` or `*.spec.*` test files

### Run all tests
- Not available yet

### Run a single test
- Not available yet

### PR validation baseline (until tests exist)
1. `npm run lint`
2. `npm run build`
3. Smoke test changed routes via `npm run dev`

When tests are introduced, update this file with exact per-test commands.

## Docker (Optional)
- Build/start: `docker compose up -d --build`
- Status: `docker compose ps`
- Logs: `docker compose logs -f`
- Stop: `docker compose down`

## TypeScript Rules
- Follow strict typing (`strict: true`)
- Avoid `any`; prefer unions, generics, narrowing
- Define interfaces/types for shared domain objects
- Use type-only imports where useful (`import type { ... }`)
- Keep helper return types explicit when that improves readability

## Import Rules
- Prefer internal alias imports (`@/components/...`, `@/lib/...`)
- Keep imports grouped consistently:
  1. React/Next
  2. third-party packages
  3. internal `@/...`
  4. relative imports
- Separate type imports from runtime imports when useful

## React / Next.js Conventions
- Default to Server Components in `src/app`
- Add `"use client"` only when required for:
  - hooks (`useState`, `useEffect`, etc.)
  - browser APIs (`window`, `localStorage`)
  - client-side interactivity
- Keep route-level boundaries in:
  - `src/app/error.tsx`
  - `src/app/not-found.tsx`
- Preserve existing Next metadata patterns in layouts/pages

## Formatting and Code Style
- ESLint is configured (`eslint.config.mjs`)
- Prettier is not configured in the repo
- Existing code style is mixed (quotes/semicolons/indentation)
- Match surrounding file style instead of mass reformatting
- Keep components/functions focused and readable
- Add comments only for non-obvious logic

## Naming
- Components/types/interfaces: PascalCase
- Variables/functions: camelCase
- True constants: UPPER_SNAKE_CASE
- Component filenames: kebab-case (`login-form.tsx`)
- Route segments: lowercase; dynamic params with `[id]` style

## UI and Styling
- Prefer Tailwind utilities and existing tokens/utilities in `src/app/globals.css`
- Reuse `src/components/ui` primitives before adding new ones
- Use `cn(...)` from `src/lib/utils.ts` for class merging
- Keep responsive behavior explicit (`sm`, `md`, `lg`) on layout-sensitive UI

## Error Handling
- Wrap parse-prone operations (e.g., `JSON.parse`) in try/catch
- Throw clear errors for invalid hook/provider usage
- Always provide loading/error/success states for async UX
- Do not silently swallow recoverable errors

## Data and State
- Current data is mock/in-memory under `src/lib/data`
- Keep selectors/helpers deterministic and side-effect light
- Keep context providers scoped; avoid unnecessary global complexity
- Validate persisted local storage data before using it

## Security
- Never commit secrets/tokens/credentials
- `.env*` is ignored in `.gitignore`
- Document any new required env vars in docs

## Cursor/Copilot Rule Files
Checked locations requested in task:
- `.cursor/rules/`
- `.cursorrules`
- `.github/copilot-instructions.md`

Current status: none of these files exist in this repo.
If any are added later, treat them as higher-priority local instructions and update this file accordingly.

## Agent Final Checklist
1. Run `npm run lint`
2. Run `npm run build`
3. Smoke test touched routes in `npm run dev`
4. Confirm no unrelated file churn
