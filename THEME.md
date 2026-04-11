# TerraScale Theme Guide

This file documents the Tailwind v4 CSS-first architecture and token system implemented in this repository.

## Architecture

TerraScale uses a **Tailwind v4 CSS-first** approach. There is no `tailwind.config.js`. All theme configuration, tokens, and base styles live in `src/app.css`.

### Core Principles
- **Utility-First**: Use Tailwind utility classes for almost all styling.
- **No Scoped Styles**: Svelte `<style>` blocks are forbidden.
- **No Custom Selectors**: Avoid creating custom CSS classes or semantic selectors.
- **No @apply or @utility**: Do not use `@apply` or `@utility` in CSS files.
- **Token-Driven**: Use the `--color-ts-*`, `--font-*`, and `--shadow-ts-*` tokens defined in the `@theme` block.

## Token System

The theme is defined in the `@theme` block within `src/app.css`. These tokens are automatically available as Tailwind utilities (e.g., `bg-ts-primary`, `font-display`).

### Colors
| Token | Value | Role |
| --- | --- | --- |
| `--color-ts-primary` | `#2563eb` | Brand blue, primary CTA, focus |
| `--color-ts-primary-light` | `#60a5fa` | Lighter variant for hovers/accents |
| `--color-ts-secondary` | `#10b981` | Success, uptime, positive state |
| `--color-ts-accent` | `#0891b2` | Cyan accents, secondary highlight |
| `--color-ts-tertiary` | `#8b5cf6` | Premium or enterprise emphasis |
| `--color-ts-error` | `#f43f5e` | Error states |
| `--color-ts-warning` | `#fbbf24` | Warning states |
| `--color-ts-bg` | `#050508` | Main page background |
| `--color-ts-surface` | `#0a0a0e` | Section and card surfaces |
| `--color-ts-elevated` | `#0c0c10` | Hover and elevated panels |
| `--color-ts-card` | `#080810` | Dense card or modal surface |
| `--color-ts-text` | `#f8fafc` | Main copy |
| `--color-ts-text-muted` | `#94a3b8` | Secondary copy |
| `--color-ts-divider` | `#1a1a24` | Borders and separators |

### Typography
- **Display**: `Quantico` (used for headings and brand elements)
- **Body**: `Inter` (used for all standard copy)

Fonts are loaded via `@font-face` in `src/app.css`.

### Shadows and Radius
- **Brutal Shadow**: `--shadow-ts-brutal` (4px offset, dark)
- **Brutal Blue**: `--shadow-ts-brutal-blue` (4px offset, blue tint)
- **Soft Shadow**: `--shadow-ts-soft` (large, diffused)
- **Radius**: `--radius-ts-md` (8px), `--radius-ts-xl` (16px)

## Generated Content (Prose)

Content generated from Markdown (via mdsvex and Shiki) is styled using the `data-prose` wrapper pattern.

### The `data-prose` Pattern
Instead of a typography plugin, we use Tailwind arbitrary variants targeting the `[data-prose]` attribute.

```html
<div data-prose class="[&_h1]:text-3xl [&_p]:mt-4">
  <!-- Generated content -->
</div>
```

### Data Attribute Contracts
The following attributes are used for runtime hooks and global interaction rules:
- `data-code-block`: Wraps a code block and its metadata.
- `data-copy-button`: The button used to copy code.
- `data-code-wrapper`: Wraps the actual code content.
- `data-code-title`: The title or filename of a code block.
- `data-prose`: Marks a container for generated content styling.

A global interaction rule in `app.css` handles the copy button visibility:
`[data-code-block]:hover [data-copy-button] { opacity: 1; }`

## Allowed Residual CSS

The `src/app.css` file is the only place where custom CSS should exist. It is restricted to:
- `@import 'tailwindcss';`
- `@theme` block for token definitions.
- `@font-face` declarations.
- Base element resets (e.g., `html`, `body`, `a`).
- Essential utility overrides (e.g., `.sr-only`).
- Media queries for `prefers-reduced-motion`.

## Forbidden Patterns

- **No scoped `<style>` blocks** in Svelte components.
- **No `@apply`** or **`@utility`** directives.
- **No `tailwind.config.*`** files.
- **No Tailwind Typography plugin** (`prose` class).
- **No custom semantic selectors** (e.g., `.my-custom-button`). Use utility classes instead.

## Contributor Rules

1. **Utility First**: Always try to achieve the design using standard Tailwind utilities first.
2. **Use Tokens**: Use theme tokens (e.g., `text-ts-primary`) instead of hardcoded hex values.
3. **Prose Styling**: Use the `[data-prose]` pattern for any Markdown-generated content.
4. **No Scoped Styles**: If you need a complex style, consider if it should be a token or if it can be achieved with arbitrary variants.
