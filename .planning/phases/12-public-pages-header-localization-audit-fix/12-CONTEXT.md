# Phase 12: Public Pages & Header Localization Audit/Fix - Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit and fix dynamic localization/translations in headers, catalog, and public pages (landing page, search catalog, event registration start page).

</domain>

<decisions>
## Implementation Decisions

### Header Navigation Localization
- We must replace hardcoded links (like "Batch & Event", "Pelatihan", "Partners") with dynamic translations.
- We must make sure the `useLanguage` hook is integrated and returns the correct strings based on locale ('en' vs 'id').
- Translate navigation labels in `src/components/ui/site-header.tsx`.

### Public Pages Auditing
- Verify that public catalog does not mix languages.
- Ensure translation files `src/lib/i18n/translations.ts` contain correct keys.

### UI Consistency
- Maintain responsive, modern aesthetics and layout styling.

</decisions>

<canonical_refs>
## Canonical References

### Localization Files
- `src/lib/i18n/translations.ts` — contains locale key/values
- `src/lib/context/language-context.tsx` or similar language context — provides language state

### Target Layout / Header Components
- `src/components/ui/site-header.tsx` — header navigation component

</canonical_refs>

<specifics>
## Specific Ideas
- Check `src/components/ui/site-header.tsx` navigation items.
- Ensure language toggle updates all views dynamically.

</specifics>

<deferred>
## Deferred Ideas
- Learner portal pages and charts are deferred to Phase 13.

</deferred>

---

*Phase: 12-public-pages-header-localization-audit-fix*
*Context gathered: 2026-06-07*
