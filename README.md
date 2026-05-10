# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer: systems-leaning
engineer, open source advocate, and privacy/security-minded builder.

## Stack

A deliberately narrow toolkit:

- **Vanilla HTML, CSS, and TypeScript** for the site itself. No
  frameworks, no SPA, no client-side router, no bundler beyond `tsc`.
- **Python** as the build tool. A single CLI at `scripts/build.py`
  produces the static `dist/` tree.
- **Caddy** in front for TLS, serving the published webroot directly.
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
python3 scripts/build.py check   # tsc --noEmit + content + link walk
python3 scripts/build.py clean   # rm -rf dist/
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
