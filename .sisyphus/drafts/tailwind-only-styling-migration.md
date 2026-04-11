# Draft: Tailwind-Only Styling Migration

## Requirements (confirmed)
- [request]: Create a plan to move away from custom CSS and use only Tailwind.
- [request]: Update all documentation related to styling migration, including `THEME.md` and `AGENTS.md`.

## Technical Decisions
- [status]: Pending repo exploration of current styling architecture, Tailwind integration, and documentation surfaces.

## Research Findings
- [status]: Pending exploration results.

## Open Questions
- [question]: Should “only Tailwind” allow Tailwind theme tokens/config-driven abstractions but no authored CSS selectors outside framework-required base imports?
- [question]: Should the migration include removing all component-scoped `<style>` blocks and global `app.css` rules except Tailwind directives?

## Scope Boundaries
- INCLUDE: Repo-wide styling migration planning, documentation/policy updates, execution sequencing, verification strategy.
- EXCLUDE: Direct implementation in this planning session.
