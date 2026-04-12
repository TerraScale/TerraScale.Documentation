# Multilingual i18n Rollout

## TL;DR
> **Summary**: Translate all TerraScale Documentation content to Brazilian Portuguese and Spanish, create locale-prefixed routing (`/en/`, `/pt-br/`, `/es/`), a header language switcher, locale-scoped search, and full multilingual SEO.
> **Deliverables**: Locale registry, content model refactoring, multilingual SEO (hreflang, canonical, html lang), language switcher UI, translations for all content (67 files), localized 404, locale-scoped Pagefind, multilingual sitemap/llms.txt
> **Effort**: XL
> **Parallel**: YES - 4 waves
> **Critical Path**: T1 -> T2 -> T3/T4/T5 (parallel) -> T6 -> T7-T11 (parallel) -> T12 -> F1-F4

## Context

### Original Request
Translate all content to Brazilian Portuguese and Spanish, create a language switching feature, and make English the default language.

### Interview Summary
- Use prefixed URLs for ALL locales: `/en/`, `/pt-br/`, `/es/`
- Bare `/` redirects to `/en/`
- Keep slugs identical across languages after the locale prefix
- Translation scope includes everything in-repo including blog content
- Missing translations must never render English content on non-English URLs (return 404)
- Language preference is encoded in the URL only (no cookies/localStorage/browser detection)
- Full multilingual SEO is required at launch (hreflang, canonical, html lang)
- Machine translation is acceptable for launch quality
- No test framework or CI setup should be added
- API Explorer chrome is localized, but OpenAPI schema content stays English
- Generated blog cover metadata and image alt text are localized
- Search must be locale-scoped (single Pagefind index filtered by locale)
- Follow repo conventions: Tailwind-only styling, Svelte 5 runes, no em dashes, no scoped CSS

### Must NOT Have
- No runtime preference persistence outside the URL
- No English fallback rendering on `/pt-br/...` or `/es/...`
- No new test runner, e2e framework, lint stack, or CI workflow
- No translation of static/openapi/terrascale.yaml schema descriptions
- No translated slugs
- No duplicate default-locale pages at both `/` and `/en/`
- No hardcoded locale guessing in components or content files

## Execution Strategy

### Wave 1: Foundation
- T1. Locale registry, param matcher, redirect shims, locale-prefixed route skeletons

### Wave 2: Content model + SEO + Navigation (depends on T1, T2)
- T2. Refactor content model into locale-aware mirrored trees
- T3. Centralize multilingual SEO + hreflang + html lang (parallel with T4, T5)
- T4. Add locale context propagation + header language switcher (parallel with T3, T5)
- T5. Make navigation, search, and links locale-safe (parallel with T3, T4)

### Wave 3: Page routing + Localization (depends on T2-T5)
- T6. Move pages under locale-prefixed routes + localize 404
- T7. Localize shared shell UI + component copy (parallel with T8-T11)
- T8. Translate homepage, roadmap, error, API Explorer shell (parallel with T7, T9-T11)
- T9. Translate guides, roadmap, account, about docs (parallel with T7-T8, T10-T11)
- T10. Translate reference docs - keep schema English (parallel with T7-T9, T11)
- T11. Translate blog + localize cover metadata (parallel with T7-T10)

### Wave 4: Launch
- T12. Finish multilingual exports + build + launch QA

### Dependency Matrix
| Task | Depends On | Blocks |
|---|---|---|
| T1 | - | T2, T3, T4, T5 |
| T2 | T1 | T3, T4, T5, T6, T7-T11 |
| T3 | T1, T2 | T6, T8-T11 |
| T4 | T1, T2 | T6, T7 |
| T5 | T1, T2 | T6 |
| T6 | T2-T5 | T7-T11 |
| T7 | T2, T4, T6 | T12 |
| T8 | T1-T3, T6 | T12 |
| T9 | T1, T2, T4, T6 | T12 |
| T10 | T1-T3, T6 | T12 |
| T11 | T1-T3, T6 | T12 |
| T12 | T2-T11 | F1-F4 |

## TODOs

