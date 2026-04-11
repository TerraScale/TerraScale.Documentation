# TerraScale Documentation Site Upgrade

## TL;DR
> **Summary**: Upgrade the existing SvelteKit docs site into a faster, mdsvex-driven static documentation platform with automatic content-derived navigation, Pagefind search, stronger API/blog/docs structure, polished code blocks, and a tighter UI system.
> **Deliverables**:
> - mdsvex-based `.md`/`.svx` content pipeline replacing the current custom markdown renderer
> - auto-generated sidebar/TOC/navigation/search/llms.txt/static OpenAPI reference outputs
> - upgraded docs/blog/API UX with announcements, badges, copy UX, and high-quality syntax highlighting
> - removal of committed Playwright test infrastructure
> **Effort**: XL
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 → 3 → 4 → 5 → 6 → 8 → 12 → 13 → 15

## Context
### Original Request
Build a really fast SvelteKit documentation website using Quantico and mdsvex, with excellent search, OpenAPI docs, blog, heading badges, strong nav/sidebar, automatic sidebar generation from markdown content, llms.txt, animated copy buttons with notifications, announcements, strong UI/UX, and rich code highlighting. User later required removal of all committed tests and a dedicated QA section after implementation that tests everything with curl.

### Interview Summary
- Keep SvelteKit static-output compatible; do not introduce SSR/Workers.
- Target content standard: `.md` for simple prose pages/posts and `.svx` for component-rich pages.
- Search strategy: Pagefind-first, lazy-loaded, replacing the current JSON-search UX.
- OpenAPI strategy: static reference pages as the primary experience with a deferred interactive explorer.
- Repo tests must be removed; no automated test files are to remain in this phase.
- Final QA must be a dedicated post-implementation section with curl-first verification across all HTTP-verifiable outputs.

### Metis Review (gaps addressed)
- Explicitly define one source of truth for navigation, ordering, badges, visibility, and draft exclusion.
- Add a deliberate migration path from current `.mdx`/custom-rendered content to `.md`/`.svx` mdsvex content.
- Decide the fate of `src/routes/search-index.json/+server.ts` explicitly: retire it after Pagefind integration.
- Prevent scope creep: no hosted search, no SSR features, no runtime markdown transforms, no backend-managed announcement system, no “try it” API console in phase 1.
- Treat curl-first QA as mandatory, while allowing supplemental browser checks only where HTTP alone cannot prove interactive behavior.

## Work Objectives
### Core Objective
Transform the existing repo from a custom markdown-rendering docs shell into a decision-consistent, build-time-generated mdsvex documentation platform that is faster to load, easier to author, better structured for docs/blog/API content, and more credible for end users and LLM consumers.

### Deliverables
- Stable mdsvex configuration supporting `.md` and `.svx`
- Content schema covering docs, blog, API reference, badges, announcements, visibility, ordering, and drafts
- Auto-generated sidebar and TOC from content metadata and filesystem structure
- Pagefind-powered search UI replacing the current `search-index.json` fetch flow
- Static OpenAPI reference section plus deferred explorer route
- `llms.txt`, sitemap-aligned crawl surfaces, and polished docs/blog metadata
- High-quality build-time syntax highlighting, filename captions, line highlights, copy UX, and toast notifications
- Faster global shell, improved nav/header/sidebar/mobile behavior, and consistent Quantico usage
- Removal of Playwright config/specs/script/devDependency footprints from the repo

### Definition of Done (verifiable conditions with commands)
- `npm run build` exits `0` and still runs Pagefind over the built output.
- `npm run preview -- --host 127.0.0.1 --port 4173` serves the built site successfully.
- `curl -I http://127.0.0.1:4173/` returns `200`.
- `curl -s http://127.0.0.1:4173/guides/getting-started/` contains mdsvex-rendered headings, sidebar markup, and code-block wrapper markup.
- `curl -s http://127.0.0.1:4173/blog/` contains blog-card output and post metadata.
- `curl -s http://127.0.0.1:4173/reference/api/` returns a static API reference page.
- `curl -s http://127.0.0.1:4173/llms.txt` returns plain-text content with only intended public routes.
- `curl -s http://127.0.0.1:4173/pagefind/pagefind.js` returns `200`.
- `test ! -e tests/e2e/docs.spec.ts && test ! -e playwright.config.ts` succeeds.
- `grep -R "playwright test" package.json` returns no matches.

### Must Have
- Keep the app in SvelteKit with static output compatibility.
- Use Quantico intentionally and optimize font loading rather than adding more runtime font overhead.
- Standardize content on `.md` and `.svx`; convert existing `.mdx` inputs during the migration.
- Generate navigation/search/llms/OpenAPI-supporting artifacts at build time.
- Remove the manual sidebar definition and derive sidebar data from content metadata plus directory structure.
- Remove committed repo tests and replace them with execution-time QA only.
- Include a dedicated post-implementation QA section with curl-first checks.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must NOT introduce Astro, React, Next.js, Vue, SSR, or Cloudflare Workers.
- Must NOT keep runtime markdown parsing via `marked`/`gray-matter` in the serving path once mdsvex is adopted.
- Must NOT keep both Pagefind search and the legacy JSON-search endpoint active long-term.
- Must NOT ship a heavy always-loaded OpenAPI explorer.
- Must NOT add CMS, comments, analytics, i18n, auth, or backend announcement management.
- Must NOT leave committed Playwright specs/config/scripts/devDependencies in the repo.
- Must NOT expose drafts/unlisted pages in sidebar, search, sitemap, llms.txt, or public route listings.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: no committed automated tests; final QA is curl-first plus command-driven validation and browser-only supplements for interaction-only features.
- QA policy: Every task includes executable validation, and the final verification wave re-checks all public surfaces after implementation.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: foundation and migration contract
- 1. Establish SvelteKit + mdsvex static config baseline
- 2. Remove committed test infrastructure
- 3. Define unified content schema and metadata contract
- 4. Replace manual sidebar definition with content-derived IA
- 5. Plan and execute `.mdx` → `.md` / `.svx` migration rules

