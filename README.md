# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer: engineer working
in Kotlin on the JVM and PostgreSQL; open source advocate; and
privacy/security-minded builder.

This site is pending a rewrite onto the Kotlin and PostgreSQL stack
([TECH_STACK.md](https://github.com/dunamismax/dunamismax/blob/main/TECH_STACK.md))
that every project I own is consolidating onto. Until then, the current
build is a small static site that ships the same content.

## Stack (current build, pending rewrite)

The site itself is static and intentionally narrow:

- **Vanilla HTML, CSS, and TypeScript** for the rendered pages. No
  frameworks, no SPA, no client-side router, no bundler beyond `tsc`.
- **A small Python build script** at `scripts/build.py` produces the
  static `dist/` tree.
- **Caddy** in front for TLS, serving the published webroot directly.
- **Cloudflare** at the edge.

The site is static and does not require a database at runtime. The
target rewrite is a Spring Boot app rendering Thymeleaf with HTMX and
Tailwind, backed by PostgreSQL.

Content (posts, projects, about copy) lives as plain files in
`content/` so the site stays inspectable, diffable, and easy to host
anywhere.

## Quick start

Toolchain (managed by [mise](https://mise.jdx.dev/)):

```sh
mise install                    # python, node, uv, ruff
npm install -g typescript
```

Build the static site:

```sh
uv sync                          # create .venv from pyproject.toml
uv run python scripts/build.py build   # produce dist/
uv run python scripts/build.py serve   # http://127.0.0.1:8000
uv run python scripts/build.py check   # tsc --noEmit + content + link walk
uv run python scripts/build.py clean   # rm -rf dist/
```

Lint and format:

```sh
uv run ruff check scripts        # lint
uv run ruff format scripts       # format
uv run mypy                      # type-check
```

## Layout

```
content/        markdown + TOML content
src/            TypeScript and CSS sources
static/         files copied verbatim into dist/
scripts/        build CLI and supporting modules
```

Output:

```
dist/
  index.html
  about/index.html
  contact/index.html
  projects/index.html
  blog/index.html
  blog/<slug>/index.html
  404.html
  feed.xml
  robots.txt
  manifest.webmanifest
  icon.svg
  styles/site.css
  scripts/main.js
  scripts/theme.js
```

## Routes

```text
GET  /                       home
GET  /about                  about
GET  /contact                contact
GET  /projects               project index
GET  /blog                   post index
GET  /blog/<slug>            post detail
GET  /feed.xml               RSS 2.0 feed
GET  /robots.txt             robots
GET  /manifest.webmanifest   PWA manifest
GET  /icon.svg               favicon / app icon
```

## Production deploy

`dunamismax.com` is self-hosted on a single Ubuntu box behind Caddy,
with Cloudflare at the edge. The deploy is intentionally boring: one
box, one document root, one redeploy script.

The repository builds locally to `dist/`. The redeploy script syncs
`dist/` to the served webroot and reloads Caddy.

```sh
scripts/redeploy.sh
```

The script is equivalent to:

```sh
git pull --ff-only
python3 scripts/build.py build
rsync -a --delete dist/ /var/www/dunamismax.com/
sudo systemctl reload caddy
```

The webroot at `/var/www/dunamismax.com` is owned `sawyer:caddy` mode
`0750`, which lets the deploy script write into it without `sudo` and
lets Caddy read it without opening up `/home`.

The Caddy block in this repo's `Caddyfile` is a fragment that lives
inside the multi-tenant `/etc/caddy/Caddyfile` on the host. After a
config change, validate before reloading:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Health check:

```sh
curl -sSI https://dunamismax.com/ | head
curl -sS  https://dunamismax.com/feed.xml | head
```

## License

GPL-3.0. See [LICENSE](LICENSE).