- [x] T1. Locale registry, param matcher, redirect shims, locale-prefixed route skeletons ✅ VERIFIED

  **What was done**: Created `src/lib/i18n/locales.ts` with `LocaleConfig` type, 3 locales (en, pt-br, es), and helper functions (`getLocales`, `getLocale`, `getDefaultLocale`, `isValidLocale`, `toLocalePath`). Created `src/params/locale.ts` param matcher. Created redirect shims for root `/`, legacy catch-all, `/blog/`, `/roadmap/`, `/reference/api/explorer/`. Created locale-prefixed route skeletons under `src/routes/[locale=locale]/` for home, docs catch-all, blog, roadmap, and API explorer. Also extracted `DocsNavTree.svelte`, `MobileNav.svelte`, `navigation.ts` for reuse (scope creep accepted as beneficial).

  **Files created/modified**:
  - `src/lib/i18n/locales.ts` (new)
  - `src/params/locale.ts` (new)
  - `src/routes/+page.server.ts` (modified - redirect to /en/)
  - `src/routes/[...slug]/+page.server.ts` (modified - legacy redirect)
  - `src/routes/blog/+page.server.ts` (modified - redirect to /en/blog/)
  - `src/routes/roadmap/+page.server.ts` (new - redirect to /en/roadmap/)
  - `src/routes/reference/api/explorer/+page.server.ts` (modified - redirect)
  - `src/routes/[locale=locale]/+page.server.ts` (new)
  - `src/routes/[locale=locale]/+page.svelte` (new)
  - `src/routes/[locale=locale]/[...slug]/+page.server.ts` (new)
  - `src/routes/[locale=locale]/[...slug]/+page.svelte` (new)
  - `src/routes/[locale=locale]/blog/+page.server.ts` (new)
  - `src/routes/[locale=locale]/blog/+page.svelte` (new)
  - `src/routes/[locale=locale]/roadmap/+page.server.ts` (new)
  - `src/routes/[locale=locale]/roadmap/+page.svelte` (new)
  - `src/routes/[locale=locale]/reference/api/explorer/+page.server.ts` (new)
  - `src/routes/[locale=locale]/reference/api/explorer/+page.svelte` (new)
  - `src/lib/components/DocsNavTree.svelte` (new - scope creep, accepted)
  - `src/lib/components/MobileNav.svelte` (new - scope creep, accepted)
  - `src/lib/navigation.ts` (new - scope creep, accepted)
  - `src/lib/components/Header.svelte` (modified - scope creep, accepted)
  - `src/lib/components/DocsSidebar.svelte` (modified - scope creep, accepted)
  - `src/routes/+layout.svelte` (modified - scope creep, accepted)

  **Verification**: `npm run check` passes with 0 errors and 0 warnings.

- [x] T2. Refactor content model into locale-aware mirrored trees ✅ VERIFIED

  **What to do**: Restructure the content pipeline in `src/lib/content/index.ts` so that content files can be organized per-locale under `src/content/docs/{locale}/` while keeping the same slug structure. Update `import.meta.glob` patterns, the `getEntryByRoute` function, and the `sidebar` generation to accept a locale parameter. Create the English content tree as the canonical source, with empty directory structures for `pt-br` and `es` that will be populated in T9-T11.

  **Must NOT do**: Do not copy English content into pt-br/es directories yet (that is T9-T11). Do not break existing prerender entries.

- [x] T3. Centralize multilingual SEO + hreflang + html lang ✅ VERIFIED

  **What to do**: Update `src/app.html` to use a dynamic `lang` attribute instead of hardcoded `en`. Add `<link rel="alternate" hreflang="...">` tags to every page. Add canonical URL tags. Create an SEO helper module that generates hreflang/canonical data from the locale registry and current route.

- [x] T4. Add locale context propagation + header language switcher ✅ VERIFIED

  **What to do**: Create a locale context that flows from the `[locale=locale]` route param through to all components. Add a language switcher dropdown in the header that shows current language and links to the same page in other locales. Update `src/lib/navigation.ts` nav items to be locale-aware.

