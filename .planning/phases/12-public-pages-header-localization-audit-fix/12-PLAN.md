# Phase 12 Plan: Public Pages & Header Localization Audit/Fix

## Goal
Audit and fix localization on all public-facing pages and components (Header, Home, Catalog, Event catalog, About, Contact, Career) to resolve mixed English/Indonesian strings in favor of the active selected locale.

## Feasibility
Yes, feasible. We already have `LanguageProvider` and `useLanguage` hook in `src/lib/i18n`. We just need to expand `translations.ts` to include translation keys for all these public views and refactor the components to use `useLanguage()`.

## Scope

### 1. Translation dictionary expansion
Update `src/lib/i18n/translations.ts` to include translations for:
- Navigation header links (Batch & Event, Partners, etc.)
- Home page hero, bento features, curated courses list
- Learning Methods Section
- FAQ questions & answers
- Courses catalog page and events catalog page
- About Us, Career, and Contact pages

### 2. Header and Public Component Updates
Refactor components to import `useLanguage` and retrieve the translation dictionary `t`.
- `src/components/ui/site-header.tsx`: Localize the menu items, dashboard link, and notifications.
- `src/components/ui/learning-methods-section.tsx`: Make it client side (`"use client"`) and translate all labels.
- `src/components/ui/faq-section.tsx`: Translate FAQ questions and answers.

### 3. Public Pages Updates
Add `"use client"` where necessary and localize all text:
- `src/app/page.tsx` (Landing page)
- `src/app/courses/page.tsx` (Courses page)
- `src/app/events/page.tsx` (Events page)
- `src/app/about-us/page.tsx` (About page)
- `src/app/career/page.tsx` (Career page)
- `src/app/contact/page.tsx` (Contact page)

## Execution Steps
1. Add new translation keys to `src/lib/i18n/translations.ts` for English and Indonesian.
2. Refactor `src/components/ui/site-header.tsx` to dynamically render menu item names.
3. Update `src/components/ui/learning-methods-section.tsx` and `src/components/ui/faq-section.tsx` to use translations.
4. Refactor `src/app/page.tsx` to read translations.
5. Refactor `src/app/courses/page.tsx` and `src/app/events/page.tsx` to localize all copy, dynamic unit strings (modul, menit, jam, pendaftar), and date formats.
6. Refactor `src/app/about-us/page.tsx`, `src/app/career/page.tsx`, and `src/app/contact/page.tsx` to be fully localized.
7. Run `npm run lint` and `npm run test` to ensure there are no compilation or test failures.
8. Perform docker-compose build/up to ensure it works correctly under production conditions.

## Verification Plan
- Verify that switching languages dynamically toggles header, hero, bento features, FAQs, and catalogs.
- Check that formatting for dates uses the correct locale (id-ID vs en-US).
- Run `npm run lint` and `npm run build`.
