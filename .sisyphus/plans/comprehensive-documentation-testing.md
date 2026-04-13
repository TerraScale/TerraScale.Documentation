# Comprehensive Documentation Testing Rollout

## TL;DR
> **Summary**: Add a Playwright-based local test stack for the TerraScale documentation site, then cover every generated page plus all shared interactions across mobile, tablet, and desktop Chromium.
> **Deliverables**:
> - Playwright infrastructure, scripts, and preview-based execution
> - Auto-discovered route smoke coverage for the built static site
> - Deep interaction coverage for shared navigation, docs UX, localized flows, and API explorer
> - Accessibility coverage using axe plus keyboard and focus checks
> **Effort**: Large
> **Parallel**: YES - 2 waves
> **Critical Path**: 1 -> 2 -> 3 -> 6/7/8/9 -> F1-F4

## Context
### Original Request
Create really complete testing for all pages and features of the documentation. It must test responsiveness on mobile, tablet, and desktop. It must test that all buttons are fully visible and can be pressed.

### Interview Summary
- Coverage depth is smoke-test every page, plus deep shared-feature coverage.
- Quality gates are responsiveness, interaction, and accessibility.
- Browser target is Chromium-first.
- Add local test infrastructure only. CI is explicitly out of scope.
- Deep coverage must run across `en`, `es`, and `pt-br`.

### Metis Review, gaps addressed
- Locked route inventory to the production build output so coverage follows the actual static deployable site.
- Locked final execution to `npm run build` plus `vite preview`, because search depends on the generated `/pagefind` assets and the site deploys as static output.
- Locked accessibility to `axe` plus scripted keyboard and focus checks.
- Locked API explorer error-path coverage to deterministic network interception instead of live backend dependence.
- Locked responsive verification to fixed Chromium projects with exact viewport sizes and a reusable visibility or overflow helper.

## Work Objectives
### Core Objective
Create a decision-complete execution plan for adding local end-to-end coverage that validates every documentation page and all shared UI behaviors across responsive breakpoints, with deterministic accessibility and interaction checks.

### Deliverables
- `playwright.config.ts` with preview-based execution, artifacts, and three Chromium projects.
- `package.json` scripts for targeted and full E2E runs.
- `tests/e2e/` structure with shared fixtures, helpers, and specs.
- Build-output route inventory helper that auto-discovers generated HTML pages.
- Smoke coverage for all generated routes.
- Deep shared-feature coverage for header, search, mobile nav, locale switching, docs navigation, docs content actions, landing pages, blog, roadmap, and API explorer.
- Accessibility suite with `axe` plus keyboard and focus assertions.

### Definition of Done (verifiable conditions with commands)
- `npm run check` exits `0`.
- `npm run test:e2e:smoke` exits `0` against preview output.
- `npm run test:e2e:shared` exits `0` against preview output.
- `npm run test:e2e:a11y` exits `0` against preview output.
- `npm run test:e2e:all` exits `0`, writes `playwright-report/index.html`, and saves failures under `test-results/`.

### Must Have
- Route inventory derived from the built static output in `build/`, not a hand-maintained list.
- Mobile, tablet, and desktop Chromium projects with exact sizes: `390x844`, `834x1112`, and `1440x1024`.
- Zero uncaught page errors and zero `console.error` messages across all suites.
- Button and link visibility checks that fail if interactive controls overflow, clip outside the viewport, or are disabled when they should be actionable.
- Shared-feature suites parameterized across `en`, `es`, and `pt-br`.
- Search coverage executed only against preview output so Pagefind is present.
- Accessibility coverage using both `axe` and keyboard or focus assertions.

