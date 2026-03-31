# Frontend Site

This is the Bun + Astro + Vue site for `dunamismax.com`.

Current truth:

- This frontend is now the default local, CI, and container deploy path for the repo.
- The Astro frontend owns the public HTML routes, machine-readable surfaces, styling system, and repo-owned content.
- Blog posts and project data are single-sourced under `frontend/src/content/`.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run check
bun run test
bun run build
bun run preview
```

## Scope

The frontend currently covers:

- Astro page routing for the public HTML pages
- Shared metadata and canonical URL handling
- Article metadata support for blog posts
- Frontend-owned content collections for blog posts and projects
- Self-hosted fonts and shared CSS carried over from the live site
- Static machine surfaces for RSS, sitemap, robots, and health
- The build artifact used by Docker/Caddy deploys

