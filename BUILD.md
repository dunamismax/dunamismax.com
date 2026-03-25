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

Not the flashiest. Not the most complex. The best, meaning: fast, honest, beautiful in its restraint, and unmistakably the work of someone who ships real systems software. Every pixel, every millisecond, every line of markup should communicate craft.

The site is the proof. If the portfolio says "I build self-hostable systems software with boring infrastructure and clean operational discipline," then the site itself must be self-hostable, boring to operate, and clean in every detail.

### Product rules

- **FastAPI + Jinja2 + htmx + Uvicorn** is the stack.
- **Server-rendered HTML.** Every URL returns complete HTML on the first response. No SPA, no hydration, no client-side routing.
- **No database.** Blog posts and project data live as Python data files in the repo.
- **No CMS.** Posts and project entries are code.
- **htmx** for any dynamic interactions. No JavaScript build step.
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

**Current phase:** Implemented, FastAPI + Jinja2 + htmx

**Last reviewed:** 2026-03-25

**Branch:** `main`

### What exists right now

- FastAPI + Jinja2 server-rendered site with htmx, Uvicorn, uv, Ruff, Pyright, pytest
- Full design system in `tokens.css` and `base.css` (colors, typography, spacing, motion)
- Hand-written CSS with design tokens (no Tailwind, no CSS framework)
- Self-hosted Inter (variable) and JetBrains Mono fonts in `static/fonts/`
- Layout template with fixed nav, skip-to-content link, semantic HTML, footer with contact links
- **Home page** with hero, tagline, stack description, nav cards
- **About page** with stack philosophy, ownership, boring infrastructure
- **Contact page** with all channels listed (Email, Signal, GitHub, Twitter, Reddit)
- **Projects page** with all repos grouped by category with status badges and stack tags
- **Blog index** with date + title + excerpt layout
- **Blog post detail** with reading time, tags, markdown rendered via Python markdown library
- **First blog post** ("Building this site")
- Open Graph and Twitter Card meta tags on every page
- Canonical URLs, preloaded fonts, RSS alternate link
- 22 passing tests (route smoke tests + content data tests)
- CI pipeline (GitHub Actions: ruff, pyright, pytest)
- Docker deployment (multi-stage Dockerfile with Uvicorn, docker-compose.yml)
- Caddy reverse proxy config

### What does not exist yet

- RSS feed generation (TODO)
- Sitemap generation (TODO)
- Public deployment redeployed with the Python build
- Lighthouse verification against the public domain
- External uptime monitoring

---

## Source-of-truth map

| File | Owns |
| --- | --- |
| `README.md` | public-facing project definition and architecture |
| `BUILD.md` | this file; execution manual, phase plan, verification log |
| `src/app/content/blog.py` | blog post data |
| `src/app/content/projects.py` | project entry data |
| `src/app/static/css/tokens.css` | design tokens and color palette |
| `src/app/static/css/base.css` | global base styles and typography |
| `src/app/main.py` | FastAPI application entry point |
| `src/app/routes/pages.py` | all page routes |
| `src/app/templates/` | Jinja2 HTML templates |
| `pyproject.toml` | dependencies, tooling config, project metadata |
| `Dockerfile` | multi-stage Docker build (Python slim + Uvicorn) |
| `Caddyfile` | reverse proxy config for the host Caddy |
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

**Navigation:** fixed top bar, monospace logo, minimal links (Home, Projects, Blog, About), no hamburger menu. Stack vertically on mobile instead.

**Project cards:** dark card on darker background. Project name in monospace. One-line description. Status badge (active / shipped / phase 0). Repo link. Grouped by category.

**Blog post list:** date on the left (muted), title as a link, one-line excerpt below. No thumbnails, no cards, no category pills. Clean rows.

**Blog post page:** full-width content column constrained to `--measure`. Monospace title. Date and reading time in muted text below the title. Markdown-rendered body with good code block styling. No sidebar, no table of contents.

**Footer:** minimal. Name, year, one-line description, and a row of contact/social links.

---

## Deployment

### Architecture

Self-hosted via Docker with Caddy as a reverse proxy. The container runs Uvicorn on port 8000 behind an external Caddy instance that handles TLS for `dunamismax.com`.

```
Internet -> Caddy (host, TLS) -> Docker container (Uvicorn on :8000, FastAPI app)
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

The container exposes port 8080 (mapped to internal 8000). Point the host Caddy reverse proxy at `localhost:8080`.

### Run without Docker

```bash
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### CI pipeline

GitHub Actions runs on every push to `main` and on pull requests:

1. `uv sync`
2. `uv run ruff check .` (lint)
3. `uv run ruff format --check .` (format)
4. `uv run pyright` (type check)
5. `uv run pytest` (tests)

---

## Build / Run / Verify

### Prerequisites

- Python 3.12+
- uv

### Commands

```bash
uv sync                              # install deps
uv run uvicorn app.main:app --reload # local dev server
uv run ruff check .                  # lint
uv run ruff format --check .         # format check
uv run pyright                       # type check
uv run pytest                        # tests
```

### Verification checklist for any change

1. `uv run ruff check . && uv run ruff format --check .` passes
2. `uv run pyright` passes
3. `uv run pytest` passes
4. Visual review on mobile viewport
5. Visual review on desktop viewport

---

## TODOs

- [ ] RSS feed generation
- [ ] Sitemap generation
- [ ] Set up `dunamismax.com` DNS
- [ ] Verify: site is live and reachable at `dunamismax.com`
- [ ] Lighthouse verification
- [ ] External uptime monitoring
- [ ] Light mode toggle (if it earns its keep)
- [ ] Table of contents for long blog posts
- [ ] Search across blog posts
- [ ] Project filtering or sorting

---

## Decision Log

- 2026-03-23: project created. Stack was Bun + TypeScript + Astro + Alpine.js.
- 2026-03-23: dark theme is the default and only theme. Light mode deferred.
- 2026-03-23: blog content lives in repo as data files. No external CMS.
- 2026-03-23: deployment target: self-hosted Caddy via Docker.
- 2026-03-23: Inter for body text, JetBrains Mono for code and headings. Self-hosted.
- 2026-03-24: migrated from Astro to React + Vite SPA. Stack was Bun + TypeScript + Vite + React + TanStack Router + Tailwind CSS + Biome + Vitest.
- 2026-03-25: rewrote from React SPA to FastAPI + Jinja2 + htmx. Stack is now Python 3.12, FastAPI, Jinja2, htmx, Uvicorn, hand-written CSS, uv, Ruff, Pyright, pytest. No JavaScript build toolchain. Server-rendered HTML.

---

## Resume Checklist

If you are resuming this repo later:

1. Read `README.md`
2. Read this file
3. Check `git status` and `git log --oneline -5`
4. Run `uv sync && uv run ruff check . && uv run pyright && uv run pytest` to confirm the baseline
5. Pick up where the TODOs left off
