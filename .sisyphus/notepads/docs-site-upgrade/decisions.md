- 2026-04-11: Kept `/reference/api/` as the default static-first experience and moved the interactive experience to `/reference/api/explorer/` so explorer code only loads on explicit visits.
- 2026-04-11: Implemented the explorer as a lightweight custom Svelte component that fetches `/openapi/terrascale.yaml` and parses it client-side instead of adding Swagger/Redoc dependencies.
- 2026-04-11: Fixed existing Svelte 5 runes-mode route prop declarations (`export let data`) while verifying this task so the site build can succeed.

- Removed stale renderer/search dependencies (`gray-matter`, `marked`, `minisearch`, `svelte-highlight`) and deleted the unused `scripts/normalize-content.mjs` migration script because the docs pipeline is fully mdsvex + Shiki + Pagefind now.
- Kept the final polish pass scoped to UX/accessibility/perf cleanup by adding reduced-motion/focus-visible treatment, fixing stale CSS vars on blog/article/API pages, and restoring the missing RSS artifact rather than introducing new product features.
- 2026-04-11: Consolidated the duplicated `proseShellClasses` Tailwind class list into `src/lib/styles/prose-shell.ts` so the home and doc article routes share one byte-identical source of truth.
