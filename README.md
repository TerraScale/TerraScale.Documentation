# TerraScale Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Official documentation for TerraScale, available at [docs.terrascale.tech](https://docs.terrascale.tech).

## Getting Started

```bash
bun install      # Install dependencies
bun run dev      # Start dev server at localhost:4321
```

## Commands

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `bun install`   | Install dependencies                        |
| `bun run dev`   | Start local dev server at `localhost:4321`  |
| `bun run build` | Build production site to `./dist/`          |
| `bun run preview` | Preview production build locally          |

## Project Structure

```
src/content/docs/
├── guides/      # Getting started, SDKs, querying
├── reference/   # API, pricing, regions, comparisons
├── dashboard/   # Dashboard documentation
├── roadmap/     # Product roadmap
├── about/       # About section
└── blog/        # Blog posts
```

Documentation is written in `.md` or `.mdx` files in `src/content/docs/`. Each file becomes a route based on its filename.

## Configuration

- `astro.config.mjs` - Starlight config and sidebar structure
- `src/content.config.ts` - Content collections schema
- `src/styles/global.css` - Tailwind CSS customizations

## Resources

- [Starlight Documentation](https://starlight.astro.build/)
- [Astro Documentation](https://docs.astro.build)
