# Frontend Contract Inventory

Status on 2026-03-30: the repo default site path is the Astro static frontend under `frontend/`, built into Docker and served by Caddy. This document now serves as the frozen route, metadata, content, styling, and asset contract for the shipped site.

## Phase boundary

- Phases 1 through 5 are complete in repo configuration.
- Phase 6 cleanup is now complete. The repo reads as one Astro-first stack.
- This file remains useful as the frozen current-state contract for routes, metadata, content, styling anchors, and assets.
- The default site path is now the Astro static build under `frontend/`.
- Static output remains the default deployment assumption. No current feature justifies Astro SSR, a backend, or a database.

## Public route contract

| Path | Kind | Current title | Current description | Notes |
| --- | --- | --- | --- | --- |
| `/` | page | `Stephen Sawyer -- dunamismax` | `Building self-hostable systems software. Python, Go, Rust, and the web. Local-first, operator-friendly, relational data.` | Home page |
| `/projects` | page | `Projects -- Stephen Sawyer` | `Active project roster. Self-hostable systems software in Python, Go, Rust, and the web.` | Grouped portfolio roster |
| `/blog` | page | `Blog -- Stephen Sawyer` | `Technical writing on systems design, self-hosting, Go, Rust, and operational discipline.` | Blog index |
| `/blog/{slug}` | page | `{post.title} -- Stephen Sawyer` | `post.description` | Published posts only; missing slug returns 404 |
| `/about` | page | `About -- Stephen Sawyer` | `Who I am, what I care about, and how I build durable software.` | Static page |
| `/contact` | page | `Contact -- Stephen Sawyer` | `How to reach Stephen Sawyer. Email, Signal, GitHub, Twitter, Reddit.` | Static page |
| `404` | page | `404 -- Not Found` | `Page not found.` | Used for unknown blog slugs and missing routes |

## Machine surface contract

| Path | Kind | Contract |
| --- | --- | --- |
| `/feed.xml` | RSS | RSS 2.0 feed for published blog posts |
| `/sitemap.xml` | XML | Sitemap for static public pages plus published blog posts |
| `/robots.txt` | text | Allows all crawlers and points at the sitemap |
| `/health` | JSON | Returns `{"status":"ok"}` with `Cache-Control: no-store` |

## Metadata contract

- Base site URL defaults to `https://dunamismax.com` and must not keep a trailing slash.
- Canonical URLs are absolute and are built as `SITE_URL + path`.
- Shared site identity:
  - `site_name`: `dunamismax.com`
  - `site_title`: `Stephen Sawyer`
  - `site_description`: `Building self-hostable systems software. Python, Go, Rust, and the web.`
  - author: `Stephen Sawyer`
  - Twitter site handle: `@DunamisMax`
  - theme color: `#0a0a0b`
- Shared metadata assets:
  - favicon: `/favicon.svg`
  - default Open Graph image: `/og/default.png`
  - RSS alternate link: `/feed.xml`
- Shared Open Graph behavior:
  - default `og:type` is `website`
  - blog posts switch `og:type` to `article`
  - blog posts expose `article:published_time` as UTC ISO 8601 derived from the post date
  - blog posts emit one `article:tag` meta tag per post tag

## Blog content contract

Current source: frontend-owned Markdown files under `frontend/src/content/blog/`

Schema today:

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | `str` | Used in `/blog/{slug}` and must stay stable |
| `title` | `str` | Page title prefix on post pages |
| `description` | `str` | Used for index summaries and page metadata |
| `date` | `YYYY-MM-DD` string | Used for display, RSS, sitemap, and metadata |
| `tags` | `list[str]` | Used in post UI and article metadata |
| `draft` | `bool` | Draft posts are excluded from index, routes, RSS, and sitemap |
| `content` | Markdown string | Rendered to HTML today |

Behavior today:

- Published posts are `draft == False`.
- Post ordering is newest-first by `date`.
- Reading time is `max(1, ceil(word_count / 230))`.
- Current published slugs:
  - `hello-world`

## Project content contract

Current source: frontend-owned JSON files under `frontend/src/content/projects/`

Schema today:

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `str` | Display name |
| `tagline` | `str` | Primary summary copy |
| `category` | `str` | Must match a known category key |
| `status` | `str` | Must match a known status key |
| `repo` | URL string | Required repository link |
| `stack` | `list[str]` | Ordered display tags |
| `url` | URL string or `None` | Optional public project URL |

Category labels and order:

- `apps` -> `Apps`
- `infrastructure` -> `Infrastructure`
- `developer-tools` -> `Developer Tools`
- `reference` -> `Reference`
- Display order is `apps`, `infrastructure`, `developer-tools`, `reference`

Status labels:

- `active` -> `Active`
- `shipped` -> `Shipped`
- `phase-0` -> `Phase 0`
- `legacy` -> `Legacy`

## Styling and asset contract

Current style sources:

- shared tokens: `frontend/src/styles/tokens.css`
- shared structure and page styles: `frontend/src/styles/global.css`

Carry-forward anchors for the shipped frontend:

- Palette variables:
  - `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
  - `--border`
  - `--text-primary`, `--text-secondary`, `--text-tertiary`
  - `--accent`, `--accent-hover`, `--accent-muted`
  - `--success`, `--warning`, `--error`
  - `--code-bg`
- Typography variables:
  - `--font-body`: `Inter`
  - `--font-mono`: `JetBrains Mono`
  - `--font-heading`: mono by default
- Layout variables:
  - `--wide-width: 80rem`
  - `--content-width: 65ch`
  - `--nav-height: 3.5rem`
  - `--radius: 0.375rem`
- Motion variables:
  - `--duration-fast`, `--duration-normal`, `--duration-slow`, `--easing`
  - reduced-motion mode zeros them out
- Shared layout behavior:
  - fixed top navigation
  - main content padded below nav height
  - centered footer with lightweight utility links

Assets that should remain self-hosted:

- `frontend/public/favicon.svg`
- `frontend/public/og/default.png`
- `frontend/public/fonts/InterVariable.woff2`
- `frontend/public/fonts/InterVariable-Italic.woff2`
- `frontend/public/fonts/JetBrainsMono-Regular.woff2`
- `frontend/public/fonts/JetBrainsMono-Medium.woff2`
- `frontend/public/fonts/JetBrainsMono-Bold.woff2`
- `frontend/public/fonts/JetBrainsMono-Italic.woff2`

## Source of truth

This inventory was extracted from:

- `frontend/src/config/site.ts`
- `frontend/src/content/blog/`
- `frontend/src/content/projects/`
- `frontend/src/styles/tokens.css`
- `frontend/src/styles/global.css`
