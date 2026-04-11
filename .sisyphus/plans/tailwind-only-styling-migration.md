# Tailwind-Only Styling Migration

## TL;DR
> **Summary**: Migrate TerraScale.Documentation from a semantic custom-CSS design system to Tailwind v4 utility styling, while allowing only a minimal CSS token layer for `@theme` / CSS variables and updating all styling-related docs/policies in the same effort.
> **Deliverables**:
> - Tailwind-only UI styling across routes, components, MDX wrappers, and rendered-content surfaces
> - Removal of scoped `<style>` blocks, style-only semantic selectors, and orphan style assets
> - Updated `THEME.md`, `README.md`, `AGENTS.md`, and styling-related content references
> **Effort**: XL
> **Parallel**: YES - 3 waves
> **Critical Path**: 1 → 2 → 3 → 4 → (5/6/7/8/9 in parallel) → 10 → 11 → 12

## Context

### Original Request
Create a plan to move away from custom CSS and use only Tailwind, and update all documentation including `THEME.md` and `AGENTS.md`.

### Interview Summary
- Tailwind-only means: Tailwind utilities/components plus a **minimal token layer** in CSS for Tailwind v4 `@theme` / CSS variables.
- Tailwind-only does **not** allow custom selectors or component-scoped styling to remain.
- Cleanup scope includes code migration, orphan style asset removal, and doc/policy updates in one migration.

### Metis Review (gaps addressed)
- Add an explicit **Allowed Residual CSS** contract so implementers do not reintroduce custom CSS under a new name.
- Define one **canonical token namespace** before page-by-page migration.
- Treat current class-based style hooks as runtime contracts and convert them to data attributes or replace them in lockstep.
- Keep markdown-content scope bounded: wrappers/components first, content-file edits only where wrapper migration cannot remove styling debt.
- Add hard repo-hygiene gates: no `<style>` blocks, no `@apply`, no `@utility`, no stale Astro/Starlight docs refs.

## Work Objectives

### Core Objective
Replace the repo’s current custom CSS styling model with Tailwind v4 utility-based styling, preserving existing behavior and UX while converging on one token system and one documented styling policy.

### Deliverables
- Minimal `src/app.css` containing only approved residual CSS
- Canonical Tailwind token layer replacing `--ts-*`, `--color-*`, and lingering `--sl-*` styling dependencies
- Tailwind-styled rendered docs/blog/API surfaces with no reliance on global semantic selectors
- Tailwind-styled shared UI surfaces: header, sidebar, search, footer, blog, explorer, toast, copy button, homepage
- Removal of scoped `<style>` blocks and orphan style assets
- Updated style-policy docs: `THEME.md`, `README.md`, `AGENTS.md`, and `src/content/docs/dashboard/why-open-source.md`

### Definition of Done (verifiable conditions with commands)
- `npm run check` exits `0`
- `npm run build` exits `0`
- `grep -R "<style[ >]" src --include='*.svelte'` returns no matches
- `grep -R "@apply\|@utility" . --include='*.css'` returns no matches
- `grep -R "Astro\|Starlight\|astro.config\|src/index.css\|src/pages/\|src/components/" README.md THEME.md AGENTS.md` returns no matches
- `grep -R "reference-theme\|reference-print\|reference-expressive" .` returns no active app/documentation references after cleanup
- Playwright happy paths pass for `/`, `/guides/repository`, and `/reference/api/explorer`

### Must Have
- Tailwind v4 CSS-first approach; do not introduce a legacy Tailwind JS-config workflow unless required by a documented blocker
- One canonical token namespace and a temporary migration shim only where strictly necessary
- Behavior-preserving refactor; no redesign/copy refresh scope expansion
- Rendered markdown/docs surfaces styled via Tailwind wrappers, arbitrary variants, and component markup rather than global semantic CSS
- Runtime hooks migrated from style-only class selectors to `data-*` contracts wherever JavaScript depends on them

### Allowed Residual CSS
Allowed in `src/app.css` after migration:
- `@import 'tailwindcss';`
- Tailwind v4 `@theme` token declarations / CSS variables
- `@font-face` for checked-in Quantico assets
- Truly global base rules only if Tailwind utilities cannot own them (for example `html`, `body`, or `:root` token declarations)

Forbidden after migration:
- Component/layout selectors (for example `.docs-shell`, `.blog-card`, `.hero-*`, `.sl-link-button`, `.ts-*`)
- Descendant prose styling selectors used as the primary styling method
- `@apply`
- `@utility`
- CSS Modules or new CSS files that recreate semantic helper classes

