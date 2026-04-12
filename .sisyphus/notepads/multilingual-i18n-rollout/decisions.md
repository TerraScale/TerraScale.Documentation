## Decisions
- 2026-04-11: Accepted T1 scope creep (DocsNavTree, MobileNav, navigation.ts extraction) as beneficial for i18n work. These refactors will be needed when adding locale-aware navigation and language switcher.
- 2026-04-11: Using locale-prefixed URL routing (`/en/`, `/pt-br/`, `/es/`) instead of cookie/localStorage/browser detection.
- 2026-04-11: Machine translation is acceptable for launch quality.
- 2026-04-11: All content lives under `src/content/docs/{locale}/` with mirrored slug structure.
- 2026-04-12: Keep legacy `$lib/content` exports pinned to English for redirect shims and global non-localized endpoints, while adding parallel `getLocale*` exports for locale-prefixed routes.
- 2026-04-12: Build a per-locale content index map eagerly at module load. Three locales and a small docs corpus do not justify lazy initialization complexity.
- 2026-04-12: Treat `/`, `/blog/`, `/roadmap/`, and `/reference/api/explorer/` as always-localized SEO routes in the helper module, because they render under locale-prefixed wrappers even when they are not backed by a locale content entry lookup.

## Language Switcher Component
- Created `LanguageSwitcher.svelte` using Svelte 5 runes (`$state`, `$derived`).
- Placed the switcher in the header navigation and mobile drawer.
- Used `lucide:globe` and `lucide:check` icons, adding `check` to `icons-manifest.mjs`.
- Implemented `toLocaleHref` to prefix internal links with the current locale.
- Updated `isActive` in `navigation.ts` to strip locale prefixes before matching paths.