### Must NOT Have
- No CI workflow changes.
- No visual regression tooling.
- No non-Chromium browser work in this rollout.
- No Lighthouse, SEO, performance, or link-crawler expansion.
- No hand-written duplicate specs for every locale when one parameterized spec can cover the same behavior.
- No vague manual verification steps.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after, Playwright E2E with `@axe-core/playwright`.
- QA policy: every task includes executable browser or command-line scenarios.
- Preview policy: all E2E commands run against `npm run build && npm run preview -- --host 127.0.0.1 --port 4173` through Playwright `webServer`.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`
- Failure artifacts: `playwright-report/` and `test-results/`

## Execution Strategy
### Parallel Execution Waves
Wave 1: infrastructure, route inventory, full-route smoke coverage, header-search-locale coverage, mobile-nav coverage
Wave 2: docs navigation coverage, docs content-action coverage, landing-page-family coverage, API explorer plus accessibility coverage

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
| --- | --- | --- |
| 1 | none | 2, 3, 4, 5, 6, 7, 8, 9 |
| 2 | 1 | 3, 6, 7, 8, 9 |
| 3 | 1, 2 | 6, 7, 8, 9 |
| 4 | 1 | 9 |
| 5 | 1 | 9 |
| 6 | 1, 2, 3 | 9 |
| 7 | 1, 2, 3 | 9 |
| 8 | 1, 2, 3 | 9 |
| 9 | 1, 2, 3, 4, 5, 6, 7, 8 | F1, F2, F3, F4 |

### Agent Dispatch Summary
| Wave | Task Count | Categories |
| --- | --- | --- |
| 1 | 5 | unspecified-high |
| 2 | 4 | unspecified-high, deep |
| Final | 4 | oracle, unspecified-high, deep |

## TODOs
> Implementation + test = ONE task. Never separate.
> Every task includes agent profile, references, acceptance criteria, and QA scenarios.

- [x] 1. Add local Playwright infrastructure for preview-based docs testing

  **What to do**: Add Playwright and `@axe-core/playwright` to `package.json`, create `playwright.config.ts`, and add `test:e2e:smoke`, `test:e2e:shared`, `test:e2e:a11y`, and `test:e2e:all` scripts. Configure Playwright to run Chromium only, with exact projects `mobile-chromium` at `390x844`, `tablet-chromium` at `834x1112`, and `desktop-chromium` at `1440x1024`. Use `webServer` to run `npm run build && npm run preview -- --host 127.0.0.1 --port 4173`, set `baseURL` to `http://127.0.0.1:4173`, emit the HTML report to `playwright-report/`, and retain screenshots or traces only on failure or retry.
  **Must NOT do**: Do not add CI workflow files, Firefox or WebKit projects, visual regression tooling, or live-server-only execution.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: multi-file test bootstrap touching package scripts, config, and runner conventions.
  - Skills: [`playwright`] - needed for Playwright config correctness and browser-test conventions.
  - Omitted: [`review-work`] - review happens in the final wave, not during implementation.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5, 6, 7, 8, 9 | Blocked By: none

  **References**:
  - Pattern: `package.json:6-13` - current repo commands already separate `build`, `preview`, and `check`, so new E2E scripts must align with these entry points.
  - Pattern: `src/routes/+layout.svelte:128-137` - all user-visible pages render through the shared `<main>` inside the root layout.
  - API/Type: `src/lib/i18n/locales.ts:7-30` - locale registry is fixed to `en`, `pt-br`, and `es`, which the config and suites must support.
  - External: `https://playwright.dev/docs/test-configuration` - canonical config structure for projects, reporters, and `webServer`.

  **Acceptance Criteria**:
  - [ ] `package.json` defines the four E2E scripts exactly as this plan specifies.
  - [ ] `playwright.config.ts` defines only `mobile-chromium`, `tablet-chromium`, and `desktop-chromium`.
  - [ ] `npx playwright test --config=playwright.config.ts --list` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Playwright config loads successfully
    Tool: Bash
    Steps: run `npx playwright test --config=playwright.config.ts --list | tee .sisyphus/evidence/task-1-playwright-config.txt`
    Expected: exit code 0, output lists the three Chromium projects, and no unknown-project errors appear
    Evidence: .sisyphus/evidence/task-1-playwright-config.txt

  Scenario: Unsupported browser project is rejected
    Tool: Bash
    Steps: run `npx playwright test --config=playwright.config.ts --project=firefox --list > .sisyphus/evidence/task-1-playwright-config-error.txt 2>&1; test $? -ne 0`
    Expected: command fails and output states that project `firefox` does not exist
    Evidence: .sisyphus/evidence/task-1-playwright-config-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): add playwright infrastructure for docs site` | Files: `package.json`, `playwright.config.ts`, initial `tests/e2e/**`

- [x] 2. Create build-output route inventory and reusable page guards

  **What to do**: Create a Node-side route inventory helper under `tests/e2e/support/route-inventory.mjs` that scans the built static output under `build/`, normalizes each generated HTML file to a site route, excludes non-routable assets such as `404.html`, and groups routes by locale. Add reusable Playwright helpers for `console.error` and page-error tracking, horizontal-overflow detection, and trial-click visibility checks for visible interactive controls. Expose a locale-string fixture that reads the exact labels from `src/lib/i18n/strings.ts` so specs can use deterministic localized accessible names instead of hard-coded guesses.
  **Must NOT do**: Do not maintain a hand-written route list, do not import Svelte app modules through fragile alias hacks in Node-only helpers, and do not treat external social links as navigation assertions.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: requires filesystem route derivation plus reusable E2E helper design.
  - Skills: [`playwright`] - needed for actionability and visibility helper conventions.
  - Omitted: [`review-work`] - not needed during implementation.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 6, 7, 8, 9 | Blocked By: 1

  **References**:
  - Pattern: `package.json:8-10` - `build` writes static output and `preview` serves it, so the inventory source must be the generated `build/` tree.
  - Pattern: `src/lib/content/index.ts:282-302` - route normalization in app code lowercases path segments and maps content files to trailing-slash routes.
  - Pattern: `src/lib/content/index.ts:643-649` - public prerender entries exclude `/` and represent the content routes that will be emitted into the static build.
  - Pattern: `src/lib/i18n/strings.ts:3-91` - localized labels are centralized and should drive accessible-name assertions.
  - API/Type: `src/lib/i18n/locales.ts:45-53` - locale-prefixed paths follow `/${prefix}/.../`, which the grouping helper must respect.

  **Acceptance Criteria**:
  - [ ] `tests/e2e/support/route-inventory.mjs` prints machine-readable route data when run directly.
  - [ ] Inventory output includes default routes plus locale-prefixed routes for `en`, `es`, and `pt-br`.
  - [ ] Shared helpers exist for page errors, console errors, overflow checks, and trial-click actionability checks.

  **QA Scenarios**:
  ```
  Scenario: Build inventory discovers generated routes
    Tool: Bash
    Steps: run `npm run build && node tests/e2e/support/route-inventory.mjs | tee .sisyphus/evidence/task-2-route-inventory.json`
    Expected: exit code 0, JSON includes a non-zero `routes` array, and locale groups include `en`, `es`, and `pt-br`
    Evidence: .sisyphus/evidence/task-2-route-inventory.json

  Scenario: Inventory excludes non-routable build artifacts
    Tool: Bash
    Steps: run `node tests/e2e/support/route-inventory.mjs | tee .sisyphus/evidence/task-2-route-inventory-filtered.json && ! grep -q '404.html' .sisyphus/evidence/task-2-route-inventory-filtered.json`
    Expected: output contains no `404.html` entries and no asset-file routes
    Evidence: .sisyphus/evidence/task-2-route-inventory-filtered.json
  ```

  **Commit**: YES | Message: `test(e2e): add build route inventory helpers` | Files: `tests/e2e/support/**`

- [x] 3. Add smoke coverage for every generated route on all three viewports

  **What to do**: Create `tests/e2e/smoke/all-routes.spec.ts` that consumes the build inventory and iterates every route for `mobile-chromium`, `tablet-chromium`, and `desktop-chromium`. For each route, attach the console and page-error guards before navigation, visit the route, assert the response is OK, assert `main` is visible, assert no horizontal overflow, and run trial-click actionability checks against all visible in-flow buttons and same-origin links inside `header` and `main`. Add explicit negative coverage for an invalid slug so 404 behavior is verified separately from generated-route smoke coverage.
  **Must NOT do**: Do not hard-code per-page smoke lists, do not skip mobile or tablet runs, and do not perform real clicks that navigate away when a trial click is sufficient to validate pressability.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: broad route-matrix coverage using the helpers from tasks 1 and 2.
  - Skills: [`playwright`] - required for project-matrix E2E implementation.
  - Omitted: [`review-work`] - final review belongs in the verification wave.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 6, 7, 8, 9 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/routes/+layout.svelte:126-137` - header, mobile nav, search overlay, and toast wrap every route through the root layout.
  - Pattern: `src/routes/+layout.svelte:100-137` - root container uses `overflow-x-clip`, so smoke coverage must catch any content that still overflows or clips interactives.
  - Pattern: `src/routes/+page.svelte:138-153` - landing-page CTAs are standard visible and focusable link buttons that should pass actionability checks.
  - Pattern: `src/routes/blog/+page.svelte:32-79` - blog cards are route entries rendered as linked articles and must remain clickable across breakpoints.
  - Pattern: `src/routes/roadmap/+page.svelte:77-92` - roadmap page contains CTA buttons that must remain visible and actionable.

  **Acceptance Criteria**:
  - [ ] `tests/e2e/smoke/all-routes.spec.ts` iterates the full build-derived route list, not a hand-maintained array.
  - [ ] The smoke suite runs on all three Chromium projects.
  - [ ] `npm run test:e2e:smoke` exits `0`.
  - [ ] Invalid-slug coverage asserts the expected non-OK response.

  **QA Scenarios**:
  ```
  Scenario: Smoke-test every generated route
    Tool: Bash
    Steps: run `npm run test:e2e:smoke | tee .sisyphus/evidence/task-3-smoke.txt`
    Expected: exit code 0, every built route is visited on mobile, tablet, and desktop Chromium, and no console or page errors are reported
    Evidence: .sisyphus/evidence/task-3-smoke.txt

  Scenario: Invalid doc slug fails cleanly
    Tool: Playwright
    Steps: navigate to `/definitely-not-a-real-doc/`, capture the main response status, and inspect the rendered page state
    Expected: response is not OK, status is 404 or equivalent not-found result, and the app does not throw an uncaught page error
    Evidence: .sisyphus/evidence/task-3-smoke-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): smoke test all generated docs routes` | Files: `tests/e2e/smoke/**`, shared helpers touched by the smoke suite

- [x] 4. Cover desktop header, search overlay, and locale switching across all locales

  **What to do**: Create `tests/e2e/shared/header-search-locale.spec.ts` for desktop Chromium. Use the locale-string fixture so selectors use the exact localized accessible names from `src/lib/i18n/strings.ts`. Assert the desktop header nav is visible, the mobile trigger is hidden, the search trigger opens the search dialog, the search input accepts a query, search results render from Pagefind, and the close button dismisses the dialog. Add locale-switcher coverage that opens the desktop language menu, selects a target locale label, verifies the URL changes to the expected locale-prefixed route, and verifies the same logical page remains selected for shared pages such as home, blog, roadmap, and API explorer.
  **Must NOT do**: Do not hard-code English-only labels, do not run search against `vite dev`, and do not treat the locale switcher as a simple visual-only control.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: shared desktop interaction coverage with localized selectors and preview-backed search.
  - Skills: [`playwright`] - required for dialog, result-list, and locale-navigation assertions.
  - Omitted: [`review-work`] - review belongs in the final wave.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 9 | Blocked By: 1

  **References**:
  - Pattern: `src/lib/components/Header.svelte:30-111` - desktop header renders the search trigger, primary nav, locale switcher, and mobile-nav trigger visibility rules.
  - Pattern: `src/lib/components/LanguageSwitcher.svelte:36-71` - desktop locale switcher is a button-driven dropdown with `role="menu"` and `role="menuitem"` links.
  - Pattern: `src/lib/components/SearchOverlay.svelte:212-269` - search renders as a `role="dialog"` with a localized input label and result cards.
  - Pattern: `src/lib/components/SearchOverlay.svelte:77-97` - Pagefind loads from `/pagefind/pagefind.js`, which is why preview output is mandatory.
  - API/Type: `src/lib/i18n/strings.ts:13-20` and `src/lib/i18n/strings.ts:45-58` - exact accessible names for header and search controls come from these localized keys.

  **Acceptance Criteria**:
  - [ ] Desktop header spec runs against `en`, `es`, and `pt-br`.
  - [ ] Search dialog opens, searches, and closes successfully from preview output.
  - [ ] Locale switching preserves the logical target page for shared routes.
  - [ ] Search empty-state and no-results-state coverage assert the localized fallback cards without errors.

  **QA Scenarios**:
  ```
  Scenario: Desktop search and locale switching work in every locale
    Tool: Playwright
    Steps: for each locale route (`/`, `/es/`, `/pt-br/` and their shared-page variants), click the desktop search button by its localized accessible name, type `roadmap`, assert a result card linking to the roadmap appears, close the dialog, open the language menu, choose another locale label, and confirm the destination route is the same logical page in the target locale
    Expected: search dialog opens and closes cleanly, search results render from Pagefind, locale change updates the pathname correctly, and no console or page errors occur
    Evidence: .sisyphus/evidence/task-4-header-search-locale.txt

  Scenario: Search empty and no-results states render cleanly
    Tool: Playwright
    Steps: open the search dialog, assert the localized empty-state card before typing, then enter a guaranteed nonsense query such as `zzzz-terrascale-no-match`, and inspect the localized no-results card text
    Expected: the localized empty-state and no-results-state cards render, the page does not crash, and the dialog remains dismissible
    Evidence: .sisyphus/evidence/task-4-header-search-locale-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): cover header search and locale switching` | Files: `tests/e2e/shared/header-search-locale.spec.ts`, supporting fixtures or helpers

- [x] 5. Cover mobile and tablet navigation behavior end to end

  **What to do**: Create `tests/e2e/shared/mobile-nav.spec.ts` that runs on `mobile-chromium` and `tablet-chromium` for all locales. Use `button[aria-controls="mobile-nav"]` as the open trigger, assert the dialog appears with `role="dialog"`, assert focus moves to the close button, assert `document.body.style.overflow` becomes `hidden`, assert tab trapping stays within the dialog, assert `Escape` closes the dialog and returns focus to the trigger, and assert the backdrop button also closes it. Validate that the mobile search button, primary nav links, docs tree, social links, and locale links are visible and trial-click actionable.
  **Must NOT do**: Do not skip tablet coverage, do not rely on raw pixel snapshots, and do not assume focus behavior without asserting it.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: responsive interaction coverage with focus management and keyboard assertions.
  - Skills: [`playwright`] - required for keyboard, focus, and viewport-specific behavior.
  - Omitted: [`review-work`] - not needed during implementation.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 9 | Blocked By: 1

  **References**:
  - Pattern: `src/lib/components/Header.svelte:102-111` - mobile-nav trigger exposes `aria-controls="mobile-nav"` and localized `aria-label` values.
  - Pattern: `src/lib/components/MobileNav.svelte:34-58` - helper functions define focusable elements and return focus to the trigger.
  - Pattern: `src/lib/components/MobileNav.svelte:65-95` - `Escape` and `Tab` handling implement the focus trap behavior.
  - Pattern: `src/lib/components/MobileNav.svelte:98-117` - opening the dialog locks body scrolling and focuses the close button.
  - Pattern: `src/lib/components/MobileNav.svelte:120-272` - dialog markup, close backdrop, search button, docs tree, social links, and locale links are all part of the mobile panel.

  **Acceptance Criteria**:
  - [ ] Mobile-nav coverage runs on both mobile and tablet Chromium.
  - [ ] Open, focus trap, backdrop close, and `Escape` close behaviors are all asserted.
  - [ ] All visible actionable controls inside the dialog pass trial-click actionability checks.

  **QA Scenarios**:
  ```
  Scenario: Mobile nav opens, traps focus, and closes correctly
    Tool: Playwright
    Steps: open a locale root route on `mobile-chromium` and `tablet-chromium`, click `button[aria-controls="mobile-nav"]`, assert `#mobile-nav[role="dialog"]` is visible, press `Tab` repeatedly to confirm focus stays within the panel, press `Escape`, and verify focus returns to the original trigger
    Expected: dialog opens, focus starts on the close button, body scrolling is locked while open, and closing restores trigger focus
    Evidence: .sisyphus/evidence/task-5-mobile-nav.txt

  Scenario: Backdrop click closes the mobile nav without errors
    Tool: Playwright
    Steps: open the mobile nav, click the full-screen backdrop button, then inspect dialog visibility and focus state
    Expected: dialog closes, trigger regains focus, and no console or page errors occur
    Evidence: .sisyphus/evidence/task-5-mobile-nav-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): cover mobile and tablet navigation flows` | Files: `tests/e2e/shared/mobile-nav.spec.ts`, related helpers

- [x] 6. Cover docs sidebar, table of contents, anchors, and prev-next navigation

  **What to do**: Create `tests/e2e/shared/docs-navigation.spec.ts` for a representative docs route intersection that exists across `en`, `es`, and `pt-br`, preferring `/guides/getting-started/` if present in all locale groups and otherwise selecting the first locale-shared docs route from the build inventory. On desktop Chromium, assert the docs sidebar renders, the current page is visibly active, expandable groups toggle through `aria-expanded`, the table of contents appears only when headings exist, clicking the first TOC link updates `location.hash` and scrolls the heading into view below the sticky header, and prev-next links move between adjacent docs pages. Add a boundary check that continues following previous or next until one edge omits the corresponding link, then asserts the missing control is truly absent instead of broken.
  **Must NOT do**: Do not use a single hard-coded English docs route unless the inventory intersection proves it exists in all three locales, and do not fail pages that legitimately have no TOC.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this task combines route selection logic, docs-layout behavior, and boundary navigation coverage.
  - Skills: [`playwright`] - required for scroll, hash, and navigation assertions.
  - Omitted: [`review-work`] - review stays in the final wave.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/routes/[...slug]/+page.svelte:180-200` - docs pages render sidebar, content article, prev-next nav, and TOC in the non-blog path.
  - Pattern: `src/lib/components/DocsNavTree.svelte:63-140` - sidebar sections and groups toggle through button controls with `aria-expanded`.
  - Pattern: `src/lib/components/TableOfContents.svelte:10-20` - TOC renders only when `items.length` is truthy and is hidden below the desktop breakpoint.
  - Pattern: `src/lib/components/PrevNextNav.svelte:17-35` - prev-next cards render conditionally depending on available neighbors.
  - API/Type: `src/lib/i18n/strings.ts:65-70` - localized TOC and prev-next labels should drive assertions.

  **Acceptance Criteria**:
  - [ ] Representative docs-route selection is derived from the inventory intersection across all locales.
  - [ ] Sidebar, TOC, anchor, and prev-next behavior are asserted on desktop Chromium.
  - [ ] Pages without TOC headings pass by asserting TOC absence instead of failing.
  - [ ] Boundary docs pages confirm missing previous or next controls are absent, not broken.

  **QA Scenarios**:
  ```
  Scenario: Docs navigation surfaces behave correctly on desktop
    Tool: Playwright
    Steps: for each locale, open the selected shared docs route on `desktop-chromium`, assert the sidebar is visible, toggle a collapsible section, click the first TOC link when present, confirm `location.hash` updates and the target heading is in view, then use prev-next cards to move between adjacent docs pages
    Expected: active docs navigation is visible, TOC links work when headings exist, and prev-next cards navigate without console or page errors
    Evidence: .sisyphus/evidence/task-6-docs-navigation.txt

  Scenario: Docs pages without TOC or edge prev-next links stay valid
    Tool: Playwright
    Steps: navigate until a docs page has no TOC or lacks one of the prev-next links, then assert the absent surface is genuinely missing while the rest of the page remains functional
    Expected: no false failure for missing TOC or edge navigation, and the page still passes layout and interaction checks
    Evidence: .sisyphus/evidence/task-6-docs-navigation-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): cover docs navigation flows` | Files: `tests/e2e/shared/docs-navigation.spec.ts`, route-selection helper updates if needed

- [x] 7. Cover docs content actions, code-copy behavior, and responsive control visibility

  **What to do**: Create `tests/e2e/shared/docs-content-actions.spec.ts` that selects, per locale, one docs route containing at least one `[data-code-block]` and one docs route without code blocks if available. Hover the first code block, assert `[data-copy-button]` becomes visible and remains within the viewport, grant clipboard permissions, click the copy button, assert the clipboard text matches the rendered code block text, and assert the localized success toast appears. Reuse the visibility helper to assert that article-level buttons, links, and copy controls stay fully visible and trial-click actionable on mobile, tablet, and desktop, with no horizontal overflow.
  **Must NOT do**: Do not rely on screenshots for visibility verification, do not use manual clipboard inspection, and do not treat hidden-on-load copy buttons as failures before the code block is hovered or focused.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: combines responsive docs-content verification with clipboard interaction.
  - Skills: [`playwright`] - required for hover, clipboard, and viewport assertions.
  - Omitted: [`review-work`] - review happens later.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/routes/[...slug]/+page.svelte:57-99` - copy buttons are mounted dynamically onto `[data-code-block]` elements after content render.
  - Pattern: `src/routes/[...slug]/+page.svelte:194-199` - docs article content and prev-next controls live in the main docs content column.
  - Pattern: `src/lib/components/CopyButton.svelte:27-33` - copy control uses `data-copy-button`, localized `aria-label`, and starts visually hidden until interaction states reveal it.
  - API/Type: `src/lib/i18n/strings.ts:59-64` - localized copy-button labels and success text must drive assertions.
  - Pattern: `src/routes/+layout.svelte:100-101` - root layout clips overflow, so explicit visibility checks are required to catch clipped content actions.

  **Acceptance Criteria**:
  - [ ] Code-copy coverage runs on a code-bearing docs page for every locale.
  - [ ] Clipboard assertions compare copied text to the rendered code-block contents.
  - [ ] Responsive visibility checks cover mobile, tablet, and desktop for article-level controls.
  - [ ] A no-code page, when available, asserts the copy button is absent instead of failing.

  **QA Scenarios**:
  ```
  Scenario: Copy button works on docs code blocks
    Tool: Playwright
    Steps: for each locale, open a docs route containing `[data-code-block]`, hover the first code block, click `[data-copy-button]`, read the clipboard, and compare it to the visible code text
    Expected: copy button becomes visible, remains inside the viewport, clipboard text matches the code block, localized success feedback appears, and no console or page errors occur
    Evidence: .sisyphus/evidence/task-7-docs-content-actions.txt

  Scenario: Docs pages without code blocks stay valid
    Tool: Playwright
    Steps: open a docs route without `[data-code-block]` when the inventory exposes one, then verify no copy button is rendered while the page still passes overflow and actionability checks
    Expected: copy button is absent, no false failure occurs, and all visible article controls remain actionable
    Evidence: .sisyphus/evidence/task-7-docs-content-actions-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): cover docs content actions and visibility` | Files: `tests/e2e/shared/docs-content-actions.spec.ts`, any helper updates

- [x] 8. Cover localized home, blog, and roadmap page families across breakpoints

  **What to do**: Create `tests/e2e/shared/page-families.spec.ts` that visits the home page, blog index, and roadmap page for default English plus `/en/`, `/es/`, and `/pt-br/` localized variants. On all three viewport projects, assert hero and CTA links on the home page are visible and trial-click actionable, assert blog cards and tag chips render without overflow and each visible card link is actionable, and assert roadmap stage chips plus the `Join Discord` and `Get Started` CTAs remain visible and actionable. Include explicit mobile assertions that CTA rows wrap without clipping or horizontal scrolling.
  **Must NOT do**: Do not cover only the default locale, do not skip localized wrappers that reuse the shared page component, and do not assume a desktop layout proves responsive correctness.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: wide route-family coverage over shared marketing-style layouts and responsive CTA groups.
  - Skills: [`playwright`] - needed for matrixed responsive actionability checks.
  - Omitted: [`review-work`] - not part of implementation.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/routes/+page.svelte:138-153` - home hero CTA buttons must remain visible and actionable.
  - Pattern: `src/routes/+page.svelte:207-224` - documentation exploration cards are interactive route links that must stay clickable across breakpoints.
  - Pattern: `src/routes/blog/+page.svelte:32-79` - blog index renders article cards as linked surfaces with metadata and tags.
  - Pattern: `src/routes/roadmap/+page.svelte:36-92` - roadmap stages and CTA buttons are responsive interactive elements that must not clip.
  - Pattern: `src/routes/[locale=locale]/+page.svelte:13-21`, `src/routes/[locale=locale]/blog/+page.svelte:13-21`, `src/routes/[locale=locale]/roadmap/+page.svelte:13-21` - localized routes wrap the shared page components and add canonical or hreflang metadata.

  **Acceptance Criteria**:
  - [ ] Home, blog, and roadmap coverage runs for default and locale-prefixed variants.
  - [ ] All visible CTA and card links pass viewport visibility and trial-click checks on all three projects.
  - [ ] Mobile and tablet runs assert no horizontal overflow for these page families.

  **QA Scenarios**:
  ```
  Scenario: Localized page families stay responsive and actionable
    Tool: Playwright
    Steps: open `/`, `/en/`, `/es/`, `/pt-br/`, and equivalent `/blog/` and `/roadmap/` routes on all three projects, then verify each visible CTA or card link in `main` is inside the viewport and passes `click({ trial: true })`
    Expected: all CTAs and cards are fully visible, actionable, and free of horizontal overflow across mobile, tablet, and desktop Chromium
    Evidence: .sisyphus/evidence/task-8-page-families.txt

  Scenario: Narrow mobile layout wraps CTA groups cleanly
    Tool: Playwright
    Steps: on `mobile-chromium`, inspect the home and roadmap CTA groups after load and compare each control bounding box to the viewport width
    Expected: controls wrap to new rows as needed, none are clipped, and the page does not scroll horizontally
    Evidence: .sisyphus/evidence/task-8-page-families-error.txt
  ```

  **Commit**: YES | Message: `test(e2e): cover responsive page-family interactions` | Files: `tests/e2e/shared/page-families.spec.ts`, helper changes if needed

- [x] 9. Cover API explorer states and add the accessibility suite

  **What to do**: Create `tests/e2e/shared/api-explorer.spec.ts` plus `tests/e2e/a11y/representative-pages.spec.ts`. For the API explorer, test the localized route family on all locales, assert the loading state resolves into the explorer content, expand the first operation card, and verify method badges, paths, and response sections render. Add deterministic error-path coverage by intercepting `/openapi/terrascale.yaml` with a failed response and asserting the inline error copy renders without an uncaught page error. For accessibility, run `axe` plus keyboard and focus assertions on representative pages for each route family: home, shared docs page, blog index, roadmap, and API explorer. Include focus checks for the search dialog close button, mobile-nav trigger and close button, locale-switcher menu items, TOC links, and copy buttons.
  **Must NOT do**: Do not rely on a live backend for explorer data, do not stop at `axe` alone, and do not limit accessibility coverage to English.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: combines deterministic data interception, localized route coverage, and cross-surface accessibility auditing.
  - Skills: [`playwright`] - required for route interception, keyboard assertions, and `axe` execution.
  - Omitted: [`review-work`] - review happens in the final wave.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: F1, F2, F3, F4 | Blocked By: 1, 2, 3, 4, 5, 6, 7, 8

  **References**:
  - Pattern: `src/routes/reference/api/explorer/+page.svelte:12-15` and `src/routes/reference/api/explorer/+page.svelte:36-41` - route lazily loads `ApiExplorer` and shows a loading message until it resolves.
  - Pattern: `src/lib/components/ApiExplorer.svelte:283-299` - explorer fetches `/openapi/terrascale.yaml` and sets either populated state or an inline error state.
  - Pattern: `src/lib/components/ApiExplorer.svelte:302-416` - populated explorer renders grouped operation cards with expandable details.
  - Pattern: `src/routes/[locale=locale]/reference/api/explorer/+page.svelte:13-21` - localized explorer routes wrap the shared explorer page.
  - Pattern: `src/lib/components/SearchOverlay.svelte:213-236`, `src/lib/components/MobileNav.svelte:120-166`, `src/lib/components/LanguageSwitcher.svelte:37-71`, `src/lib/components/TableOfContents.svelte:10-20`, `src/lib/components/CopyButton.svelte:27-33` - these are the keyboard or focus surfaces the a11y suite must cover.

  **Acceptance Criteria**:
  - [ ] API explorer success and error states are both covered deterministically.
  - [ ] Accessibility suite runs `axe` on representative pages across all locales.
  - [ ] Keyboard and focus checks cover search, mobile nav, locale switcher, TOC, and copy button behavior.
  - [ ] `npm run test:e2e:a11y` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: API explorer loads and expands operations correctly
    Tool: Playwright
    Steps: open each localized API explorer route, wait for the loading message to be replaced, expand the first operation card, and assert method badge, path, parameters or responses, and operation details are visible
    Expected: explorer content loads from the checked-in OpenAPI file, expansion works, and no console or page errors occur
    Evidence: .sisyphus/evidence/task-9-api-explorer-a11y.txt

  Scenario: Explorer error state and accessibility suite both pass deterministically
    Tool: Playwright
    Steps: intercept `/openapi/terrascale.yaml` with a failed response to assert the inline error state, then run the `axe` and keyboard suites on representative pages for each locale
    Expected: explorer error copy renders without crashing, `axe` finds no blocking violations, and keyboard or focus flows pass for search, mobile nav, locale switcher, TOC, and copy controls
    Evidence: .sisyphus/evidence/task-9-api-explorer-a11y-error.txt
  ```

  **Commit**: YES | Message: `test(a11y): cover explorer states and accessibility flows` | Files: `tests/e2e/shared/api-explorer.spec.ts`, `tests/e2e/a11y/**`, helper or fixture updates

## Final Verification Wave
> 4 review agents run in parallel after all implementation tasks. All must approve. Present consolidated results to the user and wait for explicit approval before marking execution complete.
- [ ] F1. Plan Compliance Audit - oracle

  **What to do**: Compare implemented changes against every task in this plan. Flag any missing file, missing script, missing suite, or deviation from the fixed viewport and preview strategy.
  **Must NOT do**: Do not approve partial coverage or substitute manual checks for executable evidence.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: dispatch this task to the `oracle` subagent for strict read-only comparison against the full plan.
  - Skills: []
  - Omitted: [`playwright`] - browser execution belongs in F3.

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7, 8, 9

  **Acceptance Criteria**:
  - [ ] Auditor report lists each task as pass or fail with file references and no unresolved gaps.

- [ ] F2. Code Quality Review

  **What to do**: Review test structure, helper quality, flake resistance, selector discipline, and maintainability.
  **Must NOT do**: Do not expand scope into new frameworks or unrelated refactors.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: broad code review across config, helpers, and specs.
  - Skills: []
  - Omitted: [`playwright`] - this review is code-focused, not browser-driven.

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7, 8, 9

  **Acceptance Criteria**:
  - [ ] Review confirms no brittle selector strategy, no hidden live-network dependency, and no dead or duplicate suites.

- [ ] F3. Real Manual QA

  **What to do**: Re-run the full Playwright matrix and inspect the generated artifacts for any failed or flaky interaction.
  **Must NOT do**: Do not skip failed suites or ignore console or page errors.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: hands-on execution and artifact inspection.
  - Skills: [`playwright`] - mandatory for browser verification.
  - Omitted: []

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7, 8, 9

  **Acceptance Criteria**:
  - [ ] `npm run test:e2e:all` exits `0`, and failure artifact directories are empty or absent.

- [ ] F4. Scope Fidelity Check

  **What to do**: Confirm the rollout includes local infra only and excludes CI, visual regression, non-Chromium, performance, SEO, and link-crawler work.
  **Must NOT do**: Do not approve extra work that changed the scope contract.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: requires careful boundary checking against request and interview decisions.
  - Skills: []
  - Omitted: [`playwright`] - no browser execution needed.

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: none | Blocked By: 1, 2, 3, 4, 5, 6, 7, 8, 9

  **Acceptance Criteria**:
  - [ ] Reviewer confirms no out-of-scope deliverables were added and no in-scope deliverables were missed.

## Commit Strategy
- Commit 1: `test(e2e): add playwright infrastructure for docs site`
- Commit 2: `test(e2e): add responsive route and navigation coverage`
- Commit 3: `test(a11y): cover docs interactions and explorer states`

## Success Criteria
- Every built documentation route is exercised automatically.
- Shared interactions are covered across all three locales and relevant responsive breakpoints.
- Search, mobile navigation, locale switching, docs navigation, copy-to-clipboard, landing CTAs, roadmap CTAs, blog cards, and API explorer states all have deterministic tests.
- Accessibility regressions fail automatically.
- The executor can implement without choosing tools, breakpoints, route source, or verification strategy.
