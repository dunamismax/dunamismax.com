# Frontend Contract Inventory

This document is the current route, metadata, content, styling, and asset contract for the shipped `dunamismax.com` site.

## Site boundary

- The repo default site path is the Astro static frontend under `frontend/`.
- Public HTML routes, machine-readable surfaces, styling, and repo-owned content live in the frontend.
- Docker packages the built static output and Caddy serves it.
- Static output remains the default deployment assumption. No current feature justifies Astro SSR, a backend, or a database.

## Public route contract

| Path | Kind | Current title | Current description | Notes |
| --- | --- | --- | --- | --- |
| `/` | page | `Stephen Sawyer -- dunamismax` | `Building self-hostable software in Python, Go, and TypeScript. Astro-first web apps, local-first bias, relational data.` | Home page |
| `/projects` | page | `Projects -- Stephen Sawyer` | `Active project roster across full-stack web apps, Go systems work, Python automation, and selective Rust maintenance.` | Grouped portfolio roster |
| `/blog` | page | `Blog -- Stephen Sawyer` | `Technical writing on Bun and Astro web apps, Go systems work, Python automation, self-hosting, and operational discipline.` | Blog index |
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
  - `site_description`: `Building self-hostable software in Python, Go, and TypeScript.`
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
| `order` | `int` | Per-category display order |
| `name` | `str` | Display name |
| `tagline` | `str` | Primary summary copy |
| `category` | `str` | Must match a known category key |
| `status` | `str` | Must match a known status key |
| `visibility` | `public \| private` | Controls whether the project shows a public repo link or a private-repo note |
| `repo` | URL string or `None` | Optional public repository link |
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

Visibility behavior:

- `public` projects render a `repo ->` link when `repo` is present
- `private` projects render a `private repo` note instead of a broken external link
- `url`, when present, renders as `read it ->` regardless of repo visibility

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
