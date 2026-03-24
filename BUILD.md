# BUILD.md

## Purpose

This is the execution manual for dunamismax.com.

It should always answer:

- what the site is actually doing right now
- what has been built and verified
- what the next correct move is
- what the design and content targets look like

If this file and the code disagree, fix them together in the same change.

---

## Mission

Build the best personal developer site on the internet.

Not the flashiest. Not the most complex. The best — meaning: fast, honest, beautiful in its restraint, and unmistakably the work of someone who ships real systems software. Every pixel, every millisecond, every line of markup should communicate craft.

The site is the proof. If the portfolio says "I build self-hostable systems software with boring infrastructure and clean operational discipline," then the site itself must be self-hostable, boring to operate, and clean in every detail.

### Product rules

- **Bun + TypeScript + Vite + React + TanStack Router** is the stack.
- **Static SPA output.** Vite builds to `dist/`, served by any static file server with SPA catch-all.
- **No database.** Blog posts and project data live as TypeScript data files in the repo.
- **No CMS.** Posts and project entries are code.
- **TanStack Router** for type-safe file-based routing. SPA navigation between pages.
- **No third-party scripts.** No analytics, no tracking pixels, no CDN font calls, no cookie consent.
- **Dark by default.** Light mode is a stretch goal, not a launch requirement.
- **Mobile-first.** Not mobile-tolerable. Mobile-first.
- **Performance is a feature, not a metric.** The site should feel instant.

### Domain strategy

| Domain | Role |
| --- | --- |
| `dunamismax.com` | Primary personal site: home, portfolio, blog, about, contact. |

---

## Current repo snapshot

**Current phase:** Implemented — React + Vite SPA

**Last reviewed:** 2026-03-24

**Branch:** `main`

### What exists right now

- Vite + React + TanStack Router SPA with Bun, TypeScript strict mode, Biome lint/format
- Full design system in `tokens.css` and `base.css` (colors, typography, spacing, motion)
- Tailwind CSS alongside hand-written CSS design tokens
- Self-hosted Inter (variable) and JetBrains Mono fonts in `public/fonts/`
- Layout component with fixed nav, skip-to-content link, semantic HTML, footer with contact links
- **Home page** — hero with name, tagline, stack description, nav cards
- **About page** — stack philosophy, ownership, boring infrastructure
- **Contact page** — all channels listed (Email, Signal, GitHub, Twitter, Reddit)
- **Projects page** — all repos grouped by category with status badges and stack tags
- **Blog index** — date + title + excerpt layout
- **Blog post detail** — reading time, tags, markdown rendered via react-markdown
- **First blog post** — "Building this site"
- Open Graph and Twitter Card meta tags on every page (via Head component)
- Canonical URLs, preloaded fonts, RSS alternate link
- Vitest with 8 passing tests
- CI pipeline (GitHub Actions: lint, test, build on push/PR)
- Docker deployment (multi-stage Dockerfile, Caddyfile with SPA catch-all, docker-compose.yml)
- `bun run check` and `bun run build` pass clean

### What does not exist yet

- RSS feed generation (TODO — was Astro-specific, needs a Vite build plugin or static generation)
- Sitemap generation (TODO — needs a build-time script)
- public deployment redeployed with the SPA build
- Lighthouse verification against the public domain
- external uptime monitoring

---

## Source-of-truth map

| File | Owns |
| --- | --- |
| `README.md` | public-facing project definition and architecture |
| `BUILD.md` | this file; execution manual, phase plan, verification log |
| `src/lib/blog.ts` | blog post data |
| `src/lib/projects.ts` | project entry data |
| `src/styles/tokens.css` | design tokens and color palette |
| `src/styles/base.css` | global base styles and typography |
| `vite.config.ts` | Vite build, React, Tailwind, TanStack Router config |
| `biome.json` | lint and format rules |
| `package.json` | dependencies and scripts |
| `Dockerfile` | multi-stage Docker build (Bun → Caddy Alpine) |
| `Caddyfile` | static file serving with SPA catch-all, caching, security headers |
| `docker-compose.yml` | container orchestration |
| `.github/workflows/ci.yml` | CI pipeline configuration |

---

## Design System

### Color palette (dark default)

Target feel: a terminal that learned typography. High contrast, one accent, nothing gratuitous.