- [x] T5. Make navigation, search, and links locale-safe ✅ VERIFIED

  **What to do**: Update all internal links to use locale-prefixed paths. Configure Pagefind to tag pages by locale and filter search results by current locale. Update sidebar links, prev/next navigation, footer links, and any hardcoded paths.

- [x] T6. Move pages under locale-prefixed routes + localize 404 ✅ VERIFIED

  **What was done**: Created localized error page at `src/routes/[locale=locale]/+error.svelte` with copy for en/pt-br/es. Updated root `src/routes/+error.svelte` with link to `/en/`. All page rendering happens under `[locale=locale]` routes, root routes are redirect shims only.

  **Verification**: `npm run check` passes (0 errors, 0 warnings). `npm run build` passes (135 pages, 3 languages, 3 filters).

- [x] T7. Localize shared shell UI + component copy ✅ VERIFIED

  **What was done**: Created `src/lib/i18n/strings.ts` with typed `UIStrings` covering navigation, header, footer, search, copy, TOC, prev/next, mobile, and docsPage sections for en/pt-br/es. Updated Header, Footer, SearchOverlay, CopyButton, TableOfContents, PrevNextNav, MobileNav to consume localized strings. Refactored `navigation.ts` to use `getNavItems(strings)`, `getStatusLink(strings)`, `getSocialLinks(strings)`. CopyButton accepts `locale` prop passed through dynamic mount in doc page template.

  **Verification**: `npm run check` passes (0 errors, 0 warnings). `npm run build` passes (135 pages, 3 languages).

- [x] T8. Translate homepage, roadmap, error, API Explorer shell ✅ VERIFIED

  **What was done**: Created 12 translated content files (6 per locale): homepage (index.svx) and roadmap (5 files) in pt-br/es. Localized API Explorer chrome via new `explorer` section in strings.ts. Removed .gitkeep files from directories with translated content.

  **Verification**: `npm run check` passes (0 errors, 0 warnings). `npm run build` passes (139 pages, 3 languages, 3 filters).

- [x] T9. Translate guides, account, about docs ✅ VERIFIED

  **What was done**: Created 34 translated content files (17 per locale) covering guides (10), account (5), and about (2) sections. Removed .gitkeep files from directories with translated content.

  **Verification**: `npm run check` passes (0 errors, 0 warnings). `npm run build` passes (205 pages, 3 languages, 8067 words).

- [ ] T10. Translate reference docs - keep schema English

  **What to do**: Machine-translate reference documentation markdown into pt-br and es. Keep the OpenAPI YAML schema (`terrascale.yaml`) in English. Translate only the prose reference pages.

- [ ] T11. Translate blog + localize cover metadata

  **What to do**: Machine-translate all blog posts into pt-br and es. Localize cover metadata, image alt text, and blog-related UI strings. Ensure blog listing pages show only posts for the current locale.

- [ ] T12. Finish multilingual exports + build + launch QA

  **What to do**: Update sitemap.xml to include all locale-prefixed URLs with hreflang annotations. Update llms.txt to be locale-aware. Run full build, verify all locales render correctly, check for 404s, verify redirects, verify search is locale-scoped. Final integration QA.

## Final Verification Wave (MANDATORY: after ALL implementation tasks)
- [ ] F1. Plan Compliance Audit (oracle)
- [ ] F2. Code Quality Review (unspecified-high)
- [ ] F3. Real Manual QA (unspecified-high, includes Playwright for interaction-heavy surfaces)
- [ ] F4. Scope Fidelity Check (deep)

## Success Criteria
- `/` redirects to `/en/`
- `/guides/getting-started/` redirects to `/en/guides/getting-started/`
- `/en/guides/getting-started/` renders English content
- `/pt-br/guides/getting-started/` renders Portuguese content (not English fallback)
- `/es/guides/getting-started/` renders Spanish content (not English fallback)
- Missing pt-br/es pages return 404 (not English fallback)
- Header language switcher switches between locales
- Search results are filtered by current locale
- All pages have correct hreflang and canonical tags
- `<html lang="...">` matches the current locale
- `npm run check` and `npm run build` both pass