### Must NOT Have
- No `tailwind.config.*` unless a documented blocker proves Tailwind v4 CSS-first is insufficient
- No `@tailwindcss/typography` or similar plugin unless a concrete blocker is documented in-plan and approved before implementation
- No new semantic styling aliases moved from `<style>` blocks into `src/app.css`
- No lingering `--sl-*` or secondary `--color-*` token family in active app surfaces
- No stale Astro/Starlight repo docs or styling guidance
- No half-migrated surface where old semantic selectors and new utilities both style the same UI

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after with `npm run check`, `npm run build`, grep-based hygiene checks, curl checks, and Playwright UI QA
- QA policy: Every task includes at least one happy-path and one failure/edge-path scenario
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy

### Parallel Execution Waves
Wave 1: foundation and contracts
- 1. Tailwind foundation and residual CSS contract
- 2. Canonical token namespace and token migration map
- 3. Runtime selector contract replacement (`data-*` / lockstep behavior hooks)
- 4. Rendered-content wrapper strategy for prose, code blocks, admonitions, and anchors

Wave 2: surface migration (depends on Wave 1)
- 5. MDX primitives and docs widgets
- 6. Homepage and docs landing content
- 7. Shared shell/navigation/search/sidebar/footer/layout
- 8. Blog surfaces
- 9. API explorer surfaces

Wave 3: converge and close
- 10. Remove remaining scoped styles, semantic selectors, and orphan style assets
- 11. Update docs/policies and styling references
- 12. Run repo-wide hygiene and functional QA gates

### Dependency Matrix
| Task | Depends On |
|---|---|
| 1 | - |
| 2 | 1 |
| 3 | 1, 2 |
| 4 | 1, 2, 3 |
| 5 | 1, 2, 3, 4 |
| 6 | 1, 2, 4, 5 |
| 7 | 1, 2, 3, 4 |
| 8 | 1, 2, 4 |
| 9 | 1, 2, 3 |
| 10 | 5, 6, 7, 8, 9 |
| 11 | 10 |
| 12 | 10, 11 |

### Agent Dispatch Summary
| Wave | Task Count | Categories |
|---|---:|---|
| 1 | 4 | deep, unspecified-high |
| 2 | 5 | visual-engineering, deep, unspecified-high |
| 3 | 3 | unspecified-high, writing |

## TODOs

- [x] 1. Establish Tailwind v4 foundation and residual CSS contract

  **What to do**: Reduce `src/app.css` to the approved residual CSS only: Tailwind import, token declarations via `@theme` / CSS variables, `@font-face`, and minimal base rules. Document the exact residual CSS contract at the top of the file so future contributors cannot re-expand it. Do not migrate selectors into another CSS file.
  **Must NOT do**: Do not introduce `tailwind.config.*`, `@apply`, `@utility`, CSS modules, or a new semantic helper stylesheet.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: needs architectural discipline around Tailwind v4 CSS-first constraints.
  - Skills: [] - Reason: no special skill required.
  - Omitted: [`frontend-ui-ux`] - Reason: this is foundation/policy work, not visual polish.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 3, 4, 5, 6, 7, 8, 9 | Blocked By: none

  **References**:
  - Pattern: `src/app.css` - Current styling monolith and target reduction surface.
  - Pattern: `vite.config.ts` - Existing Tailwind v4 Vite plugin setup.
  - Pattern: `package.json` - Confirms Tailwind v4 CSS-first stack already exists.
  - External: `https://tailwindcss.com/docs/functions-and-directives` - Tailwind v4 CSS-first directives.

  **Acceptance Criteria**:
  - [ ] `src/app.css` contains only approved residual CSS categories.
  - [ ] `grep -R "@apply\|@utility" . --include='*.css'` returns no matches.
  - [ ] No `tailwind.config.*` file is added.

  **QA Scenarios**:
  ```
  Scenario: Residual CSS contract is enforced
    Tool: Bash
    Steps: grep -n "@import 'tailwindcss'\|@theme\|@font-face" src/app.css > .sisyphus/evidence/task-1-tailwind-foundation.txt; grep -R "@apply\|@utility" . --include='*.css' >> .sisyphus/evidence/task-1-tailwind-foundation.txt
    Expected: app.css shows only approved directive categories; grep finds no forbidden directives.
    Evidence: .sisyphus/evidence/task-1-tailwind-foundation.txt

  Scenario: Legacy config workflow was not introduced
    Tool: Bash
    Steps: test ! -e tailwind.config.js && test ! -e tailwind.config.ts && test ! -e tailwind.config.cjs > .sisyphus/evidence/task-1-tailwind-foundation-error.txt
    Expected: no Tailwind config file exists unless explicitly documented as a blocker.
    Evidence: .sisyphus/evidence/task-1-tailwind-foundation-error.txt
  ```

  **Commit**: YES | Message: `refactor(styling): establish tailwind v4 foundation` | Files: `src/app.css`, optional config/doc comments only