Wave 2: core rendering and UX shell
- 6. Replace custom markdown renderer with mdsvex rendering pipeline
- 7. Rebuild heading, badge, TOC, and anchor system
- 8. Replace JSON search with lazy Pagefind overlay
- 9. Upgrade header, nav, sidebar, mobile menu, and announcement shell
- 10. Tighten typography, Quantico loading, and performance budgets

Wave 3: specialized surfaces and polish
- 11. Upgrade blog information architecture and metadata output
- 12. Add static OpenAPI reference plus deferred explorer entrypoint
- 13. Generate llms.txt and public crawl artifacts
- 14. Add build-time syntax highlighting, copy UX, and notification animations
- 15. Run full docs UX/accessibility/performance polish pass

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1 | None | 5, 6, 8, 12, 14 |
| 2 | None | 15 |
| 3 | None | 4, 5, 7, 11, 12, 13 |
| 4 | 3 | 6, 9, 15 |
| 5 | 1, 3 | 6, 7, 11, 14 |
| 6 | 1, 4, 5 | 7, 8, 11, 12, 14 |
| 7 | 3, 5, 6 | 9, 14, 15 |
| 8 | 1, 6 | 15 |
| 9 | 4, 7 | 15 |
| 10 | 1 | 14, 15 |
| 11 | 3, 5, 6 | 13, 15 |
| 12 | 1, 3, 6 | 13, 15 |
| 13 | 3, 11, 12 | 15 |
| 14 | 1, 5, 6, 7, 10 | 15 |
| 15 | 2, 7, 8, 9, 10, 11, 12, 13, 14 | Final verification |

### Agent Dispatch Summary
| Wave | Task Count | Categories |
|---|---:|---|
| Wave 1 | 5 | deep, unspecified-high, quick |
| Wave 2 | 5 | deep, visual-engineering, unspecified-high |
| Wave 3 | 5 | deep, visual-engineering, writing, unspecified-high |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

<!-- TASKS_INSERT_HERE -->

