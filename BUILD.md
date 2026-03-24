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

- **Bun + TypeScript + Astro + Alpine.js** is the stack. Nothing else in v1.
- **Static output by default.** SSR only when a page genuinely requires request-scoped data.
- **No database in v1.** Content lives in Astro content collections (Markdown + frontmatter) and TypeScript data files.
- **No CMS.** Posts and project entries are files in the repo.
- **No client-side routing.** Full page loads. Every URL works with JavaScript disabled.
- **No third-party scripts.** No analytics, no tracking pixels, no CDN font calls, no cookie consent.
- **Dark by default.** Light mode is a stretch goal, not a launch requirement.
- **Mobile-first.** Not mobile-tolerable. Mobile-first.
- **Performance is a feature, not a metric.** The site should feel instant. Sub-second full page loads on a cold cache. Lighthouse 100 across the board is the floor, not the ceiling.

### Domain strategy

| Domain | Role |
| --- | --- |
| `dunamismax.com` | Primary personal site: home, portfolio, blog, about, contact. |

---

## Current repo snapshot

**Current phase:** Phase 4 — polish and production (partially complete)

**Last reviewed:** 2026-03-23

**Branch:** `main`

### What exists right now

- Astro project with Bun, TypeScript strict mode, Biome lint/format
- Full design system in `tokens.css` and `base.css` (colors, typography, spacing, motion)
- Self-hosted Inter (variable) and JetBrains Mono fonts in `public/fonts/`
- Base layout with fixed nav, skip-to-content link, semantic HTML, footer with contact links
- **Home page** — hero with name, tagline, stack description, nav cards
- **About page** — stack philosophy, ownership, boring infrastructure
- **Contact page** — all channels listed (Email, Signal, GitHub, Twitter, Reddit)
- **Projects page** — all repos grouped by category with status badges and stack tags
- **Blog index** — date + title + excerpt layout
- **Blog post layout** — reading time, tags, Shiki syntax highlighting
- **First blog post** — "Building this site"
- **404 page**, sitemap, RSS feed at `/feed.xml`, `robots.txt`, SVG favicon
- Open Graph and Twitter Card meta tags on every page
- Canonical URLs, preloaded fonts, RSS alternate link
- Vitest with 3 passing smoke tests
- CI pipeline (GitHub Actions: check, test, build on push/PR)
- Docker deployment (multi-stage Dockerfile, Caddyfile, docker-compose.yml)
- `bun run check` and `bun run build` pass clean (7 pages, 481ms)

### What does not exist yet

- public deployment redeployed with the validated Caddy static-serving fix
- Lighthouse verification against the public domain
- external uptime monitoring

---

## Source-of-truth map

| File | Owns |
| --- | --- |
| `README.md` | public-facing project definition and architecture |
| `BUILD.md` | this file; execution manual, phase plan, verification log |
| `src/content/blog/` | blog post Markdown files |
| `src/content/projects/` | project entry data |
| `src/styles/tokens.css` | design tokens and color palette |
| `src/styles/base.css` | global base styles and typography |
| `astro.config.mjs` | Astro build and integration configuration |
| `biome.json` | lint and format rules |
| `package.json` | dependencies and scripts |
| `Dockerfile` | multi-stage Docker build (Bun → Caddy Alpine) |
| `Caddyfile` | static file serving, caching, security headers |
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

--text-xs:        0.75rem    /* 12px — metadata, timestamps */
--text-sm:        0.875rem   /* 14px — captions, secondary */
--text-base:      1rem       /* 16px — body */
--text-lg:        1.125rem   /* 18px — lead text */
--text-xl:        1.25rem    /* 20px — section headings */
--text-2xl:       1.5rem     /* 24px — page headings */
--text-3xl:       1.875rem   /* 30px — hero */
--text-4xl:       2.25rem    /* 36px — home hero */

--leading-tight:  1.25
--leading-normal: 1.6
--leading-relaxed: 1.75

--measure:        65ch       /* max content width for readability */
```

### Spacing and layout

```
--space-1:   0.25rem      /* 4px */
--space-2:   0.5rem       /* 8px */
--space-3:   0.75rem      /* 12px */
--space-4:   1rem         /* 16px */
--space-6:   1.5rem       /* 24px */
--space-8:   2rem         /* 32px */
--space-12:  3rem         /* 48px */
--space-16:  4rem         /* 64px */
--space-24:  6rem         /* 96px */