- [x] 2. Canonicalize the token namespace and migration map

  **What to do**: Choose one canonical namespace for active styling tokens and migrate all active app surfaces to it. `--ts-*` should remain canonical unless a stronger reason is documented. Replace active `--color-*` usage in `ApiExplorer.svelte` and remove lingering `--sl-*` styling dependencies from active content/surfaces. If temporary aliases are needed, document them and remove them by Task 10.
  **Must NOT do**: Do not leave multiple active token namespaces in finished app code.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: token canonicalization affects every migrated surface.
  - Skills: [] - Reason: source understanding matters more than UI flair.
  - Omitted: [`frontend-ui-ux`] - Reason: not a design pass.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5, 6, 7, 8, 9 | Blocked By: 1

  **References**:
  - Pattern: `src/app.css` - Canonical token source today.
  - Pattern: `src/lib/components/ApiExplorer.svelte` - Active `--color-*` consumer.
  - Pattern: `src/content/docs/index.svx` - Lingering `--sl-*` styling reference.
  - Pattern: `src/lib/styles/reference-theme.css` - Legacy token family to prove unused before deletion.

  **Acceptance Criteria**:
  - [ ] Exactly one active token namespace remains in app code.
  - [ ] Active surfaces no longer use `--color-*` or `--sl-*` for styling.
  - [ ] Any temporary alias is documented and removed before final cleanup.

  **QA Scenarios**:
  ```
  Scenario: Canonical token namespace is enforced
    Tool: Bash
    Steps: grep -R --line-number "--color-\|--sl-" src > .sisyphus/evidence/task-2-token-map.txt; grep -R --line-number "--ts-" src >> .sisyphus/evidence/task-2-token-map.txt
    Expected: active styling references use only the canonical namespace except documented temporary shim locations.
    Evidence: .sisyphus/evidence/task-2-token-map.txt

  Scenario: API explorer no longer depends on secondary tokens
    Tool: Bash
    Steps: grep -n "--color-" src/lib/components/ApiExplorer.svelte > .sisyphus/evidence/task-2-token-map-error.txt
    Expected: no active `--color-*` token usage remains in ApiExplorer.
    Evidence: .sisyphus/evidence/task-2-token-map-error.txt
  ```

  **Commit**: YES | Message: `refactor(theme): canonicalize styling tokens` | Files: `src/app.css`, `src/lib/components/ApiExplorer.svelte`, affected content/components

