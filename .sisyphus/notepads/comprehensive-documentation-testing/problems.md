## Problems

## 2026-04-12 Task: smoke-all-routes blocker
- Smoke coverage is currently blocked by a real generated-route issue, not test infrastructure.
- `build/roadmap/public-alpha-roadmap/index.html` exists and redirects to `/en/roadmap/public-alpha-roadmap/`.
- The redirected target is missing from the built site, so preview serves a 404 page with no `<main>`.
- Task 3 should remain pending until the broken generated redirect or missing target route is resolved.
