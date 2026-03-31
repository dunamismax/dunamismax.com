# dunamismax.com

**The personal site, portfolio, and writing surface for Stephen Sawyer.**

dunamismax.com is the public-facing home for everything I build. The repo ships the site as a Bun + Astro + Vue frontend built from `frontend/` and served as static output through Docker + Caddy.

The site itself is the portfolio entry. If the page loads in under a second, looks good on a phone, and does not ask for cookies, that is the pitch.

> **Status:** Astro static site is the default local, CI, and container deploy path in repo. The public HTML routes, machine-readable surfaces, and repo-owned content all live under `frontend/`.
>
> This repo intentionally uses the frontend-only slice of Stephen's broader Bun + TypeScript + Astro + Vue web lane. It does not currently justify a Bun API, auth layer, or PostgreSQL database.

## Stack

### Default serving path

- **Bun**
- **TypeScript**
- **Astro**
- **Vue** only for earned client islands
- **Caddy** serving the built static output in Docker
- **Biome** for linting and formatting
- **`astro check`** for type and route validation
- **`bun test`** for frontend utilities
- **Python stdlib smoke check** for the built site artifact

No database. No CMS. No analytics scripts. No cookie banners. No framework theater.

### Local verification helper

- **Python 3.11+** for `scripts/smoke.py`

The smoke script uses only the Python standard library. No Python web stack remains in the repo.

## Domain strategy

| Domain | Role |
| --- | --- |
| `dunamismax.com` | Primary personal site: home, portfolio, blog, about, contact, and links to active projects. |

## Product Surfaces

### Home

The landing page. One screen that communicates who I am, what I build, and where to go next. No hero animations. No scroll-jacking. Fast, sharp, memorable.

### Portfolio

The active project roster. Projects are grouped by category: apps, infrastructure, developer tools, and reference. Public repo links show up where they exist, and private repos are marked honestly instead of sending readers to dead links. Status is honest: if it is Phase 0, it says Phase 0.

### Blog

Long-form technical writing. Posts live as frontend-owned Markdown in the repo and build directly into the Astro site. No CMS, no database, no comment system. Topics: TypeScript + Bun web apps, Go systems work, Python automation, self-hosting, operational discipline, product thinking, and lessons from shipping.

### About

Who I am. What I care about. The stack philosophy and why it exists. Short, direct, no resume theater.

### Contact

How to reach me. Channels listed clearly, no contact form.

- Email: dunamismax@tutamail.com
- Signal: [signal.me link](https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph)
- GitHub: [dunamismax](https://github.com/dunamismax)
- Twitter: [DunamisMax](https://x.com/DunamisMax)
- Reddit: [DunamisMax](https://www.reddit.com/user/DunamisMax/)

## Repository Layout

```text
dunamismax.com/
  deploy/
    static-site.Caddyfile
  frontend/
    public/
    src/
      components/
      config/
      content/
        blog/
        projects/
      layouts/
      pages/
      styles/
    tests/
    package.json
  docs/
    frontend-contract-inventory.md
  scripts/
    smoke.py
    verify.sh
  Dockerfile
  Caddyfile
  docker-compose.yml
  package.json
  README.md
```

## Build and run

### Prerequisites

- Bun
- Python 3.11+ for the local smoke script
- Docker (for the containerized deploy path)

### Local development

Install the frontend dependencies once:

```bash
bun --cwd frontend install
```

Default site development from the repo root:

```bash
bun run dev
```

Preview the built site locally:

```bash
bun run build
bun run preview
```

Containerized deploy path:

```bash
docker compose up -d --build
```

If `8080` is already in use on the host, publish the site on another port:

```bash
DUNAMISMAX_HOST_PORT=18080 docker compose up -d --build
python3 scripts/smoke.py --base-url http://127.0.0.1:18080
```

### Quality checks

Default repo-root verification:

```bash
bun run verify
```

Equivalent manual checks:

```bash
bun --cwd frontend install --frozen-lockfile
bun --cwd frontend run lint
bun --cwd frontend run check
bun --cwd frontend run test
bun --cwd frontend run build
python3 scripts/smoke.py
```

Container smoke against an already running published port:

```bash
python3 scripts/smoke.py --base-url http://127.0.0.1:8080
```

## Machine-readable surfaces

- `/feed.xml` - RSS 2.0 feed for published posts
- `/sitemap.xml` - XML sitemap for the public pages and blog posts
- `/robots.txt` - crawler policy with sitemap location
- `/health` - cheap uptime probe endpoint that returns `{"status": "ok"}`
- Public HTML pages ship canonical metadata plus JSON-LD for site identity, and blog posts add `BlogPosting` structured data

## Design direction

Dark by default. The site should feel like a terminal that learned typography.

- High-contrast dark palette with one accent color
- Monospace for code and headings where it fits; clean sans-serif for body text
- Generous whitespace, tight line lengths, no visual clutter
- Subtle motion only, no parallax, no scroll hijacking, no entrance animations
- Fast enough that the network tab is boring
- Mobile-first layout that does not feel like a concession

The aesthetic target: if a senior engineer opened the site at 2am while debugging something, they would not close the tab.

## Development rules

1. Blog posts are data in the repo, not a database.
2. Project data is frontend-owned repo content, not a CMS.
3. No third-party analytics. If traffic data matters later, use server-side access logs.
4. No cookie banner because there are no cookies.
5. Keep the dependency count low enough to audit in five minutes.
6. Fonts are self-hosted. No Google Fonts CDN call.
7. If the docs and the site disagree, fix both.

## License

MIT. See [LICENSE](LICENSE).
