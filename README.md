# TerraScale Documentation

Official documentation for TerraScale, built with SvelteKit and Tailwind CSS v4. This repo is the home for product guides, reference material, roadmap notes, account help, and blog content.

## Getting Started

To run the docs locally:

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

## Documentation Structure

The documentation uses filesystem-driven navigation. Folder names and file locations in `src/content/docs/` determine the URL structure and sidebar organization.

Content is grouped into these main sections:

- `guides/` for task-focused walkthroughs and onboarding material
- `reference/` for API and product reference pages
- `roadmap/` for planning, milestones, and direction
- `about/` for company and product background
- `account/` for login, registration, verification, and account management
- `blog/` for announcements, updates, and longer-form posts

When adding a new page, place it in the section that best matches the reader's goal. If you are unsure where something belongs, start by checking nearby files in `src/content/docs/` for existing patterns.

## Contributing

Thanks for helping improve the docs.

When authoring content:

- Write in a friendly, direct tone
- Keep heading levels in order, without skipping levels
- Avoid em dashes. Use commas, periods, or parentheses instead
- Prefer short paragraphs, clear examples, and descriptive link text
- Keep related pages connected with links when it helps readers move to the next step

For styling and content conventions, see [THEME.md](./THEME.md). For account-focused examples, browse the pages in [`src/content/docs/account/`](./src/content/docs/account/).

## Styling

This project uses **Tailwind CSS v4** with a CSS-first configuration. All theme tokens and global styles are defined in `src/app.css`. Scoped styles and custom CSS selectors are forbidden.

See [THEME.md](./THEME.md) for the full styling policy and token reference.

## Configuration

- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite configuration
- `src/app.css` - Tailwind v4 theme and tokens

## Troubleshooting

### `npm install` fails

Make sure you are using a current Node.js version that matches the project setup. Then remove `node_modules` and your lockfile if needed, and run `npm install` again.

### The dev server starts, but pages look unstyled

Confirm that `src/app.css` is present and unchanged, then restart `npm run dev`. Tailwind v4 styling is driven from that file.

### A new doc page does not appear where expected

Check the file path under `src/content/docs/`, confirm the filename and frontmatter are correct, and make sure it is placed in the right section folder. Navigation follows the filesystem structure.

### Links return a 404 locally

Verify the target page path and use the same section-based URL structure as the rest of the docs. Reviewing nearby pages such as [`/account/registration/`](/account/registration/) or [`/guides/getting-started/`](/guides/getting-started/) can help confirm the expected pattern.