```
--bg-primary:     #0a0a0b        /* near-black, not pure black */
--bg-secondary:   #131316        /* card/section backgrounds */
--bg-tertiary:    #1a1a1f        /* subtle elevation */
--border:         #2a2a30        /* borders and dividers */
--text-primary:   #e8e8ed        /* main body text */
--text-secondary: #8888a0        /* muted text, metadata, dates */
--text-tertiary:  #5a5a70        /* disabled, placeholder */
--accent:         #5b8af5        /* links, active states, focus rings */
--accent-hover:   #7ba3ff        /* hover state for accent */
--accent-muted:   #5b8af520      /* subtle accent backgrounds */
--success:        #34d399        /* status indicators */
--warning:        #fbbf24        /* status indicators */
--error:          #f87171        /* status indicators */
--code-bg:        #0f0f12        /* inline code and code block backgrounds */
```

### Typography

```
--font-body:      'Inter', system-ui, -apple-system, sans-serif
--font-mono:      'JetBrains Mono', 'SF Mono', 'Fira Code', monospace
--font-heading:   var(--font-mono)
```

### Component patterns

**Navigation:** fixed top bar, monospace logo, minimal links (Home, Projects, Blog, About), no hamburger menu — stack vertically on mobile instead.

**Project cards:** dark card on darker background. Project name in monospace. One-line description. Status badge (active / shipped / phase 0). Repo link. Grouped by category.

**Blog post list:** date on the left (muted), title as a link, one-line excerpt below. No thumbnails, no cards, no category pills. Clean rows.

**Blog post page:** full-width content column constrained to `--measure`. Monospace title. Date and reading time in muted text below the title. Markdown-rendered body with good code block styling. No sidebar, no table of contents.

**Footer:** minimal. Name, year, one-line description, and a row of contact/social links.

---

## Deployment

### Architecture

Self-hosted via Docker with Caddy serving static files. The container sits behind an external Caddy reverse proxy that handles TLS for `dunamismax.com`.

```
Internet → Caddy (host, TLS) → Docker container (Caddy on :80, static files + SPA catch-all)
```

### Build and run

```bash
# Build and start the container
docker compose up -d --build

# Rebuild after content changes
docker compose up -d --build --force-recreate

# Stop
docker compose down

# View logs
docker compose logs -f web
```

The container exposes port 8080. Point the host Caddy reverse proxy at `localhost:8080`.

### Build without Docker

```bash
bun install
bun run build
# Serve the dist/ directory with any static file server that supports SPA catch-all
```

### CI pipeline

GitHub Actions runs on every push to `main` and on pull requests:

1. `bun install --frozen-lockfile`
2. `bun run lint` (Biome)
3. `bun run test` (Vitest)
4. `bun run build` (Vite production build)

---

## Build / Run / Verify

### Prerequisites

- Bun 1.3+

### Commands

```bash
bun install
bun run dev          # local dev server
bun run build        # production static build
bun run check        # biome check . && vitest run
bun run lint         # biome check .
bun run test         # vitest run
bun run format       # biome format . --write
```

### Verification checklist for any change

1. `bun run check` passes
2. `bun run build` passes
3. visual review on mobile viewport
4. visual review on desktop viewport

---

## TODOs

- [ ] RSS feed generation at build time (was Astro-native, needs replacement)
- [ ] Sitemap generation at build time
- [ ] set up `dunamismax.com` DNS
- [ ] verify: site is live and reachable at `dunamismax.com`
- [ ] Lighthouse verification
- [ ] external uptime monitoring
- [ ] light mode toggle (if it earns its keep)
- [ ] table of contents for long blog posts
- [ ] search across blog posts
- [ ] project filtering or sorting
- [ ] Playwright smoke tests for critical pages

---

## Decision Log

- 2026-03-23: project created. Stack was Bun + TypeScript + Astro + Alpine.js.
- 2026-03-23: dark theme is the default and only theme. Light mode deferred.
- 2026-03-23: blog content lives in repo as data files. No external CMS.
- 2026-03-23: deployment target: self-hosted Caddy via Docker.
- 2026-03-23: Inter for body text, JetBrains Mono for code and headings. Self-hosted.
- 2026-03-23: Phases 1–4 partially completed under Astro.
- 2026-03-24: migrated from Astro to React + Vite SPA. Stack is now Bun + TypeScript + Vite + React + TanStack Router + Tailwind CSS + Biome + Vitest. Blog posts stored as TypeScript data, rendered with react-markdown. RSS and sitemap deferred as TODOs.

---

## Resume Checklist

If you are resuming this repo later:

1. Read `README.md`
2. Read this file
3. Check `git status` and `git log --oneline -5`
4. Run `bun run check && bun run build` to confirm the baseline
5. Pick up where the TODOs left off
