* Removed Playwright by deleting its config, test file, and package entries, then ran npm install to refresh the lockfile.
* Repo-wide references should be checked after cleanup; node_modules will still contain Playwright strings locally, but tracked files should not.
* SvelteKit needed explicit root config: mdsvex must be registered for `.md` and `.svx` in both `extensions` and the mdsvex preprocessor, with mdsvex ordered before `vitePreprocess()`.
* Static output is now pinned explicitly via `adapter-static({ pages: 'build', assets: 'build' })`, `kit.prerender.entries = ['*']`, and `kit.paths.relative = false`, while the existing `vite build && pagefind --site build` flow still succeeds.
* The raw content loader must include `.svx` everywhere it derives routes from source filenames; updating the `import.meta.glob` pattern alone is not enough without extending the filename-stripping regex too.
* Content frontmatter parsing is safest when normalized through small typed helpers; that keeps additive metadata fields deterministic without introducing strict runtime validation that can break the build.
* Draft entries should be filtered at the content index boundary, while unlisted entries should stay routable/prerendered but drop out of listed collections such as sidebar and search data.