- [x] 1. Establish SvelteKit + mdsvex static config baseline

  **What to do**: Create or repair the root SvelteKit/Vite configuration so the site has an explicit mdsvex-enabled static build path. Standardize supported content extensions to `.md` and `.svx`, wire mdsvex before the app render path, keep `adapter-static`, keep the existing `pagefind --site build` flow, and remove any serving-path reliance on implicit/default config behavior. Choose build-time plugins only for heading IDs/autolinks and syntax-highlighting integration.
  **Must NOT do**: Must not introduce SSR, runtime markdown transforms, hosted search, or non-Svelte frameworks.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: config decisions affect every downstream task and must preserve static-site correctness.
  - Skills: `[]` - No special skill required beyond repo analysis and implementation discipline.
  - Omitted: [`/playwright`] - Interaction tooling is not needed for config establishment.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 5, 6, 8, 12, 14 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json` - Existing build contract is `vite build && pagefind --site build`; preserve that output model.
  - Pattern: `src/routes/[...slug]/+page.server.ts` - Current route is fully prerender-driven via `entries()` and must stay static-compatible.
  - Pattern: `src/routes/+layout.svelte` - Global app shell already assumes a static client-side shell.
  - API/Type: `src/lib/content/types.ts` - New mdsvex pipeline must still feed these core entry concepts or their evolved successors.
  - External: `https://mdsvex.pngwn.io/docs` - mdsvex configuration and extension handling guidance.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Root config files explicitly declare mdsvex handling for `.md` and `.svx` and preserve static adapter behavior.
  - [ ] `npm run build` succeeds without depending on the old custom markdown serving path.
  - [ ] Built output still contains Pagefind assets after build.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Static mdsvex build baseline works
    Tool: Bash
    Steps: npm install; npm run build; test -f build/pagefind/pagefind.js; printf 'build ok\n' > .sisyphus/evidence/task-1-mdsvex-baseline.txt
    Expected: Build exits 0 and Pagefind artifact exists in build output.
    Evidence: .sisyphus/evidence/task-1-mdsvex-baseline.txt

  Scenario: Preview server responds after config changes
    Tool: Bash
    Steps: npm run preview -- --host 127.0.0.1 --port 4173 >/tmp/ts-docs-preview.log 2>&1 & sleep 5; curl -I http://127.0.0.1:4173/ > .sisyphus/evidence/task-1-mdsvex-baseline-error.txt
    Expected: HTTP headers show 200/304-compatible success from the preview server.
    Evidence: .sisyphus/evidence/task-1-mdsvex-baseline-error.txt
  ```

  **Commit**: YES | Message: `refactor(build): formalize static mdsvex configuration` | Files: `package.json`, root SvelteKit/Vite config files, mdsvex-related config files

- [x] 2. Remove committed test infrastructure

  **What to do**: Remove Playwright from the repository as a committed test harness. Delete `tests/e2e/*`, `playwright.config.ts`, remove the `test:e2e` script, and remove `@playwright/test` from dependencies if nothing else uses it. Keep implementation-time QA possible through ad hoc commands only; do not leave committed tests, fixtures, or test-only config behind.
  **Must NOT do**: Must not remove build, preview, or typecheck commands. Must not remove future ability to run curl or browser QA manually during execution.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: scope is narrow but must be complete and precise.
  - Skills: `[]` - Straightforward repo cleanup.
  - Omitted: [`/playwright`] - The user explicitly requires test removal.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 15 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json` - Contains `test:e2e` script and `@playwright/test` devDependency.
  - Test: `tests/e2e/docs.spec.ts` - Existing Playwright suite to delete.
  - Pattern: `playwright.config.ts` - Existing Playwright config to delete.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `tests/e2e/docs.spec.ts` no longer exists.
  - [ ] `playwright.config.ts` no longer exists.
  - [ ] `package.json` contains no `test:e2e` script and no `@playwright/test` dependency entry.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Repo test files are removed
    Tool: Bash
    Steps: test ! -e tests/e2e/docs.spec.ts; test ! -e playwright.config.ts; printf 'removed\n' > .sisyphus/evidence/task-2-remove-tests.txt
    Expected: Both legacy Playwright paths are absent.
    Evidence: .sisyphus/evidence/task-2-remove-tests.txt

  Scenario: Test script and dependency are gone
    Tool: Bash
    Steps: ! grep -q 'test:e2e' package.json && ! grep -q '@playwright/test' package.json; printf 'clean package\n' > .sisyphus/evidence/task-2-remove-tests-error.txt
    Expected: package.json has no Playwright command or dependency footprint.
    Evidence: .sisyphus/evidence/task-2-remove-tests-error.txt
  ```

  **Commit**: YES | Message: `chore(repo): remove committed playwright harness` | Files: `package.json`, `playwright.config.ts`, `tests/e2e/**`

- [x] 3. Define unified content schema and metadata contract

  **What to do**: Expand the content metadata model so one schema drives docs, blog, API reference, announcements, badges, draft visibility, canonical metadata, and navigation ordering. Add explicit fields for `kind`, `draft`, `unlisted`, `section`, `sidebar.group`, `sidebar.order`, `sidebar.badge`, `headingBadge`, `announcement`, `openapi`, and SEO/canonical data. Decide that root source-of-truth order is: explicit frontmatter order first, then section/group, then filename/title fallback.
  **Must NOT do**: Must not leave ordering or draft behavior implicit. Must not create separate incompatible metadata rules for docs vs blog vs API.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this is the source-of-truth contract for all downstream generation.
  - Skills: `[]` - Standard implementation skills are sufficient.
  - Omitted: [`/playwright`] - No interaction work required.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5, 7, 11, 12, 13 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - API/Type: `src/lib/content/types.ts` - Current metadata and sidebar types to evolve rather than replace ad hoc.
  - Pattern: `src/lib/content/index.ts` - Existing parsing logic reads title/description/order/sidebar badge data and should become schema-driven.
  - Pattern: `src/routes/blog/+page.svelte` - Blog cards currently expect title/description/date/readingTime/tags.
  - Pattern: `src/routes/[...slug]/+page.svelte` - Docs/article pages already consume title, description, headings, and prev/next metadata.

  **Acceptance Criteria** (agent-executable only):
  - [ ] The content types/schema expose all metadata needed for docs, blog, API, announcements, badges, draft exclusion, and canonical outputs.
  - [ ] Missing required metadata causes explicit build-time failure or deterministic fallback behavior.
  - [ ] A documented ordering policy is implemented in code, not implied in comments only.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Metadata contract supports public route generation
    Tool: Bash
    Steps: npm run build; curl -s http://127.0.0.1:4173/blog/ > .sisyphus/evidence/task-3-content-schema.html
    Expected: Build completes with the new metadata contract and public blog output renders without schema/runtime errors.
    Evidence: .sisyphus/evidence/task-3-content-schema.html

  Scenario: Draft/unlisted rules exclude content from public artifacts
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/llms.txt > .sisyphus/evidence/task-3-content-schema-error.txt
    Expected: llms.txt output omits any draft/unlisted entries once those flags are applied.
    Evidence: .sisyphus/evidence/task-3-content-schema-error.txt
  ```

  **Commit**: YES | Message: `refactor(content): define unified metadata contract` | Files: `src/lib/content/types.ts`, content loader/schema files, representative content files

- [x] 4. Replace manual sidebar definition with content-derived IA

  **What to do**: Remove the hard-coded `sidebarDefinition` tree and generate sidebar sections directly from content metadata and filesystem structure. Use the first route segment as the top-level section label map (`guides`, `account`, `reference`, `dashboard`, `roadmap`, `about`), allow nested grouping via `sidebar.group`, sort entries by `sidebar.order`/`order`, place section `index` pages first when present, and exclude `draft`/`unlisted`/`sidebar.hidden` entries. Keep prev/next navigation sourced from the same ordered tree.
  **Must NOT do**: Must not maintain a second manual nav manifest. Must not let blog posts leak into docs sidebar generation.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: navigation generation is structural and must remain deterministic.
  - Skills: `[]` - No special skill required.
  - Omitted: [`/playwright`] - QA is curl-first and structure-focused here.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 9, 15 | Blocked By: 3

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/content/index.ts` - Current `sidebarDefinition`, `buildSidebarNodes`, `flattenSidebar`, and `getPrevNext` logic to replace.
  - Pattern: `src/lib/components/DocsSidebar.svelte` - Existing component expects nested `SidebarNode[]` and should keep that contract or a backward-compatible equivalent.
  - API/Type: `src/lib/content/types.ts` - `SidebarNode` is the current rendered structure.
  - Pattern: `src/routes/[...slug]/+page.server.ts` - Sidebar data is loaded here and must stay route-driven.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Sidebar output is generated from content files and metadata, not a hard-coded definition.
  - [ ] Prev/next navigation uses the same ordering source as the sidebar.
  - [ ] Draft/unlisted/hidden entries do not appear in sidebar or prev/next output.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Generated docs sidebar renders deterministic public links
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ > .sisyphus/evidence/task-4-auto-sidebar.html
    Expected: HTML contains generated sidebar markup with Guides/Reference sections and no hard-coded stale links.
    Evidence: .sisyphus/evidence/task-4-auto-sidebar.html

  Scenario: Hidden or draft entries stay out of navigation
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ | grep -i 'draft\|unlisted' > .sisyphus/evidence/task-4-auto-sidebar-error.txt || true
    Expected: No hidden/draft labels or routes appear in the rendered sidebar markup unless intentionally public.
    Evidence: .sisyphus/evidence/task-4-auto-sidebar-error.txt
  ```

  **Commit**: YES | Message: `feat(nav): derive sidebar and prev-next from content metadata` | Files: `src/lib/content/index.ts`, `src/lib/content/types.ts`, `src/lib/components/DocsSidebar.svelte`, route loaders

- [x] 5. Plan and execute `.mdx` → `.md` / `.svx` migration rules

  **What to do**: Inventory every existing content file under `src/content/docs/**/*.{md,mdx}` and convert it to the new rule set: plain prose pages/posts become `.md`; pages that use embedded UI components, tab sets, cards, feature grids, or custom badges become `.svx`. Replace fragile MDX-only patterns with mdsvex-compatible component imports/usage and remove extension ambiguity from the repo. Keep routes stable by preserving slug paths during renames.
  **Must NOT do**: Must not break existing public routes. Must not leave a mixed `.mdx` estate behind after migration.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: large-volume content migration with careful route preservation.
  - Skills: `[]` - Standard file-editing capability is enough.
  - Omitted: [`/playwright`] - Content migration should be verified via build and curl outputs.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 6, 7, 11, 14 | Blocked By: 1, 3

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/content/index.ts` - Current raw glob only targets `.{md,mdx}` and must evolve to `.{md,svx}`.
  - Pattern: `src/content/docs/index.mdx` and other files under `src/content/docs/**` - Existing source material to rename and normalize.
  - Pattern: `src/lib/mdx/Tabs.svelte`, `src/lib/mdx/TabItem.svelte`, `src/lib/mdx/Card.svelte`, `src/lib/mdx/CardGrid.svelte`, `src/lib/mdx/FeatureGrid.svelte` - Component-rich content should remain component-rich via `.svx`.
  - Pattern: `src/routes/[...slug]/+page.server.ts` - Route slugs are derived from file paths and must remain stable.

  **Acceptance Criteria** (agent-executable only):
  - [ ] No public content files remain with `.mdx` extension.
  - [ ] All migrated routes resolve to the same public URLs as before.
  - [ ] Component-rich content still builds/render after conversion to `.svx`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Migration leaves no .mdx files in public content source
    Tool: Bash
    Steps: ! find src/content/docs -type f -name '*.mdx' | grep .; printf 'no mdx left\n' > .sisyphus/evidence/task-5-content-migration.txt
    Expected: No `.mdx` files remain under `src/content/docs`.
    Evidence: .sisyphus/evidence/task-5-content-migration.txt

  Scenario: Representative migrated routes still resolve
    Tool: Bash
    Steps: npm run build; npm run preview -- --host 127.0.0.1 --port 4173 >/tmp/ts-docs-preview.log 2>&1 & sleep 5; curl -I http://127.0.0.1:4173/guides/getting-started/ > .sisyphus/evidence/task-5-content-migration-error.txt; curl -I http://127.0.0.1:4173/blog/introducing-terrascale/ >> .sisyphus/evidence/task-5-content-migration-error.txt
    Expected: Representative docs and blog routes still return success after migration.
    Evidence: .sisyphus/evidence/task-5-content-migration-error.txt
  ```

  **Commit**: YES | Message: `refactor(content): migrate mdx sources to md and svx` | Files: `src/content/docs/**`, mdsvex import/component support files

- [x] 6. Replace custom markdown renderer with mdsvex rendering pipeline

  **What to do**: Remove the current `gray-matter` + `marked` + string-transform render path from `src/lib/content/index.ts` and replace it with mdsvex-driven compilation/rendering. Preserve route derivation, heading extraction, reading time, and content metadata, but stop rendering HTML strings from a custom parser. The end state should treat docs/blog/API source files as mdsvex content modules rather than raw text blobs.
  **Must NOT do**: Must not leave the old custom renderer active for public docs routes. Must not perform runtime markdown transformation in the browser.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this is the core architectural change in the project.
  - Skills: `[]` - No special skill needed.
  - Omitted: [`/playwright`] - Rendering correctness is better validated by build and curl at this stage.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 7, 8, 11, 12, 14 | Blocked By: 1, 4, 5

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/content/index.ts` - Current renderer uses `rawMap`, `matter`, `marked`, `transformMarkdown`, `renderMarkdown`, and `extractHeadings`; this is the primary replacement target.
  - Pattern: `src/routes/[...slug]/+page.svelte` - Current page expects rendered article output and heading data.
  - Pattern: `src/routes/blog/+page.server.ts` and `src/routes/blog/+page.svelte` - Blog listing must keep title/description/date/readingTime/tags behavior.
  - API/Type: `src/lib/content/types.ts` - Preserve equivalent entry metadata shape as the rendering pipeline changes.
  - External: `https://mdsvex.pngwn.io/docs` - mdsvex rendering/layout behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Public docs/blog/API routes render from mdsvex content modules rather than a raw-string custom parser.
  - [ ] `src/lib/content/index.ts` no longer uses `marked` or `gray-matter` in the request/render path for site pages.
  - [ ] Build output for representative routes still contains expected article content and heading anchors.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: mdsvex-rendered docs page outputs expected content
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ > .sisyphus/evidence/task-6-mdsvex-rendering.html
    Expected: Rendered HTML contains the docs page heading, article content, and anchorized headings without parser artifacts.
    Evidence: .sisyphus/evidence/task-6-mdsvex-rendering.html

  Scenario: Legacy JSON/html transform path is retired
    Tool: Bash
    Steps: ! grep -q 'marked' src/lib/content/index.ts && ! grep -q 'gray-matter' src/lib/content/index.ts; printf 'legacy removed\n' > .sisyphus/evidence/task-6-mdsvex-rendering-error.txt
    Expected: The old custom markdown parser imports are absent from the main content pipeline.
    Evidence: .sisyphus/evidence/task-6-mdsvex-rendering-error.txt
  ```

  **Commit**: YES | Message: `refactor(content): replace custom markdown renderer with mdsvex` | Files: `src/lib/content/index.ts`, mdsvex config/layout files, docs/blog route loaders and renderers

- [ ] 7. Rebuild heading, badge, TOC, and anchor system

  **What to do**: Move heading IDs and anchor links to mdsvex-compatible build-time plugins. Keep the existing TOC depth behavior limited to H2/H3 for docs pages, add page-level heading badges from frontmatter, preserve sidebar badges, and support component-driven inline heading badges in `.svx` only. Standardize duplicate-slug handling via GitHub-compatible slugging, and ensure anchor links are present in rendered headings without requiring manual HTML injection.
  **Must NOT do**: Must not rely on fragile regex extraction for headings once mdsvex is in place. Must not expose heading badges in plain `.md` through bespoke syntax that bypasses the shared pipeline.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: this spans content metadata, rendering, and docs-page UX.
  - Skills: `[]` - No special skill required.
  - Omitted: [`/playwright`] - Structural HTML and anchor correctness are curl-verifiable.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9, 14, 15 | Blocked By: 3, 5, 6

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/content/index.ts` - Current heading extraction uses regex and current anchor output is injected by the renderer.
  - Pattern: `src/lib/components/TableOfContents.svelte` - Current TOC consumes `HeadingLink[]` and should retain a similar public contract.
  - Pattern: `src/lib/content/types.ts` - Existing `HeadingLink`, `BadgeMeta`, and `SidebarMeta` types are the starting point.
  - Pattern: `src/routes/[...slug]/+page.svelte` - TOC is rendered only on docs pages and should remain scoped that way.
  - External: `https://mdsvex.pngwn.io/docs` - mdsvex plugin integration for headings and componentized content.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Docs pages render stable H2/H3 anchors and TOC links from build-time heading extraction.
  - [ ] Page heading badges and sidebar badges render from content metadata.
  - [ ] Duplicate heading text generates unique anchor IDs without collisions.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: TOC and heading anchors match rendered docs output
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ > .sisyphus/evidence/task-7-headings.html
    Expected: HTML contains TOC links and corresponding `id="..."` anchors for H2/H3 headings.
    Evidence: .sisyphus/evidence/task-7-headings.html

  Scenario: Badge metadata appears in page shell without collisions
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/reference/api/ > .sisyphus/evidence/task-7-headings-error.html
    Expected: API/docs heading area includes badge markup when frontmatter requests it and anchor IDs remain unique.
    Evidence: .sisyphus/evidence/task-7-headings-error.html
  ```

  **Commit**: YES | Message: `feat(docs): rebuild heading anchors toc and badges` | Files: content metadata/types, mdsvex plugins, TOC component, docs page shell

- [ ] 8. Replace JSON search with lazy Pagefind overlay

  **What to do**: Retire `src/routes/search-index.json/+server.ts` as the public search backend and rebuild `SearchOverlay.svelte` around Pagefind. Keep the overlay/modal UX, keyboard focus behavior, and result card design, but lazy-load Pagefind assets only when search opens. Scope results across docs, blog, and API pages, exclude drafts/unlisted entries, and keep the result limit at 12 items per query with a sensible empty-state.
  **Must NOT do**: Must not fetch the full content corpus as raw JSON on first load. Must not keep both JSON search and Pagefind as equal public codepaths.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: integration touches build output, UI, and search experience.
  - Skills: `[]` - No special skill required.
  - Omitted: [`/playwright`] - Search behavior should be curl-first for artifacts, with interaction verification deferred to final QA only if needed.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 15 | Blocked By: 1, 6

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/components/SearchOverlay.svelte` - Current overlay/modal UX and focus behavior to preserve and improve.
  - Pattern: `src/routes/search-index.json/+server.ts` - Legacy JSON search endpoint to retire.
  - Pattern: `package.json` - Existing build already runs `pagefind --site build`; align with that instead of parallel search systems.
  - Pattern: `src/routes/+layout.svelte` - Search overlay is globally mounted here and should stay globally reachable.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Search UI does not request `/search-index.json` anymore.
  - [ ] Built output contains Pagefind assets and search still returns public docs/blog/API results.
  - [ ] Search overlay remains lazy-loaded and keyboard-focusable.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Pagefind assets are publicly served
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/pagefind/pagefind.js > .sisyphus/evidence/task-8-pagefind.txt
    Expected: Pagefind JS asset returns success headers.
    Evidence: .sisyphus/evidence/task-8-pagefind.txt

  Scenario: Legacy JSON search endpoint is retired
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/search-index.json > .sisyphus/evidence/task-8-pagefind-error.txt || true
    Expected: Endpoint is absent or intentionally redirected away from public use; it no longer acts as the search backend.
    Evidence: .sisyphus/evidence/task-8-pagefind-error.txt
  ```

  **Commit**: YES | Message: `feat(search): replace json search with lazy pagefind overlay` | Files: `src/lib/components/SearchOverlay.svelte`, `src/routes/+layout.svelte`, retired `src/routes/search-index.json/+server.ts`, related search helpers/assets

- [ ] 9. Upgrade header, nav, sidebar, mobile menu, and announcement shell

  **What to do**: Refactor the global shell so primary navigation, mobile nav, sidebar, and announcement presentation feel coherent and modern without becoming a redesign project. Keep three primary nav intents (`Docs`, `Blog`, `Get Started`), add a content-driven announcement bar above the header, improve active states and section discoverability, and make the sidebar sticky/collapsible-friendly on small screens while preserving static-first behavior. Source announcement content from a checked-in static site-data file and keep one active announcement at a time.
  **Must NOT do**: Must not introduce backend state or cookie-dependent announcement persistence. Must not add extra top-level nav categories beyond the requested docs/blog/API structure.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: this is primarily UX shell refinement with structural constraints.
  - Skills: [`/frontend-ui-ux`] - Useful for polishing nav and sidebar hierarchy without overscoping.
  - Omitted: [`/playwright`] - Browser-only validation happens later; implementation should focus on deterministic markup/state.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 15 | Blocked By: 4, 7

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/lib/components/Header.svelte` - Existing nav items, search trigger, and mobile menu behavior.
  - Pattern: `src/lib/components/DocsSidebar.svelte` - Existing left-rail structure to improve rather than replace wholesale.
  - Pattern: `src/routes/+layout.svelte` - Announcement bar and shell-level wiring belong here.
  - Pattern: `src/app.css` - Existing header/sidebar styles, sticky shell, and badge styles are the baseline.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Header shows Docs, Blog, Get Started, search trigger, and a content-driven announcement bar.
  - [ ] Mobile navigation exposes primary nav and search entry cleanly.
  - [ ] Docs sidebar remains visible and structured on docs routes while staying absent from blog routes.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Header and announcement shell render in public HTML
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/ > .sisyphus/evidence/task-9-shell.html
    Expected: HTML contains primary nav labels, search trigger markup, and announcement bar markup.
    Evidence: .sisyphus/evidence/task-9-shell.html

  Scenario: Docs sidebar stays scoped to docs routes
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ > .sisyphus/evidence/task-9-shell-error-docs.html; curl -s http://127.0.0.1:4173/blog/ > .sisyphus/evidence/task-9-shell-error-blog.html
    Expected: Docs route output contains sidebar markup; blog index output does not contain the docs sidebar.
    Evidence: .sisyphus/evidence/task-9-shell-error-docs.html
  ```

  **Commit**: YES | Message: `feat(shell): improve header sidebar mobile nav and announcements` | Files: `src/routes/+layout.svelte`, `src/lib/components/Header.svelte`, `src/lib/components/DocsSidebar.svelte`, site-data files, global styles

- [x] 10. Tighten typography, Quantico loading, and performance budgets

  **What to do**: Keep Quantico as the display/system brand font while restoring readability for dense documentation body copy through a balanced typographic stack. Preload only the required Quantico weights, keep `font-display: swap`, reduce oversized decorative effects where they hurt paint cost, trim unused CSS/JS, and set explicit budgets: avoid adding client-side libraries unless they are lazy-loaded, keep critical font payload to the two existing WOFF2 files, and avoid blocking scripts for search/API explorer/code UX.
  **Must NOT do**: Must not replace Quantico with another branding font. Must not expand font inventory or add runtime font packages.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: performance and visual readability must be tuned together.
  - Skills: [`/frontend-ui-ux`] - Helpful for typography/performance balance.
  - Omitted: [`/playwright`] - This work is artifact/perf focused, not test-driven.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 14, 15 | Blocked By: 1

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/app.css` - Current `@font-face` declarations, dark theme variables, and global typography.
  - Pattern: `static/fonts/quantico-latin-400-normal.woff2` and `static/fonts/quantico-latin-700-normal.woff2` - Existing font assets to optimize around.
  - Pattern: `src/routes/+layout.svelte` - Global shell where preloads and noncritical asset loading strategies may need wiring.
  - Pattern: `package.json` - Existing dependency inventory to keep lean.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Quantico remains the branded display family and loads from the checked-in WOFF2 assets.
  - [ ] Noncritical interactive assets are lazy/deferred where applicable.
  - [ ] The built home and docs pages still render with the intended font stack and no 404 font requests.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Quantico font assets remain publicly available
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/fonts/quantico-latin-400-normal.woff2 > .sisyphus/evidence/task-10-performance.txt; curl -I http://127.0.0.1:4173/fonts/quantico-latin-700-normal.woff2 >> .sisyphus/evidence/task-10-performance.txt
    Expected: Both Quantico WOFF2 assets return success headers.
    Evidence: .sisyphus/evidence/task-10-performance.txt

  Scenario: Rendered pages still reference the intended typography stack
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/ > .sisyphus/evidence/task-10-performance-error.html
    Expected: HTML/CSS output still references the intended Quantico-driven font setup and does not imply missing font assets.
    Evidence: .sisyphus/evidence/task-10-performance-error.html
  ```

  **Commit**: YES | Message: `perf(ui): optimize quantico loading and typography budget` | Files: `src/app.css`, root HTML/layout files, static font preload wiring, noncritical asset-loading code

- [ ] 11. Upgrade blog information architecture and metadata output

  **What to do**: Keep `/blog/` as a dedicated route but align it with the new content schema and mdsvex pipeline. Ensure blog posts use `.md` unless they need embedded components, preserve reading time/date/tags, add canonical metadata, improve card hierarchy, and ensure posts participate correctly in search and llms.txt only when public. Keep RSS discoverability link present in the header/footer if it already exists, and ensure blog routes are excluded from docs sidebar logic.
  **Must NOT do**: Must not merge blog into docs sidebar. Must not require a separate blog renderer distinct from the mdsvex content pipeline.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: blog IA is content-heavy and metadata-sensitive.
  - Skills: `[]` - No special skill required.
  - Omitted: [`/playwright`] - Verification is route/content based.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 13, 15 | Blocked By: 3, 5, 6

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/routes/blog/+page.server.ts` - Current blog listing loader.
  - Pattern: `src/routes/blog/+page.svelte` - Current blog index UI and card metadata expectations.
  - Pattern: `src/routes/[...slug]/+page.svelte` - Blog article rendering branch in the catch-all route.
  - Pattern: `src/lib/content/index.ts` - Current split of `blogEntries` vs `docsEntries` and reading-time generation.
  - Pattern: `src/lib/components/Header.svelte` - Existing blog nav and RSS link affordance.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/blog/` renders only public blog posts with title, description, date, reading time, and tags.
  - [ ] Blog posts resolve correctly from the mdsvex content pipeline.
  - [ ] Blog posts participate in search/llms outputs only when not draft/unlisted.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Blog index outputs expected cards and metadata
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/blog/ > .sisyphus/evidence/task-11-blog.html
    Expected: HTML contains blog card markup with title, description, date/reading-time metadata, and tag badges.
    Evidence: .sisyphus/evidence/task-11-blog.html

  Scenario: Representative blog post resolves successfully
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/blog/introducing-terrascale/ > .sisyphus/evidence/task-11-blog-error.txt
    Expected: Representative blog article returns success and preserves its route.
    Evidence: .sisyphus/evidence/task-11-blog-error.txt
  ```

  **Commit**: YES | Message: `feat(blog): align blog ia and metadata with mdsvex pipeline` | Files: blog content files, content loader/schema, blog route files, metadata helpers

- [ ] 12. Add static OpenAPI reference plus deferred explorer entrypoint

  **What to do**: Introduce a checked-in OpenAPI source location under static assets (for example `static/openapi/terrascale.yaml`) and generate a static API reference experience that lives under the existing `/reference/api/` route tree. Add a separate deferred explorer shell route (for example `/reference/api/explorer/`) that loads the interactive viewer only when visited, not on every docs page. The static route must remain the default linked experience from docs navigation.
  **Must NOT do**: Must not load Swagger/Redoc explorer assets on normal docs/blog page views. Must not turn the explorer into the default API entry page.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: API content structure and payload strategy have architectural consequences.
  - Skills: `[]` - No special skill required.
  - Omitted: [`/playwright`] - API reference verification is route/artifact based and curl-friendly.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 13, 15 | Blocked By: 1, 3, 6

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/content/docs/reference/api.mdx` and `src/content/docs/reference/api/**` - Existing API reference content location and route expectations.
  - Pattern: `src/lib/content/index.ts` - Current content loader explicitly ignores `/src/content/docs/reference/api.mdx`; that behavior must be revisited.
  - Pattern: `src/lib/components/Header.svelte` - Primary nav currently points Docs to `/reference/api/` and must continue to land on the static API docs experience.
  - Pattern: `src/routes/[...slug]/+page.svelte` - Catch-all page is the current route shell for API docs and related TOC/prev-next behavior.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `/reference/api/` resolves to a static-first API reference page.
  - [ ] OpenAPI source files are checked into the repo and publicly servable if intended.
  - [ ] Interactive explorer assets are deferred to the dedicated explorer route only.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Static API reference route is public and fast-path accessible
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/reference/api/ > .sisyphus/evidence/task-12-openapi.txt; curl -s http://127.0.0.1:4173/reference/api/ >> .sisyphus/evidence/task-12-openapi.txt
    Expected: Static API reference returns success and emits HTML content without requiring interactive explorer assets first.
    Evidence: .sisyphus/evidence/task-12-openapi.txt

  Scenario: Deferred explorer is isolated to its own route
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/reference/api/explorer/ > .sisyphus/evidence/task-12-openapi-error.txt || true
    Expected: Explorer route exists only as a dedicated opt-in experience and is not embedded into the default API docs HTML.
    Evidence: .sisyphus/evidence/task-12-openapi-error.txt
  ```

  **Commit**: YES | Message: `feat(api): add static openapi reference and deferred explorer` | Files: `static/openapi/**`, API docs content/routes/components, content loader/schema, nav links

- [ ] 13. Generate llms.txt and public crawl artifacts

  **What to do**: Generate a prerendered `llms.txt` endpoint from the same public content graph that powers docs/blog/API navigation. Include only public docs, blog posts, and API reference pages that are not draft/unlisted. Align the output with existing crawl surfaces like sitemap and robots, and ensure canonical/public URLs are represented consistently. Keep the output concise, text-only, and deterministic.
  **Must NOT do**: Must not include drafts, internal-only notes, hidden pages, or explorer-only routes that are not intended for indexing.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: text output quality and inclusion rules matter as much as routing.
  - Skills: `[]` - No special skill required.
  - Omitted: [`/playwright`] - Crawl artifacts are curl-verifiable.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 15 | Blocked By: 3, 11, 12

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/routes/sitemap.xml/+server.ts` - Existing crawl artifact generation pattern to align with.
  - Pattern: `src/lib/content/index.ts` - Public content graph and searchable entries source.
  - Pattern: `src/routes/blog/+page.server.ts` - Blog visibility should follow public-entry logic.
  - Pattern: `src/routes/[...slug]/+page.server.ts` - Public docs/API prerender entries already flow through this route model.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `llms.txt` is publicly served as plain text.
  - [ ] `llms.txt` includes public docs/blog/API routes and excludes draft/unlisted content.
  - [ ] `llms.txt` generation uses the same public visibility rules as navigation/search.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: llms.txt is publicly available
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/llms.txt > .sisyphus/evidence/task-13-llms.txt; curl -s http://127.0.0.1:4173/llms.txt >> .sisyphus/evidence/task-13-llms.txt
    Expected: llms.txt returns success and plain-text route content.
    Evidence: .sisyphus/evidence/task-13-llms.txt

  Scenario: Draft/unlisted content is excluded from llms output
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/llms.txt > .sisyphus/evidence/task-13-llms-error.txt
    Expected: No draft/unlisted/internal routes appear in the file output.
    Evidence: .sisyphus/evidence/task-13-llms-error.txt
  ```

  **Commit**: YES | Message: `feat(crawl): generate llms output from public content graph` | Files: `src/routes/llms.txt/+server.ts` or equivalent, content-visibility helpers, sitemap/robots related logic as needed

- [ ] 14. Add build-time syntax highlighting, copy UX, and notification animations

  **What to do**: Replace weak/default code rendering with build-time highlighting using mdsvex-compatible syntax highlighting. Use a Shiki-style build-time highlighter with `github-dark-default` for dark mode and `github-light-default` for light fallback, support fenced-code filenames/titles, line highlighting, diff markers, and a polished copy button that shows a success toast/inline notification and clears automatically. Only `.svx` files may use richer code-block enhancements beyond plain fenced markdown.
  **Must NOT do**: Must not perform syntax highlighting client-side at runtime. Must not add copy UX that depends on a backend or blocks rendering.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: this combines design polish, mdsvex rendering, and lightweight interaction.
  - Skills: [`/frontend-ui-ux`] - Helpful for code-block visual quality and feedback motion.
  - Omitted: [`/playwright`] - Curl verifies markup/assets; browser-only timing checks happen in final QA if needed.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 15 | Blocked By: 1, 5, 6, 7, 10

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json` - Current dependencies include `svelte-highlight`; the end state should prefer build-time highlighting aligned with mdsvex.
  - Pattern: `src/routes/[...slug]/+page.svelte` - Code blocks render in the main docs article surface here.
  - Pattern: `src/app.css` - Existing badge/button/transition tokens and prose shell styles to extend.
  - Pattern: `src/lib/content/index.ts` - Current custom markdown renderer is where code block handling lives today and must be replaced by the mdsvex-highlight path.
  - External: `https://mdsvex.pngwn.io/docs` - mdsvex highlighting integration constraints.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Rendered code blocks show build-time highlighting with stable classes/markup for themes, titles, and line states.
  - [ ] Copy button markup and success notification markup appear on code blocks.
  - [ ] Code blocks remain readable and do not rely on client-side parsing to highlight.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Rendered docs HTML contains highlighted code-block markup
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ > .sisyphus/evidence/task-14-code-highlighting.html
    Expected: HTML contains syntax-highlight wrapper markup, code-block title/copy affordance markup, and no raw unstyled fallback blocks for representative examples.
    Evidence: .sisyphus/evidence/task-14-code-highlighting.html

  Scenario: Copy UX markup is present for code examples
    Tool: Bash
    Steps: curl -s http://127.0.0.1:4173/guides/getting-started/ | grep -i 'copy' > .sisyphus/evidence/task-14-code-highlighting-error.txt || true
    Expected: Rendered HTML exposes copy button / notification markup associated with code examples.
    Evidence: .sisyphus/evidence/task-14-code-highlighting-error.txt
  ```

  **Commit**: YES | Message: `feat(code): add build-time highlighting and copy feedback ux` | Files: mdsvex/highlighter config, code-block components, docs styles, representative `.svx` content

- [ ] 15. Run full docs UX/accessibility/performance polish pass

  **What to do**: Perform the final implementation pass that harmonizes spacing, hierarchy, empty states, responsiveness, reduced-motion handling, focus states, icon consistency, nav ergonomics, and page-level polish across home/docs/blog/API. This pass must also clean up stale imports/dependencies left from the old custom renderer or test harness, verify draft exclusion across all public artifacts, and ensure curl-first QA coverage is ready for the final verification wave.
  **Must NOT do**: Must not add new product scope. Must not reopen architecture decisions already locked in earlier tasks.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: it is a broad hardening/polish pass spanning multiple completed surfaces.
  - Skills: [`/frontend-ui-ux`] - Helpful for final UI coherence.
  - Omitted: [`/playwright`] - Final verification wave owns any supplemental interaction-only checks.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final verification | Blocked By: 2, 7, 8, 9, 10, 11, 12, 13, 14

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/routes/+layout.svelte` - Global shell and search mount point.
  - Pattern: `src/lib/components/Header.svelte`, `src/lib/components/DocsSidebar.svelte`, `src/lib/components/SearchOverlay.svelte`, `src/lib/components/TableOfContents.svelte` - Core docs shell surfaces to unify.
  - Pattern: `src/routes/[...slug]/+page.svelte` and `src/routes/blog/+page.svelte` - Primary content presentation surfaces.
  - Pattern: `src/app.css` - Main style system and likely location for stale styles after migration.
  - Pattern: `package.json` - Dependency cleanup surface after test-renderer replacement.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Home/docs/blog/API pages present a consistent polished UI with no orphaned legacy behavior.
  - [ ] Keyboard/focus/reduced-motion affordances are present where interactive controls exist.
  - [ ] Stale dependencies/imports from removed renderer/test infrastructure are cleaned up.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Core public surfaces all return successful HTML after polish
    Tool: Bash
    Steps: curl -I http://127.0.0.1:4173/ > .sisyphus/evidence/task-15-polish.txt; curl -I http://127.0.0.1:4173/guides/getting-started/ >> .sisyphus/evidence/task-15-polish.txt; curl -I http://127.0.0.1:4173/blog/ >> .sisyphus/evidence/task-15-polish.txt; curl -I http://127.0.0.1:4173/reference/api/ >> .sisyphus/evidence/task-15-polish.txt
    Expected: Home, docs, blog, and API surfaces all return successful responses after the full polish pass.
    Evidence: .sisyphus/evidence/task-15-polish.txt

  Scenario: Dependency and legacy cleanup is complete
    Tool: Bash
    Steps: ! grep -q 'marked' package.json && ! grep -q 'gray-matter' package.json && ! grep -q '@playwright/test' package.json; printf 'legacy cleaned\n' > .sisyphus/evidence/task-15-polish-error.txt
    Expected: Removed legacy runtime/test dependencies no longer appear in package.json when they are no longer needed.
    Evidence: .sisyphus/evidence/task-15-polish-error.txt
  ```

  **Commit**: YES | Message: `chore(site): finalize docs ux polish and cleanup` | Files: affected UI components/styles/routes/content helpers/dependency manifests

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
> Curl-first matrix is mandatory here: home, key docs pages, key blog pages, API reference, deferred explorer shell, pagefind assets, fonts, sitemap/robots/llms outputs, redirects/canonical surfaces, and draft exclusion checks.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ curl-first; browser only for interaction-only checks)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `refactor(content): adopt mdsvex pipeline and metadata contract`
- Commit 2: `feat(ux): upgrade navigation search announcements and docs chrome`
- Commit 3: `feat(content): add api docs llms output highlighting and remove test harness`

## Success Criteria
- Docs/blog/API content all render from one mdsvex-compatible content pipeline.
- Sidebar, TOC, search corpus, and llms.txt are build-time derived from the same metadata rules.
- Search no longer depends on `search-index.json`; Pagefind is the public search backend.
- Quantico remains in use, but global load performance and asset weight are improved rather than regressed.
- Code blocks have strong visual contrast, filename/title support, copy feedback, and stable heading anchors.
- OpenAPI docs are discoverable and useful without loading an interactive explorer by default.
- No committed automated test files/config remain in the repo.
- Final QA evidence proves curl coverage across all major surfaces before user approval.
