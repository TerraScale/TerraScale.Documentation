# TerraScale Documentation

Official documentation for TerraScale, built with SvelteKit and Tailwind CSS v4.

## Getting Started

```bash
npm install      # Install dependencies
npm run dev      # Start the dev server
```

## Commands

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `npm install`   | Install dependencies                        |
| `npm run dev`   | Start the local dev server                  |
| `npm run build` | Build the production site to `./build/`     |
| `npm run preview` | Preview the production build locally      |

## Project Structure

```
src/
├── content/docs/ # Markdown/MDX documentation files
├── lib/          # Shared components and utilities
├── routes/       # SvelteKit routes and pages
└── app.css       # Tailwind v4 theme and global styles
```

Documentation is written in `.md` or `.svx` files in `src/content/docs/`.

## Styling

This project uses **Tailwind CSS v4** with a CSS-first configuration. All theme tokens and global styles are defined in `src/app.css`. Scoped styles and custom CSS selectors are forbidden.

See [THEME.md](./THEME.md) for the full styling policy and token reference.

## Configuration

- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite configuration
- `src/app.css` - Tailwind v4 theme and tokens