- [x] 3. Replace runtime style hooks with explicit behavior contracts

  **What to do**: Audit and replace style-coupled runtime hooks with `data-*` attributes or lockstep markup updates. Priority contracts: code-block wrappers and copy-button mounting in `src/routes/[...slug]/+page.svelte`, heading-anchor stripping in `src/lib/content/index.ts`, and any hover/focus behavior in `CopyButton.svelte`. Keep behavior stable while decoupling it from semantic styling selectors.
  **Must NOT do**: Do not keep JS querying old style-only classes as a permanent solution.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: mixed DOM, behavior, and content-pipeline work.
  - Skills: [] - Reason: focused execution is sufficient.
  - Omitted: [`frontend-ui-ux`] - Reason: behavior contract first, polish later.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4, 5, 7, 8, 9, 10 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/routes/[...slug]/+page.svelte` - Copy-button mount/unmount and wrapper insertion logic.
  - Pattern: `src/lib/content/index.ts` - Heading extraction / `.heading-anchor` stripping logic.
  - Pattern: `src/lib/components/CopyButton.svelte` - Behavior currently coupled to prose/code wrappers.
  - Pattern: `scripts/mdsvex/shiki.mjs` - Code-block HTML shape.

  **Acceptance Criteria**:
  - [ ] Behavior hooks use `data-*` contracts or other non-style-coupled selectors.
  - [ ] TOC heading extraction still removes anchor glyph noise correctly.
  - [ ] Copy button still mounts, copies, and announces success without relying on old semantic CSS selectors.

  **QA Scenarios**:
  ```
  Scenario: Runtime hooks survive the contract migration
    Tool: Playwright
    Steps: open /guides/repository; focus first code block with keyboard; activate copy button; capture toast text; inspect DOM for data attributes on code wrapper/copy controls.
    Expected: copy button is reachable without hover, click/Enter copies content, toast says `Copied to clipboard!`, and hook attributes are present.
    Evidence: .sisyphus/evidence/task-3-runtime-contracts.png

  Scenario: TOC text remains clean
    Tool: Bash
    Steps: npm run build > /dev/null && python3 -m http.server 4173 --directory build >/tmp/task3-server.log 2>&1 & sleep 3; curl -s http://127.0.0.1:4173/guides/repository/ > .sisyphus/evidence/task-3-runtime-contracts-error.html; pkill -f "http.server 4173"
    Expected: rendered HTML and TOC labels do not contain anchor glyph text or duplicated heading text.
    Evidence: .sisyphus/evidence/task-3-runtime-contracts-error.html
  ```

  **Commit**: YES | Message: `refactor(content): replace runtime style hooks with data contracts` | Files: `src/routes/[...slug]/+page.svelte`, `src/lib/content/index.ts`, `src/lib/components/CopyButton.svelte`, related helpers

- [x] 4. Migrate rendered-content styling to Tailwind wrapper patterns

  **What to do**: Replace `.prose-shell`, admonition, heading-anchor, code-title, code-wrapper, table, and descendant content selectors with Tailwind-native wrapper strategies. Use wrapper markup and arbitrary variants in route/component templates rather than a global prose stylesheet. Do not add the typography plugin unless a concrete blocker is documented and approved.
  **Must NOT do**: Do not preserve descendant selector styling in `src/app.css` as the finished solution.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: rendered HTML + Tailwind arbitrary-variant strategy is the hardest architectural surface.
  - Skills: [] - Reason: content/rendering accuracy matters most.
  - Omitted: [`frontend-ui-ux`] - Reason: this is an architectural styling migration, not a redesign.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6, 7, 8, 10 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/routes/[...slug]/+page.svelte` - Main rendered docs/blog surface.
  - Pattern: `scripts/mdsvex/directive-admonitions.mjs` - Admonition HTML contract.
  - Pattern: `scripts/mdsvex/shiki.mjs` - Code-block metadata contract.
  - Pattern: `src/app.css` - Current prose/content selector inventory.

  **Acceptance Criteria**:
  - [ ] Rendered docs/blog/API content styling is owned by Tailwind wrapper markup, not global semantic selectors.
  - [ ] Code blocks, admonitions, tables, anchors, and heading spacing still render correctly.
  - [ ] No typography plugin or new semantic CSS helper layer is introduced.

  **QA Scenarios**:
  ```
  Scenario: Rendered docs content preserves functionality after prose migration
    Tool: Playwright
    Steps: open /guides/repository at 1280px; verify headings, admonition, code block title, table, and prev/next nav all render with spacing and contrast.
    Expected: all rendered-content elements are styled and readable without relying on legacy semantic CSS.
    Evidence: .sisyphus/evidence/task-4-rendered-content.png

  Scenario: No prose-selector CSS remains as primary styling layer
    Tool: Bash
    Steps: grep -n "prose-shell\|admonition\|heading-anchor\|code-title\|code-block-wrapper" src/app.css > .sisyphus/evidence/task-4-rendered-content-error.txt
    Expected: app.css does not retain those semantic styling selectors except documented temporary transition comments prior to Task 10 cleanup.
    Evidence: .sisyphus/evidence/task-4-rendered-content-error.txt
  ```

  **Commit**: YES | Message: `refactor(content): migrate rendered surfaces to tailwind wrappers` | Files: route templates, mdsvex helper outputs, minimal residual CSS

- [ ] 5. Migrate MDX primitives and docs widgets to Tailwind

  **What to do**: Convert `src/lib/mdx/*` components (`Card`, `CardGrid`, `FeatureGrid`, `Tabs`, `TabItem`, `Steps`, `LinkCard`) to Tailwind utility styling and remove their dependency on global semantic classes or global CSS descendant styling. Ensure tabs/interactions continue to work with class/state hooks updated to data attributes if needed.
  **Must NOT do**: Do not solve MDX component styling by leaving the old semantic classes in place.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: reusable UI primitives need clean utility composition.
  - Skills: [`frontend-ui-ux`] - Reason: utility-heavy component markup should remain readable and polished.
  - Omitted: [] - Reason: no omission needed.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6, 10 | Blocked By: 1, 2, 3, 4

  **References**:
  - Pattern: `src/lib/mdx/Card.svelte`
  - Pattern: `src/lib/mdx/CardGrid.svelte`
  - Pattern: `src/lib/mdx/FeatureGrid.svelte`
  - Pattern: `src/lib/mdx/Tabs.svelte`
  - Pattern: `src/lib/mdx/TabItem.svelte`
  - Pattern: `src/lib/mdx/Steps.svelte`
  - Pattern: `src/lib/mdx/LinkCard.svelte`

  **Acceptance Criteria**:
  - [ ] All MDX primitives render with Tailwind utilities only.
  - [ ] Tabs/cards/steps/widgets preserve layout and interaction behavior.
  - [ ] No MDX primitive requires legacy global semantic selectors.

  **QA Scenarios**:
  ```
  Scenario: MDX widgets render correctly on docs pages
    Tool: Playwright
    Steps: open a docs page using cards/tabs/steps; switch tabs; inspect spacing, card borders, and focus states.
    Expected: widgets render and interact correctly with Tailwind-only styling.
    Evidence: .sisyphus/evidence/task-5-mdx-primitives.png

  Scenario: No primitive-scoped CSS remains
    Tool: Bash
    Steps: grep -R "<style[ >]" src/lib/mdx --include='*.svelte' > .sisyphus/evidence/task-5-mdx-primitives-error.txt
    Expected: no MDX primitive contains a scoped style block.
    Evidence: .sisyphus/evidence/task-5-mdx-primitives-error.txt
  ```

  **Commit**: YES | Message: `refactor(mdx): migrate docs widgets to tailwind` | Files: `src/lib/mdx/*`

