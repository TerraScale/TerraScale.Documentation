# Draft: Multilingual Site Translation

## Requirements (confirmed)
- translate all content to Brazilian Portuguese and Spanish
- create a language feature to change the language
- make English the default language
- ask many questions and doubts before creating the plan

## Technical Decisions
- intent tier: architecture, because the request affects content architecture, routing, navigation, SEO, and global UI behavior
- planning mode only: produce a decision-complete implementation plan, not code changes
- preliminary architecture recommendation from research: keep English unprefixed, use `/pt-br/` and `/es/` route prefixes for localized pages, and make the content registry locale-aware
- preliminary content recommendation: keep long-form content file-based per locale, keep small UI chrome strings in locale dictionaries

## Research Findings
- `src/content/docs/` is the primary content source, with filesystem-driven navigation built in `src/lib/content/index.ts`
- core rendering path is `src/routes/[...slug]/+page.server.ts` and `src/routes/[...slug]/+page.svelte`, with global shell in `src/routes/+layout.svelte`
- hardcoded English exists across homepage, blog index, roadmap page, header, footer, search UI, error page, and `src/app.html`
- static build pipeline exists for build and typecheck only: `npm run build` and `npm run check`; no unit tests, e2e tests, linting, or CI are present today
- research favors URL-based locale routing for static SvelteKit sites and warns against single-URL locale-adaptive behavior for SEO
- hidden risks identified: `html lang`, canonical/hreflang, mixed-language Pagefind search results, root-relative links, and `en-US` date formatting leakage

## Open Questions
- should localized URLs include locale prefixes or keep one canonical URL with runtime language switching
- should every page be translated at launch, or can untranslated pages temporarily fall back to English
- should blog, roadmap, account, OpenAPI descriptions, and generated image alt text all be translated, or only core docs sections
- should language preference persist only in URL, or also in cookie/local storage/browser-language detection
- is SEO for Portuguese and Spanish a launch requirement, including sitemap, canonical, and hreflang
- should search be locale-scoped so users only see results for the active language
- should the plan include adding test and CI infrastructure as part of this project

## Scope Boundaries
- INCLUDE: full content translation planning, locale architecture, switcher UX, default-English behavior, verification strategy
- EXCLUDE: implementation work in source files during planning
