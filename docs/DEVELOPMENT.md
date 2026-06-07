<!-- generated-by: gsd-doc-writer -->
# Development Guide

This guide details the commands, code styles, and repository conventions for developers contributing to Renjana LMS.

## Local Setup

Ensure you have completed the [Getting Started](GETTING-STARTED.md) guide before continuing.

1. **Install Development Packages**:
   Make sure all dependencies (including `devDependencies`) are installed:
   ```bash
   npm install
   ```
2. **Synchronize DB Client**:
   Run the Prisma generate script:
   ```bash
   npx prisma generate
   ```
3. **Run Dev Mode**:
   ```bash
   npm run dev
   ```

## Build Commands

The following package scripts are configured in `package.json`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Next.js dev server on port `3214` in development mode. |
| `npm run prebuild` | Generates the Prisma client before building the Next.js application. |
| `npm run build` | Compiles the application for production deployment, exporting a standalone output bundle. |
| `npm run start` | Runs the compiled Next.js server on port `3214`. |
| `npm run lint` | Runs ESLint against the source files to verify syntax and code style correctness. |
| `npm run db:seed` | Populates the database with initial mock users, courses, and lessons. |
| `npm run db:backfill:class-group-instructors` | Dry-runs backfilling existing ClassGroups to support multiple instructors. |
| `npm run db:backfill:class-group-instructors:apply` | Applies the ClassGroups multi-instructor migration to the active database. |
| `npm run test` | Executes the Vitest unit/integration test suites once. |
| `npm run test:watch` | Launches the Vitest test runner in interactive watch mode. |

## Code Style

- **Linter**: The project uses **ESLint v9** configured with Next.js flat rules.
  - Configuration file: `eslint.config.mjs`
  - Lint command: `npm run lint`
- **TypeScript**: The project compiles with **TypeScript 5** under strict type-checking mode. Explicit types should be provided for route responses and domain payloads. Avoid the use of `any`.
- **CSS and Styling**: Styled using **Tailwind CSS v4** with PostCSS processing (`postcss.config.mjs`). Lucide React is used for icons.
- **Prettier**: No explicit Prettier configuration is present in the workspace. Developers should match the surrounding formatting and spacing patterns of the file they are editing.

## Branch Conventions

Contributors should follow standard Git branching conventions:

- **Features**: `feat/feature-name` or `feature/feature-name`
- **Bug Fixes**: `bugfix/issue-description` or `fix/issue-description`
- **Documentation**: `docs/update-description`
- **Refactoring**: `refactor/refactor-name`

Make sure branch names are descriptive and lowercase-kebab format.

## PR Process

Before submitting a Pull Request:

1. **Verify Lint & Format**:
   ```bash
   npm run lint
   ```
2. **Verify Tests**:
   Run all Vitest suites and ensure they pass:
   ```bash
   npm run test
   ```
3. **Verify Build**:
   Verify that the production build completes successfully:
   ```bash
   npm run build
   ```
4. **Create PR**:
   - Push your branch to GitHub.
   - Open a Pull Request referencing the issue or milestone you are targeting.
   - Ensure the description lists the changes made and any verification tests performed.
