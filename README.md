# dunamismax.com

**The personal site, portfolio, and writing surface for Stephen Sawyer.**

dunamismax.com is the public-facing home for everything I build. It is a server-rendered site that ships fast, stays small, and proves the stack by being built with it.

The site itself is the portfolio entry. If the page loads in under a second, looks good on a phone, and does not ask for cookies, that is the pitch.

> **Status:** Launch-ready in repo. FastAPI + Jinja2, tests, CI, Docker/Caddy deploy path, RSS, sitemap, robots, and local smoke coverage all exist in-repo today. Public availability still depends on the deployed container being current and healthy.

## Stack

- **Python 3.12+** with strict type checking
- **FastAPI** for the web framework
- **Jinja2** for server-rendered HTML templates
- **htmx** available only if an interaction clearly earns it, with no JavaScript build step today
- **Uvicorn** as the ASGI server
- **Hand-written CSS** with design tokens (no Tailwind, no CSS framework)
- **uv** for package management
- **Ruff** for linting and formatting
- **Pyright** for type checking
- **pytest** for tests

No database. No CMS. No analytics scripts. No cookie banners. No framework theater. No JavaScript build toolchain.

## Domain strategy

| Domain | Role |
| --- | --- |
| `dunamismax.com` | Primary personal site: home, portfolio, blog, about, contact, and links to active projects. |

## Product Surfaces

### Home

The landing page. One screen that communicates who I am, what I build, and where to go next. No hero animations. No scroll-jacking. Fast, sharp, memorable.

### Portfolio

The active project roster. Each entry links to the repo. Projects are grouped by category: apps, infrastructure, security, developer tooling. Status is honest: if it is Phase 0, it says Phase 0.

### Blog

Long-form technical writing. Posts live as data in the repo, rendered with Python's markdown library. No CMS, no database, no comment system. Topics: systems design, self-hosting, Go/Rust craft, operational discipline, product thinking, and lessons from shipping.

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
  src/
    app/
      __init__.py
      main.py
      config.py
      content/
        blog.py
        projects.py
      routes/
        pages.py
      site.py
      templates/
        base.html
        home.html
        about.html
        contact.html
        projects.html
        404.html
        blog/
          index.html
          post.html
      static/
        css/
        fonts/
        og/
  scripts/
    smoke.py
  tests/
  pyproject.toml
  uv.lock
  Dockerfile
  Caddyfile
  docker-compose.yml
  BUILD.md
  README.md
```

## Build and run

### Prerequisites

- Python 3.12+
- uv

### Local development

```bash
uv sync
uv run uvicorn app.main:app --reload
```

### Quality checks

```bash
uv run ruff check .
uv run ruff format --check .
uv run pyright
uv run pytest
uv run python scripts/smoke.py
```

## Machine-readable surfaces

- `/feed.xml` - RSS 2.0 feed for published posts
- `/sitemap.xml` - XML sitemap for the public pages and blog posts
- `/robots.txt` - crawler policy with sitemap location
- `/health` - cheap uptime probe endpoint that returns `{"status": "ok"}`

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
2. Project data is a Python data file, not a CMS.
3. No third-party analytics. If traffic data matters later, use server-side access logs.
4. No cookie banner because there are no cookies.
5. Keep the dependency count low enough to audit in five minutes.
6. Fonts are self-hosted. No Google Fonts CDN call.
7. If the docs and the site disagree, fix both.

## License

MIT. See [LICENSE](LICENSE).
