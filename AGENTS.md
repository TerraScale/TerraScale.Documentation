## Stack

- **Only SvelteKit** is allowed for all UI and application work in this repository. Do not use any other framework (e.g., Next.js, Remix).
- Use Svelte 5 with TypeScript. Runes syntax (`$state`, `$derived`, `$effect`, etc.) is the default.
- Do not introduce any non-Svelte framework under any circumstances.

## Styling Policy

- **Tailwind-only**: Use Tailwind CSS v4 for all styling.
- **No Scoped Styles**: Do not use `<style>` blocks in Svelte components.
- **No Custom CSS**: Do not use `@apply`, `@utility`, or custom CSS selectors.
- **CSS-First Config**: All theme tokens live in the `@theme` block in `src/app.css`. Do not create a `tailwind.config.*` file.
- **Residual CSS**: Custom CSS in `src/app.css` is restricted to the `@theme` block, `@font-face`, base element resets, and essential utilities like `.sr-only`.
- **Generated Content**: Style Markdown-generated content using the `data-prose` attribute wrapper and Tailwind arbitrary variants (e.g., `[data-prose]:[&_h1]:text-3xl`).

## Typography

- **Quantico-only**: Use self-hosted `Quantico` for both display and body typography across the app. Do not introduce `Inter`, external font CDNs, or runtime font packages unless these repo rules change.
- **Local Assets Only**: Keep canonical font files checked into `static/fonts/` as `woff2` assets.
- **Best Practices**: Define `@font-face` in `src/app.css` with `font-display: swap`, keep the shared font family values in the `@theme` block, and preload only the critical weights actually used above the fold in `src/app.html`.
- **Component Usage**: Prefer the shared Quantico font setup and Tailwind utilities over ad hoc `font-family` declarations in components.

## Writing Style

- **No Em Dashes**: Never use em dashes in code, content, UI copy, docs, or comments.
- **Replace Existing Em Dashes**: If you encounter an em dash character, remove it and rewrite the sentence with a comma, period, colon, or plain hyphen as appropriate.
- **Theme Consistency**: This rule also applies to `THEME.md` and all user-facing theme guidance.

## Deployment

- Deployments use the simpler Cloudflare Pages static upload flow.
- Prefer solutions that work cleanly as a static site build output.
- Do not assume SSR, server adapters, or Cloudflare Workers are part of the deployment setup unless the repo instructions are changed.
- RSS is not needed in this repository. Do not add or maintain RSS feeds unless the repo instructions are changed.

## Icons

- Source icons from Iconify, but do not render them through an npm runtime or build plugin in the app.
- Host checked-in individual SVG files in `public/icons/`; do not use sprite sheets for this repo.
- Render icons through the local Svelte wrapper and registry, not by importing icon packages directly in components.
- When adding or changing icons, update `scripts/icons-manifest.mjs` and run `npm run icons:sync`.
- Prefer `lucide` icons from Iconify for generic UI glyphs and `simple-icons` from Iconify for brand/social logos.
- Keep icon SVGs monochrome and `currentColor`-driven so Tailwind/text color classes control their appearance.
- Do not add or prefer React, Lucide, or runtime/build icon packages for new work here unless these repo rules are changed first.
