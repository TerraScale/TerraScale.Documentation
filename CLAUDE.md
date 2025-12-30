# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Style

When writing documentation:
- Use clear, plain language that is easy to understand
- Write in a developer-friendly tone - be direct and practical
- Avoid jargon; when technical terms are necessary, explain them
- Prefer active voice and concise sentences
- Create diagrams when they help explain concepts (use Mermaid or similar)
- Keep documentation modern, visually clean, and easy to navigate
- Ensure content is searchable and indexable - use descriptive headings, proper frontmatter, and semantic structure

## Project Overview

TerraScale Documentation site built with Astro and Starlight (documentation framework). The site is deployed at https://docs.terrascale.tech.

## Commands

```bash
bun run dev      # Start dev server at localhost:4321
bun run build    # Build production site to ./dist/
bun run preview  # Preview production build locally
```

## Permissions

You are allowed to install any packages or dependencies needed to complete tasks (use `bun add`).

## Architecture

### Tech Stack
- **Astro 5** with **Starlight** documentation framework
- **Tailwind CSS 4** via Vite plugin
- Starlight plugins: `starlight-blog`, `starlight-heading-badges`, `starlight-links-validator` (disabled), `starlight-openapi` (disabled)

### Content Structure
Documentation lives in `src/content/docs/` as `.md` or `.mdx` files. Each file becomes a route based on its filename.

```
src/content/docs/
├── guides/      # Getting started, SDKs, querying guides
├── reference/   # API, pricing, regions, comparisons
├── dashboard/   # Dashboard documentation
├── roadmap/     # Product roadmap
├── about/       # About section
├── blog/        # Blog posts (via starlight-blog)
└── index.mdx    # Homepage
```

### Key Configuration Files
- `astro.config.mjs` - Starlight config, sidebar structure, plugins
- `src/content.config.ts` - Content collections schema (extends blog schema)
- `src/styles/global.css` - Tailwind/Starlight CSS layers

### Sidebar
Sidebar is auto-generated from directory structure. To add new sections, update the `sidebar` array in `astro.config.mjs`.
