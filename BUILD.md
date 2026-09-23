# BUILD.md

Build, verification, and operational notes for `dunamismax.com`.

`README.md` covers the product, stack, and layout. `AGENTS.md` holds durable
repo operating rules. This file is a short reference for verification gates
and active follow-up work.

Last reviewed: 2026-09-23.

---

## Status

The site was rebuilt from the Rust (Axum/Leptos/PostgreSQL) app to bespoke
PHP on MySQL and cut over on 2026-09-23. Production runs the PHP release from
`/srv/www/dunamismax.com/current` on the `dunamismax` PHP-FPM pool; the Rust
service and the PostgreSQL database were decommissioned by `deploy/05`. See
[docs/production.md](docs/production.md).

## Verification

Docs-only changes:

```sh
git diff --check
```

Normal gate:

```sh
make check
```

MySQL integration (dedicated, empty `_test` database; see `README.md`):

```sh
php tests/database.php
```

Deploy scripts:

```sh
for f in deploy/*.sh; do bash -n "$f"; done
shellcheck -x -e SC1091 deploy/*.sh
```

Local smoke:

```sh
make serve
curl -fsS http://127.0.0.1:8000/healthz
curl -fsS http://127.0.0.1:8000/feed.xml | head
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/does-not-exist
```

Production smoke:

```sh
curl -fsSI https://dunamismax.com/ | sed -n '1,20p'
curl -fsS https://dunamismax.com/healthz
curl -fsS https://dunamismax.com/feed.xml | head
curl -fsSI https://www.dunamismax.com/ | grep -i '^location'
```

## Product Invariants

- Public URLs, status codes, and content types stay stable.
- The site sends zero JavaScript.
- Drafts and future-dated posts never render publicly or appear in RSS.
- The website's MySQL account can only read.
- Nothing needs Node, Composer, or a build step.

## Open Follow-ups

- [x] Run `deploy/01`–`05` on the server (owner, with sudo).
- [x] Update status.dunamismax to stop monitoring `dunamismax-site.service`.
- [ ] Add a Mac pull of `/var/backups/dunamismax`, as Grace & Footnotes has.
- [ ] Add a periodic link check for internal pages and project URLs.
- [ ] Write the first blog post.
