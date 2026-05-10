# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer: engineer working
in Rust, Python, PostgreSQL, and vanilla TypeScript; open source
advocate; and privacy/security-minded builder.

## Stack

A deliberately narrow toolkit:

- **Vanilla HTML, CSS, and TypeScript** for the site itself. No
  frameworks, no SPA, no client-side router, no bundler beyond `tsc`.
- **Python 3.12+** as the build tool, managed with **`uv`** and linted
  with **`ruff`**. A single CLI at `scripts/build.py` produces the
  static `dist/` tree.
- **Caddy** in front for TLS, serving the published webroot directly.
- **Cloudflare** at the edge.

The site is static and does not require a database at runtime. PostgreSQL
appears here as a primary portfolio focus and default future application
data platform, not as a dependency of the current static build.

Content (posts, projects, about copy) lives as plain files in
`content/` so the site stays inspectable, diffable, and easy to host
anywhere.

## Quick start

Toolchain (managed by [mise](https://mise.jdx.dev/)):

```sh
mise install                    # python, node, uv, ruff
npm install -g typescript
```

Python deps + build:

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