- [ ] 6. Migrate homepage and docs landing content to Tailwind-native markup

  **What to do**: Convert `src/content/docs/index.svx` and `src/routes/+page.svelte` away from presentational classes and inline styles. Replace `hero-*`, `btn-gradient`, `btn-outline`, `gradient-text`, `sl-link-button`, and lingering Starlight token usage with Tailwind utility strings or small reusable Svelte wrappers already established in the migration.
  **Must NOT do**: Do not keep inline `style=` attributes or `--sl-*` references in content as a permanent solution.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: homepage/landing surfaces are layout-heavy and visually sensitive.
  - Skills: [`frontend-ui-ux`] - Reason: hero and CTA surfaces need a clean utility translation.
  - Omitted: [] - Reason: none.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 10 | Blocked By: 1, 2, 4, 5

  **References**:
  - Pattern: `src/content/docs/index.svx` - Largest content-side styling hotspot.
  - Pattern: `src/routes/+page.svelte` - Homepage wrapper consuming rendered content.
  - Pattern: `src/app.css` - Current hero/button semantic selector inventory.

  **Acceptance Criteria**:
  - [ ] Homepage/landing content uses Tailwind utilities or migrated wrappers only.
  - [ ] No inline `style=` remains in `src/content/docs/index.svx`.
  - [ ] No stale `sl-*` styling token/class remains in homepage markup.

  **QA Scenarios**:
  ```
  Scenario: Homepage remains visually stable across breakpoints
    Tool: Playwright
    Steps: open / at 390px and 1280px; verify hero, CTA buttons, feature grids, and no horizontal overflow.
    Expected: homepage loads with intact hierarchy and responsive layout.
    Evidence: .sisyphus/evidence/task-6-homepage.png

  Scenario: Landing content is free of inline styling debt
    Tool: Bash
    Steps: grep -n "style=" src/content/docs/index.svx > .sisyphus/evidence/task-6-homepage-error.txt; grep -n "--sl-\|sl-link-button" src/content/docs/index.svx src/routes/+page.svelte >> .sisyphus/evidence/task-6-homepage-error.txt
    Expected: no inline styles or stale Starlight styling references remain.
    Evidence: .sisyphus/evidence/task-6-homepage-error.txt
  ```

  **Commit**: YES | Message: `refactor(home): migrate landing surfaces to tailwind` | Files: `src/content/docs/index.svx`, `src/routes/+page.svelte`, reused wrappers/components

- [ ] 7. Migrate shared shell, navigation, search, sidebar, footer, and layout surfaces

  **What to do**: Convert shared route/component surfaces to Tailwind utilities: `src/routes/+layout.svelte`, `src/lib/components/Header.svelte`, `SearchOverlay.svelte`, `DocsSidebar.svelte`, `Footer.svelte`, and any related announcement/mobile-nav markup. Preserve focus states, reduced-motion behavior, and search overlay interactions.
  **Must NOT do**: Do not leave shared shells styled by legacy `.site-*`, `.docs-*`, `.search-*`, or similar semantic selectors.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: shared shell migration touches nearly all pages.
  - Skills: [`frontend-ui-ux`] - Reason: needs careful responsive and accessibility translation.
  - Omitted: [] - Reason: none.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 10, 12 | Blocked By: 1, 2, 3, 4

  **References**:
  - Pattern: `src/routes/+layout.svelte`
  - Pattern: `src/lib/components/Header.svelte`
  - Pattern: `src/lib/components/SearchOverlay.svelte`
  - Pattern: `src/lib/components/DocsSidebar.svelte`
  - Pattern: `src/lib/components/Footer.svelte`
  - Pattern: `src/app.css` - Existing shell/nav/search/sidebar selectors.

  **Acceptance Criteria**:
  - [ ] Shared shell surfaces use Tailwind utilities only.
  - [ ] Search overlay, mobile nav, sidebar expansion, and announcement interactions still work.
  - [ ] Keyboard focus and reduced-motion behaviors remain intact.

  **QA Scenarios**:
  ```
  Scenario: Shared shell works across docs navigation flows
    Tool: Playwright
    Steps: open /guides/repository; open search; close search; expand/collapse sidebar groups; navigate via header and footer links.
    Expected: all interactions work with visible focus states and no layout breakage.
    Evidence: .sisyphus/evidence/task-7-shared-shell.png

  Scenario: Shared shell leaves no scoped styles behind
    Tool: Bash
    Steps: grep -R "<style[ >]" src/routes/+layout.svelte src/lib/components/Header.svelte src/lib/components/SearchOverlay.svelte src/lib/components/DocsSidebar.svelte src/lib/components/Footer.svelte > .sisyphus/evidence/task-7-shared-shell-error.txt
    Expected: no scoped styles remain in shared shell files.
    Evidence: .sisyphus/evidence/task-7-shared-shell-error.txt
  ```

  **Commit**: YES | Message: `refactor(shell): migrate shared app chrome to tailwind` | Files: layout/header/search/sidebar/footer components

