# Frontend Site

This is the Bun + Astro + Vue site for `dunamismax.com`.

- This frontend is the default local, CI, and container deploy path for the repo.
- It owns the public HTML routes, machine-readable surfaces, Tailwind v4 plus token-driven styling system, and repo-owned content.
- It intentionally represents the frontend-only slice of Stephen's broader web lane. The repo does not currently justify a Bun API or database.
- Blog posts and project data are single-sourced under `frontend/src/content/`.

## Commands

From the repo root, use the default verification wrapper:

```bash
bun run verify
```

Inside `frontend/`, the direct commands are:

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

The frontend covers:

- Astro page routing for the public HTML pages
- Shared metadata, canonical URL handling, and JSON-LD site identity
- Article metadata and `BlogPosting` structured data for blog posts
- Frontend-owned content collections for blog posts and projects
- Self-hosted fonts and shared CSS carried over from the live site
- Static machine surfaces for RSS, sitemap, robots, and health
- The build artifact used by Docker/Caddy deploys

