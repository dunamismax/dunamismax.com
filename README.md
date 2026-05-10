# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer: systems-leaning
engineer, open source advocate, and privacy/security-minded builder.

## Stack

A deliberately narrow toolkit:

- **Vanilla HTML, CSS, and TypeScript** for the site itself. No
  frameworks, no SPA, no client-side router, no bundler beyond `tsc`.
- **Python** as the build tool. A single CLI at `scripts/build.py`
  produces the static `dist/` tree.
- **Caddy** in front for TLS, serving `dist/` directly.
- **Cloudflare** at the edge.

Content (posts, projects, about copy) lives as plain files in
`content/` so the site stays inspectable, diffable, and easy to host
anywhere.

## Quick start

```sh
sudo apt-get install -y python3 python3-markdown
npm install -g typescript

python3 scripts/build.py build   # produce dist/
python3 scripts/build.py serve   # http://127.0.0.1:8000
python3 scripts/build.py check   # validate content, links, tsc --noEmit
python3 scripts/build.py clean   # rm -rf dist/
```

## Layout

```
content/        markdown + TOML content
src/            TypeScript and CSS sources
static/         files copied verbatim into dist/
scripts/        build CLI and supporting modules
```

## Routes

```text
GET  /                  home
GET  /about             about
GET  /contact           contact
GET  /projects          project index
GET  /blog              post index
GET  /blog/<slug>       post detail
GET  /feed.xml          RSS 2.0 feed
GET  /robots.txt        robots
GET  /manifest.webmanifest   PWA manifest
```

## Production

`dunamismax.com` is self-hosted on a single Ubuntu box behind Caddy,
with Cloudflare at the edge. The deployment is intentionally boring:
one box, one document root, one redeploy script.

For the production runbook, see [BUILD.md](BUILD.md).

## License

GPL-3.0. See [LICENSE](LICENSE).