- [ ] 8. Migrate blog surfaces to Tailwind-only styling

  **What to do**: Convert `src/routes/blog/+page.svelte` and the blog-rendering branch of `src/routes/[...slug]/+page.svelte` to Tailwind utilities. Remove route-scoped `<style>` rules and preserve blog metadata presentation, canonical tags, author blocks, cards, and RSS-related markup assumptions.
  **Must NOT do**: Do not leave blog card/article styles in route-scoped CSS or `src/app.css`.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: blog cards and article chrome are visually distinct surfaces.
  - Skills: [`frontend-ui-ux`] - Reason: utility translation should keep hierarchy and readability.
  - Omitted: [] - Reason: none.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 10, 12 | Blocked By: 1, 2, 4

  **References**:
  - Pattern: `src/routes/blog/+page.svelte`
  - Pattern: `src/routes/[...slug]/+page.svelte`
  - Pattern: `src/routes/blog/rss.xml/+server.ts` - Blog output contract to preserve.

  **Acceptance Criteria**:
  - [ ] Blog index and blog article chrome use Tailwind utilities only.
  - [ ] Blog cards, author blocks, canonical metadata, and RSS assumptions remain intact.
  - [ ] No blog route `<style>` blocks remain.

  **QA Scenarios**:
  ```
  Scenario: Blog surfaces preserve hierarchy and metadata
    Tool: Playwright
    Steps: open /blog/ and /blog/introducing-terrascale/; verify card spacing, titles, author block, metadata row, and canonical link presence in page source.
    Expected: blog index and article remain styled and structured correctly.
    Evidence: .sisyphus/evidence/task-8-blog.png

  Scenario: Blog route styling is fully migrated
    Tool: Bash
    Steps: grep -R "<style[ >]" src/routes/blog/+page.svelte src/routes/[...slug]/+page.svelte > .sisyphus/evidence/task-8-blog-error.txt
    Expected: no scoped style blocks remain in blog surfaces.
    Evidence: .sisyphus/evidence/task-8-blog-error.txt
  ```

  **Commit**: YES | Message: `refactor(blog): migrate blog surfaces to tailwind` | Files: blog route files and any reused components

