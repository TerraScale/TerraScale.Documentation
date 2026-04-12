- 2026-04-11: `src/content/docs/reference/api.md` must stay in `IGNORED_SOURCE_PATHS`; otherwise it collides with `src/content/docs/reference/api/index.svx` for `/reference/api/`.
- 2026-04-11: The docs content pipeline already preserves `openapi` frontmatter through `getOpenApiMeta`, so adding `openapi.spec` and `openapi.tag` metadata to API content pages requires no pipeline changes beyond keeping the duplicate placeholder ignored.

- Final polish pass confirmed draft filtering still flows from `isPublicEntry`/`isListedEntry`, and the new `/blog/rss.xml` endpoint now consumes `allBlogEntries` so drafts stay excluded from the RSS feed too.
- Shiki output needed its generated `tabindex` removed in `scripts/mdsvex/shiki.mjs` to eliminate accessibility warnings during `npm run build`.
- 2026-04-11: Shared prose utility classes can live in `src/lib/styles/*.ts` even after the old CSS-only styles directory was removed; route components can import those constants directly without changing rendered markup.
## 2026-04-11
- `src/content/docs/index.svx` only needs `CardGrid` and `Tabs` from `$lib/mdx`; `Card`, `LinkCard`, and `TabItem` were unused.
- `npm run check` and `npm run build` succeeded after the import cleanup; remaining output was only the existing Svelte `<slot>` deprecation warnings in `Tabs.svelte` and `TabItem.svelte`.
