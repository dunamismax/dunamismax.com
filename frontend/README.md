# Frontend Migration App

This is the Bun + Astro + Vue migration frontend for `dunamismax.com`.

Current truth:

- The deployed site is still the Python app in `src/app/`.
- The Astro frontend now owns the public page routes, machine-readable surfaces, and styling parity work for `/`, `/projects`, `/blog`, `/blog/{slug}`, `/about`, `/contact`, `404`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, and `/health`.
- Blog posts and project data are single-sourced under `frontend/src/content/`.
- Deployment cutover away from the Python web runtime is still a later phase.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run check
bun run test
bun run build
```

## Scope

The frontend currently covers:

- Astro page routing for the public HTML pages
- Shared metadata and canonical URL handling
- Article metadata support for blog posts
- Frontend-owned content collections for blog posts and projects
- Self-hosted fonts and shared CSS carried over from the live site

Still not complete here:

- deployment cutover away from the Python web runtime
- Docker/Caddy updates that make the Astro build the default served artifact
