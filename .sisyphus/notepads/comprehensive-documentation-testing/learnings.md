## Learnings

## 2026-04-12 Task: plan-context
- Site uses SvelteKit with static adapter; `npm run build` outputs to `build/` and runs pagefind for search.
- Preview command is `npm run preview` (wraps `vite preview`).
- Locales: `en` (default), `es`, `pt-br`. All use the same shared page components via `[locale=locale]` routes.
- Responsive breakpoint is `860px` (max-[860px] for mobile, min-[861px] for desktop).
- TOC hides at `1100px` breakpoint.
- Search depends on Pagefind, which is only generated during `npm run build`, so E2E must run against preview output.
- CopyButton uses `data-copy-button` attribute and starts hidden (opacity-0), revealed on hover/focus.
- MobileNav uses `aria-controls="mobile-nav"` on the trigger, `role="dialog"` on the panel, and implements focus trapping.
- LanguageSwitcher uses a dropdown with `role="menu"` and `role="menuitem"`.
- ApiExplorer lazily loads and fetches `/openapi/terrascale.yaml` at runtime.
- LSP errors exist in codebase (ContentEntry type mismatches, navigation exports) but build succeeds; these are pre-existing.

## 2026-04-12 Task: playwright-infrastructure
- Local Playwright runs should target preview output at `http://127.0.0.1:4173` via `npm run build && npm run preview -- --host 127.0.0.1 --port 4173`.
- The initial E2E matrix is Chromium-only across mobile `390x844`, tablet `834x1112`, and desktop `1440x1024` viewports.
- `npx playwright test --config=playwright.config.ts --list` is a safe zero-execution verification step for confirming project wiring and test discovery.

## 2026-04-12 Task: route-inventory-and-helpers
- Build output includes both directory-style `index.html` routes and extra `.html` siblings, so the inventory helper should scan only `index.html` files to avoid duplicate route entries.
- `build/pagefind/` must be skipped explicitly during route inventory walking because Pagefind adds non-routable generated files after `npm run build`.
- Reusable Playwright control guards can validate actionable buttons and same-origin links with `locator.click({ trial: true })`, which catches obscured or disabled controls without mutating page state.

## 2026-04-12 Task: smoke-all-routes
- A route-wide Playwright smoke matrix can be generated directly from `getRoutes()` by flattening the `default`, `en`, `es`, and `pt-br` route groups into per-route test cases with `test.describe.configure({ mode: 'parallel' })`.
- The smoke suite currently exposes a pre-existing preview runtime failure across many routes: `TypeError: i.inherits is not a function` from built chunk `BLRzeCmI.js`, captured by `attachPageErrorListeners(page)` before navigation.
- Verification evidence for Task 3 is saved at `.sisyphus/evidence/task-3-smoke.txt`; the suite did not reach a green run because of the preview runtime error above, not a TypeScript diagnostic issue in the new smoke specs.

## 2026-04-12 Task: client-initial-load-fix
- Route-level sidebar data must stay in `+layout.server.ts` so the client initial load does not pull `$lib/content` into the root mobile navigation path.

## 2026-04-12 Task: redirect-tolerant-smoke
- Smoke navigation should treat 3xx document responses as valid when the final page still renders cleanly, because default-locale routes intentionally redirect into `/en/...`.

## 2026-04-12 Task: fragment-link-smoke-guard
- Broad actionable-control smoke checks should skip fragment-only anchors because in-page docs navigation needs dedicated coverage separate from route render smoke.

## 2026-04-12 Task: task-3-cleanup
- Keep Task 3 cleanup scoped to the intended layout, smoke, and page-guard files, and restore any stray docs or route inventory churn before verification.

## 2026-04-12 Task: mobile-nav-spec
- Mobile nav E2E coverage is more stable on localized getting-started routes than locale roots, and backdrop close in Playwright works reliably via a dispatched click on the overlay button.


## 2026-04-12 Task: roadmap-link-fix
- Updated `src/content/docs/en/blog/introducing-terrascale.md` to point to the stable `/roadmap/` route instead of the draft `/roadmap/public-alpha/` stub.

## 2026-04-12 Task: docs-content-actions
- Docs content-action coverage can reuse localized getting-started pages for code-copy assertions and support pages as optional no-code checks.

## 2026-04-12 Task: docs-navigation-spec
- Shared docs-route Playwright coverage can deterministically prefer `/guides/getting-started/` and fall back to the first locale-intersection route from the build inventory.

## 2026-04-12 Task: page-family-responsive-coverage
- Shared page-family coverage can stay route-driven by combining `default`, `en`, `es`, and `pt-br` variants with project-aware overflow and mobile wrap assertions in one Playwright spec.

 ## 2026-04-12 Task: docs-navigation-selector-fix
 - Prev-next cards render the localized label together with the destination title, so Playwright should match the card link by contained label text instead of exact text.

## 2026-04-12 Task: localized-api-explorer-and-a11y
- Deterministic API explorer coverage is easiest when Playwright fulfills `/openapi/terrascale.yaml` directly, which also makes loading and inline-error assertions stable across locales.

## 2026-04-12 Task: task-9-spec-fixes
- Localized static-only gaps can still be covered by client-side locale switching, while direct-load failure assertions should stay scoped to the prerendered explorer route.