--content-width:    65ch
--wide-width:       80rem
--nav-height:       3.5rem
--radius:           0.375rem    /* subtle rounding, not pill-shaped */
```

### Motion

```
--duration-fast:    100ms
--duration-normal:  200ms
--duration-slow:    400ms
--easing:           cubic-bezier(0.4, 0, 0.2, 1)
```

Rules:
- transitions on hover, focus, and state changes only
- no entrance animations
- no scroll-triggered animations
- no parallax
- respect `prefers-reduced-motion`

### Component patterns

**Navigation:** fixed top bar, monospace logo, minimal links (Home, Projects, Blog, About), no hamburger menu — stack vertically on mobile instead.

**Project cards:** dark card on darker background. Project name in monospace. One-line description. Status badge (active / shipped / phase 0). Repo link. Live link when applicable. Grouped by category.

**Blog post list:** date on the left (muted), title as a link, one-line excerpt below. No thumbnails, no cards, no category pills. Clean rows.

**Blog post page:** full-width content column constrained to `--measure`. Monospace title. Date and reading time in muted text below the title. Markdown-rendered body with good code block styling. No sidebar, no table of contents in v1 (add later if post length earns it).

**Footer:** minimal. Name, year, one-line description, and a row of contact/social links. No newsletter signup, no sitemap links, no partner logos.

---

## Content Strategy

### Blog

The blog is the long-term differentiator. The portfolio shows what was built; the blog shows how you think.

Content pillars:

- **Build logs.** Honest accounts of shipping a product or feature. What worked, what broke, what was learned. Not tutorials — dispatches from the build.
- **Systems thinking.** Architecture decisions, storage tradeoffs, operational discipline, self-hosting lessons. Opinions with receipts.
- **Craft.** Go patterns, C boundary discipline, SQLite tricks, Astro/Alpine techniques. Short, specific, useful.
- **Stack philosophy.** Why boring infrastructure wins. Why self-hosting matters. Why the data layer is the truth layer. The intellectual backbone of the portfolio.

Tone: the same as the code. Direct, opinionated, evidence-first. No listicles, no engagement bait, no "10 things I learned" titles. Write like you are explaining a decision to a colleague who will call you on your shit.

Cadence target: one post every 1–2 weeks once the pipeline is running. Quality over quantity, always.

Post frontmatter shape:

```yaml
---
title: "Post title"
description: "One-line summary for meta tags and listings."
date: 2026-03-23
tags: ["go", "sqlite", "self-hosting"]
draft: false
---
```

### Projects

Project entries are content collection items or a TypeScript data file. Each entry needs:

```yaml
---
name: "bore"
tagline: "Privacy-first file transfer with a payload-blind relay."
category: "infrastructure"
status: "active"           # active | shipped | phase-0 | legacy
repo: "https://github.com/dunamismax/bore"
url: ""                    # live product URL when applicable
domains: ["bore.dunamismax.com"]
stack: ["Go", "Astro", "Alpine.js"]
---
```

Categories match the profile README groupings:

- browser-first products
- infrastructure and observability
- security and custody
- developer tooling
- systems

---

## Deployment

### Architecture

Self-hosted via Docker with Caddy serving static files. The container sits behind an external Caddy reverse proxy that handles TLS for `dunamismax.com`.

```
Internet → Caddy (host, TLS) → Docker container (Caddy on :80, static files)
```

### Files

| File | Purpose |
| --- | --- |
| `Dockerfile` | Multi-stage build: Bun builds the site, Caddy Alpine serves it |
| `Caddyfile` | Static file serving, compression, cache headers, security headers, clean URLs, 404 handling |
| `docker-compose.yml` | Container orchestration with restart policy, exposes port 8080 |
| `.dockerignore` | Keeps the build context small |
| `.github/workflows/ci.yml` | CI pipeline: install, check, test, build on push/PR |

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

Example host Caddyfile block:

```
dunamismax.com {
    reverse_proxy localhost:8080
}
```

### Build without Docker

```bash
bun install
bun run build
# Serve the dist/ directory with any static file server
```

### CI pipeline

GitHub Actions runs on every push to `main` and on pull requests:

1. `bun install --frozen-lockfile`
2. `bun run check` (Biome + Astro check)
3. `bun run test` (Vitest)
4. `bun run build` (production static build)

### Future: SSR if earned

If the site later needs authenticated previews, draft rendering, dynamic content, or API routes, switch to Astro SSR mode. That decision should be explicit and documented here.

---

## Phase Dashboard

### Phase 0 — project definition

**Status:** done / current

Checklist:

- [x] repo created on GitHub and Codeberg
- [x] `README.md` describes the full project target
- [x] `BUILD.md` describes the execution plan, design system, and content strategy
- [x] domain `dunamismax.com` is owned and ready to point

Exit criteria:

- a cold reader can understand what this site is, how it will be built, and what it will look like by reading `README.md` and `BUILD.md`

### Phase 1 — scaffold and first pages

**Status:** done / checked

Checklist:

- [x] initialize Astro project with Bun
- [x] configure TypeScript strict mode
- [x] configure Biome for lint and formatting
- [x] set up `tokens.css` and `base.css` with the design system above
- [x] self-host Inter and JetBrains Mono fonts
- [x] build the base layout: head, nav, main, footer
- [x] build the home page
- [x] build the about page
- [x] build the contact page
- [x] add `package.json` scripts: `dev`, `build`, `check`, `test`, `format`
- [x] verify: `bun run check && bun run build` passes
- [ ] verify: Lighthouse scores 100/100/100/100 on the home page
- [x] verify: every page is functional with JavaScript disabled

Exit criteria:

- three pages ship (home, about, contact)
- the design system is implemented and visually sharp
- the site loads in under 1 second on a cold cache
- no JavaScript is required for core functionality
- `bun run check && bun run build` passes cleanly

### Phase 2 — portfolio

**Status:** done / checked

Checklist:

- [x] create the projects content collection or data file
- [x] populate project entries from the current profile README roster
- [x] build the projects index page with category grouping
- [x] build individual project detail pages (or decide that the index is sufficient)
- [x] add status badges per project
- [x] link repos and live URLs where applicable
- [x] verify project data matches the current reality in each repo's README

Exit criteria:

- every active repo appears in the portfolio with honest status
- project entries are maintainable (add/remove = edit one file)
- the portfolio page loads fast and looks sharp on mobile

### Phase 3 — blog

**Status:** done / checked

Checklist:

- [x] configure Astro content collections for blog posts
- [x] build the blog index page (date + title + excerpt, clean rows)
- [x] build the blog post layout with good typography and code block styling
- [x] add syntax highlighting for code blocks (Shiki via Astro's built-in support)
- [x] add reading time calculation
- [x] add meta tags and Open Graph images for social sharing
- [x] write and publish the first post
- [x] verify: blog posts render correctly from Markdown with no layout breaks
- [x] verify: code blocks are readable and properly highlighted

Exit criteria:

- the blog pipeline works end to end: write Markdown, build, deploy, read
- posts look good on mobile and desktop
- code blocks are a first-class citizen, not an afterthought
- at least one real post is published

### Phase 4 — polish and production

**Status:** in progress

Checklist:

- [x] add 404 page
- [x] add sitemap generation
- [x] add RSS feed for the blog
- [x] add Open Graph images (static or generated)
- [x] add `robots.txt`
- [x] add favicon and touch icons
- [x] configure deployment target and CI pipeline
- [ ] set up `dunamismax.com` DNS
- [ ] verify: site is live and reachable at `dunamismax.com`
- [ ] verify: RSS feed validates
- [ ] verify: Open Graph previews render correctly on Twitter, Discord, and Signal
- [ ] verify: Lighthouse scores remain 100/100/100/100

Exit criteria:

- the site is live at `dunamismax.com`
- RSS, sitemap, OG, and social previews work
- the CI pipeline runs `bun run check && bun run build` on push
- the site is production-ready and publicly shareable

### Phase 5 — refinement and ongoing

**Status:** planned

Ongoing work that does not block launch but makes the site better over time:

- [ ] light mode toggle (if it earns its keep)
- [ ] table of contents for long blog posts
- [ ] search across blog posts (static search index, no external service)
- [ ] project filtering or sorting on the portfolio page
- [ ] Playwright smoke tests for critical pages
- [ ] image optimization pipeline (if the site starts using images beyond OG)
- [ ] contact form (only if email-based contact proves insufficient)
- [ ] optional: self-hosted analytics via server access logs or a lightweight self-hosted tool

---

## Performance Budget

| Metric | Target |
| --- | --- |
| First Contentful Paint | < 0.5s |
| Largest Contentful Paint | < 1.0s |
| Total Blocking Time | 0ms |
| Cumulative Layout Shift | 0 |
| Total page weight (home) | < 100KB transferred |
| JavaScript shipped (home) | < 10KB (Alpine + minimal interaction) |
| Lighthouse Performance | 100 |
| Lighthouse Accessibility | 100 |
| Lighthouse Best Practices | 100 |
| Lighthouse SEO | 100 |

If a change regresses any of these, the change needs justification or a fix before merge.

---

## Accessibility Requirements

- Semantic HTML throughout — `nav`, `main`, `article`, `header`, `footer`, `section`
- Skip-to-content link on every page
- All interactive elements keyboard-accessible
- Visible focus indicators that match the design system
- Color contrast ratios meet WCAG 2.1 AA minimum (4.5:1 for body text, 3:1 for large text)
- All images have meaningful `alt` text or are marked decorative
- No content conveyed only through color
- Reduced-motion media query respected everywhere

---

## SEO Baseline

- Unique `<title>` and `<meta name="description">` per page
- Open Graph `og:title`, `og:description`, `og:image`, `og:url` per page
- Twitter card meta tags per page
- Canonical URLs
- Semantic heading hierarchy (one `h1` per page)
- Sitemap at `/sitemap.xml`
- RSS feed at `/feed.xml`
- `robots.txt` allowing full crawl
- Clean URLs without trailing slashes (or consistent trailing slashes — pick one and stick)
- Structured data (`Person` schema on about page, `BlogPosting` on posts) — stretch goal

---

## Build / Run / Verify

### Prerequisites

- Bun 1.3+

### Commands

```bash
bun install
bun run dev          # local dev server
bun run build        # production static build
bun run check        # biome check . && astro check
bun run test         # vitest run
bun run format       # biome format . --write
```

### Verification checklist for any change

1. `bun run check` passes
2. `bun run build` passes
3. visual review on mobile viewport
4. visual review on desktop viewport
5. JavaScript disabled — every page still works
6. Lighthouse audit on affected pages

---

## Working Rules

1. **Static first.** Do not add SSR until a page genuinely requires it. Document the reason here.
2. **No new dependencies without justification.** Every `bun add` needs a reason that cannot be solved with what already exists.
3. **Content is files, not a database.** Blog posts are Markdown. Project data is a content collection or TypeScript file.
4. **Performance regressions are bugs.** If Lighthouse drops, fix it before shipping.
5. **Mobile is not a breakpoint — it is the primary viewport.** Design for phones first, then expand.
6. **Accessibility is not a phase.** Build it in from day one. Do not bolt it on later.
7. **The site must work without JavaScript.** Alpine enhances; it does not gate.
8. **Self-host everything.** Fonts, assets, scripts. No external runtime dependencies.
9. **Keep the dependency count auditable.** If `node_modules` takes more than a few seconds to scan, something went wrong.
10. **Treat the design system as code.** Changes to tokens or base styles are changes to the product.

---

## Risks and Caveats

### Risk: scope creep from "coolest developer website" ambition

Mitigation: the phase plan is deliberately narrow. Phase 1–4 ships a fast, clean, content-driven site. Phase 5 is where ambition lives, and every item in Phase 5 must earn its spot independently. The site should be impressive because of its restraint and craft, not because of feature count.

### Risk: blog never gets written

Mitigation: the blog pipeline should be frictionless (write Markdown, push, done). The first post is a Phase 3 exit criterion, not a stretch goal. Set a cadence target and treat it like a build commitment.

### Risk: design perfectionism blocks shipping

Mitigation: the design system is specified in this file. Phase 1 implements it. Tweaks happen in Phase 5. Do not redesign during build phases.

### Risk: deployment decision paralysis

Mitigation: the site is static HTML. Any host works. Pick one in Phase 4 and ship. The decision is reversible because the output is just files.

---

## Verification Log

### Verified on 2026-03-23

- `bun run check` — passes (0 errors, 0 warnings)
- `bun run build` — passes (7 pages built in 478ms)
- `bun run test` — passes (3 tests)
- No JavaScript required for any page
- All HTML is semantic with proper ARIA attributes

## Decision Log

- 2026-03-23: project created. Stack is Bun + TypeScript + Astro + Alpine.js. Static output by default. No database, no CMS, no third-party scripts.
- 2026-03-23: dark theme is the default and only theme for v1. Light mode deferred to Phase 5.
- 2026-03-23: blog content lives in Astro content collections as Markdown files. No external CMS.
- 2026-03-23: deployment target deferred until Phase 4. Static output means the choice is reversible.
- 2026-03-23: Inter for body text, JetBrains Mono for code and headings. Self-hosted, no CDN.
- 2026-03-23: no contact form in v1. Direct contact channels listed on the contact page.
- 2026-03-23: Phases 1–3 completed. Phase 4 partially complete (assets done, deployment pending).
- 2026-03-23: Deployment target: self-hosted Caddy via Docker. Multi-stage Dockerfile (Bun build → Caddy Alpine serve). Container serves on port 80 behind an external Caddy reverse proxy that handles TLS. CI pipeline via GitHub Actions.

---

## Resume Checklist

If you are resuming this repo later:

1. Read `README.md`
2. Read this file
3. Check `git status` and `git log --oneline -5`
4. Find the current phase in the Phase Dashboard
5. Run `bun run check && bun run build` to confirm the baseline
6. Pick up where the phase left off