- [ ] 9. Migrate API explorer and related route surfaces to Tailwind-only styling

  **What to do**: Convert `src/lib/components/ApiExplorer.svelte` and `src/routes/reference/api/explorer/+page.svelte` to Tailwind utilities, remove scoped CSS, and normalize the explorer onto the canonical token namespace. Preserve deferred loading behavior, operation expansion, response rendering, and mobile responsiveness.
  **Must NOT do**: Do not leave explorer styling in scoped CSS or keep the secondary token family.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: large component with stateful UI and token migration.
  - Skills: [`frontend-ui-ux`] - Reason: explorer readability matters, but logic complexity is high.
  - Omitted: [] - Reason: none.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 10, 12 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/lib/components/ApiExplorer.svelte`
  - Pattern: `src/routes/reference/api/explorer/+page.svelte`
  - Pattern: `static/openapi/terrascale.yaml` - Data contract to preserve.

  **Acceptance Criteria**:
  - [ ] Explorer surfaces use Tailwind utilities only.
  - [ ] Explorer uses canonical tokens only.
  - [ ] Deferred route behavior and operation expansion remain intact.

  **QA Scenarios**:
  ```
  Scenario: Explorer still works after Tailwind migration
    Tool: Playwright
    Steps: open /reference/api/explorer; expand an operation; verify `Responses` section appears; repeat at 390px width and verify no horizontal page overflow.
    Expected: explorer remains functional and responsive.
    Evidence: .sisyphus/evidence/task-9-api-explorer.png

  Scenario: Explorer no longer carries scoped CSS or secondary tokens
    Tool: Bash
    Steps: grep -n "<style[ >]\|--color-" src/lib/components/ApiExplorer.svelte src/routes/reference/api/explorer/+page.svelte > .sisyphus/evidence/task-9-api-explorer-error.txt
    Expected: no scoped styles and no `--color-*` token usage remain.
    Evidence: .sisyphus/evidence/task-9-api-explorer-error.txt
  ```

  **Commit**: YES | Message: `refactor(api): migrate explorer styling to tailwind` | Files: explorer component/route and token consumers

- [ ] 10. Remove remaining scoped styles, semantic styling selectors, and orphan CSS assets

  **What to do**: After Waves 1-2 land, delete all remaining route/component `<style>` blocks, remove style-only semantic selectors from `src/app.css`, and delete orphan style assets only after proving zero references. This includes evaluating and removing `src/lib/styles/reference-theme.css`, `reference-print.css`, and `reference-expressive.css` if unused.
  **Must NOT do**: Do not delete assets without proving zero references via grep/glob; do not leave temporary token shims or old selectors in place.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: repo-wide cleanup with proof requirements.
  - Skills: [] - Reason: grep/glob-driven cleanup.
  - Omitted: [`frontend-ui-ux`] - Reason: cleanup, not design work.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 11, 12 | Blocked By: 5, 6, 7, 8, 9

  **References**:
  - Pattern: `src/app.css`
  - Pattern: `src/routes/reference/api/explorer/+page.svelte`
  - Pattern: `src/routes/blog/+page.svelte`
  - Pattern: `src/routes/[...slug]/+page.svelte`
  - Pattern: `src/lib/components/ApiExplorer.svelte`
  - Pattern: `src/lib/components/Toast.svelte`
  - Pattern: `src/lib/components/CopyButton.svelte`
  - Pattern: `src/lib/styles/reference-theme.css`
  - Pattern: `src/lib/styles/reference-print.css`
  - Pattern: `src/lib/styles/reference-expressive.css`

  **Acceptance Criteria**:
  - [ ] `grep -R "<style[ >]" src --include='*.svelte'` returns no matches.
  - [ ] `src/app.css` no longer contains style-only semantic selectors.
  - [ ] Orphan style assets are removed only after zero-reference proof.

  **QA Scenarios**:
  ```
  Scenario: Repo-wide scoped CSS cleanup is complete
    Tool: Bash
    Steps: grep -R "<style[ >]" src --include='*.svelte' > .sisyphus/evidence/task-10-cleanup.txt; grep -R "class=\"[^\"]*ts-\|hero-\|blog-card\|docs-shell\|sl-link-button" src --include='*.svelte' --include='*.svx' >> .sisyphus/evidence/task-10-cleanup.txt
    Expected: no scoped style blocks remain and style-only semantic class names have been removed from active source.
    Evidence: .sisyphus/evidence/task-10-cleanup.txt

  Scenario: Orphan CSS deletion is proven safe
    Tool: Bash
    Steps: grep -R "reference-theme\|reference-print\|reference-expressive" . > .sisyphus/evidence/task-10-cleanup-error.txt
    Expected: grep proves no active references remain after deletion or documents any approved retained file.
    Evidence: .sisyphus/evidence/task-10-cleanup-error.txt
  ```

  **Commit**: YES | Message: `chore(styling): remove legacy css and scoped styles` | Files: `src/app.css`, all scoped-style files, orphan CSS assets

- [ ] 11. Update styling documentation and policy files

  **What to do**: Rewrite `THEME.md`, `README.md`, and `AGENTS.md` so they accurately describe the SvelteKit + Tailwind v4 CSS-first architecture, allowed residual CSS, canonical token source of truth, and contributor rules banning custom selectors/scoped styles. Update `src/content/docs/dashboard/why-open-source.md` if its Tailwind wording or styling guidance is now inaccurate.
  **Must NOT do**: Do not leave stale Astro/Starlight paths or old CSS design-system guidance in docs.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: documentation/policy precision is the primary deliverable.
  - Skills: [] - Reason: direct technical writing task.
  - Omitted: [`frontend-ui-ux`] - Reason: docs, not UI code.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 12 | Blocked By: 10

  **References**:
  - Pattern: `THEME.md`
  - Pattern: `README.md`
  - Pattern: `AGENTS.md`
  - Pattern: `src/content/docs/dashboard/why-open-source.md`
  - Pattern: `src/app.css` - Final residual CSS contract to document.
  - Pattern: `vite.config.ts` - Actual Tailwind v4 integration to document.

  **Acceptance Criteria**:
  - [ ] Docs accurately describe SvelteKit + Tailwind v4 CSS-first styling.
  - [ ] Docs ban custom selectors/scoped styles and define the approved residual CSS contract.
  - [ ] Grep finds no stale Astro/Starlight/style-path references in updated docs.

  **QA Scenarios**:
  ```
  Scenario: Style-policy docs are internally consistent
    Tool: Bash
    Steps: grep -R "Astro\|Starlight\|astro.config\|src/index.css\|src/pages/\|src/components/" README.md THEME.md AGENTS.md > .sisyphus/evidence/task-11-docs.txt
    Expected: no stale architecture/style references remain.
    Evidence: .sisyphus/evidence/task-11-docs.txt

  Scenario: Policy now enforces Tailwind-only rules
    Tool: Bash
    Steps: grep -n "Tailwind\|scoped style\|custom selector\|@apply\|@utility" README.md THEME.md AGENTS.md > .sisyphus/evidence/task-11-docs-error.txt
    Expected: documentation explicitly states the final styling policy and forbidden patterns.
    Evidence: .sisyphus/evidence/task-11-docs-error.txt
  ```

  **Commit**: YES | Message: `docs(styling): codify tailwind-only architecture` | Files: `THEME.md`, `README.md`, `AGENTS.md`, related docs content

- [ ] 12. Run repo-wide hygiene and functional QA gates

  **What to do**: Run the full migration proof set: `npm run check`, `npm run build`, grep hygiene checks, curl checks against the built site, and Playwright flows for homepage, docs code-copy/TOC, and API explorer. Capture all evidence and fix any leftover styling regressions before final verification.
  **Must NOT do**: Do not mark the migration complete while any scoped style, stale doc ref, semantic style class, or failing QA gate remains.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: broad execution + verification across tooling.
  - Skills: [`dev-browser`] - Reason: browser QA is required for interaction-heavy surfaces.
  - Omitted: [] - Reason: none.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final Verification Wave | Blocked By: 10, 11

  **References**:
  - Pattern: `package.json` - `check` and `build` commands.
  - Pattern: `src/routes/[...slug]/+page.svelte` - Docs copy/TOC interactions.
  - Pattern: `src/routes/reference/api/explorer/+page.svelte` - Explorer QA target.
  - Pattern: `README.md`, `THEME.md`, `AGENTS.md` - Doc hygiene targets.

  **Acceptance Criteria**:
  - [ ] `npm run check` exits `0`.
  - [ ] `npm run build` exits `0`.
  - [ ] Repo-hygiene grep checks pass.
  - [ ] Playwright happy-path and edge-path flows pass.

  **QA Scenarios**:
  ```
  Scenario: Full repo hygiene gate passes
    Tool: Bash
    Steps: npm run check > .sisyphus/evidence/task-12-qa.txt 2>&1 && npm run build >> .sisyphus/evidence/task-12-qa.txt 2>&1 && grep -R "<style[ >]" src --include='*.svelte' >> .sisyphus/evidence/task-12-qa.txt && grep -R "@apply\|@utility" . --include='*.css' >> .sisyphus/evidence/task-12-qa.txt
    Expected: build/check succeed and hygiene grep outputs are empty where required.
    Evidence: .sisyphus/evidence/task-12-qa.txt

  Scenario: Critical user-facing flows still work
    Tool: Playwright
    Steps: verify `/` at 390px and 1280px has no horizontal overflow; verify `/guides/repository` copy button works and TOC text is clean; verify `/reference/api/explorer` expands an operation and shows `Responses`.
    Expected: key public flows remain functional and visually intact after migration.
    Evidence: .sisyphus/evidence/task-12-qa.png
  ```

  **Commit**: YES | Message: `test(styling): verify tailwind-only migration` | Files: QA evidence only if tracked by repo policy; otherwise no source changes

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ Playwright for interaction-heavy surfaces)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit 1: `refactor(styling): establish tailwind foundation and token contracts`
- Commit 2: `refactor(content): migrate rendered docs and mdx widgets to tailwind`
- Commit 3: `refactor(ui): migrate shared shells blog and explorer to tailwind`
- Commit 4: `chore(styling): remove legacy css and codify policy`

## Success Criteria
- Active app styling is expressed through Tailwind utilities/components plus the approved minimal token layer only.
- No route/component `<style>` blocks remain.
- No style-only semantic class system (`ts-*`, `hero-*`, `blog-card`, `docs-shell`, `sl-link-button`, etc.) remains in active source.
- One canonical token namespace remains across the app.
- Docs/blog/API/home surfaces preserve current behavior without a redesign detour.
- `THEME.md`, `README.md`, and `AGENTS.md` accurately document the Tailwind-only architecture and contributor rules.
