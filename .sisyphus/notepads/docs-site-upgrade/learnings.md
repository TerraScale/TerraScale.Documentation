- 2026-04-11: `src/content/docs/reference/api.md` must stay in `IGNORED_SOURCE_PATHS`; otherwise it collides with `src/content/docs/reference/api/index.svx` for `/reference/api/`.
- 2026-04-11: The docs content pipeline already preserves `openapi` frontmatter through `getOpenApiMeta`, so adding `openapi.spec` and `openapi.tag` metadata to API content pages requires no pipeline changes beyond keeping the duplicate placeholder ignored.

- Final polish pass confirmed draft filtering still flows from `isPublicEntry`/`isListedEntry`, and the new `/blog/rss.xml` endpoint now consumes `allBlogEntries` so drafts stay excluded from the RSS feed too.
- Shiki output needed its generated `tabindex` removed in `scripts/mdsvex/shiki.mjs` to eliminate accessibility warnings during `npm run build`.
