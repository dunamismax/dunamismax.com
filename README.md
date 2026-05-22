# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer.

The public direction is Rust-first systems, PostgreSQL-backed data, Python
automation, cryptography, encryption, high-performance infrastructure, and
practical IT operations.

## Stack

- Rust 2024 Cargo workspace
- Axum HTTP server
- Leptos for server-side rendered HTML
- Tokio runtime
- `sqlx` for PostgreSQL access and migrations
- `tracing` + `tower-http` for logging and middleware
- Hand-authored CSS embedded in the Rust binary
- Vanilla JavaScript for the theme toggle (the only client-side script)
- PostgreSQL 18 for durable runtime state
- Ubuntu LTS, Caddy, and systemd for production

## Layout

```text
content/                    editable site content (TOML + Markdown)
crates/dunamismax-site/     Axum + Leptos server-rendered website
  src/
    main.rs                 listener, tracing, shutdown, router wiring
    router.rs               route table and shared state
    content/                TOML/Markdown loading, validation, rendering
    db/                     PostgreSQL pool, migrations, repositories
    pages/                  Leptos page components
    assets.rs               embedded CSS, JS, icons, robots, manifest
deploy/                     systemd unit, Caddyfile, env template
```

## Content

Content stays as plain files under `content/`.

```text
content/
  projects.toml             project list
  pages/about.md            about page body
  posts/                    blog posts (TOML frontmatter + Markdown)
```

The site renders Markdown with `pulldown-cmark` (CommonMark + GFM tables) and
sanitizes the result through a narrow HTML allowlist so existing inline tags in
`about.md` (paragraph, emphasis, code, heading, link, list, quote, table) keep
working while arbitrary script/style is stripped.

## Routes

```text
GET  /                       home
GET  /about                  about
GET  /contact                contact
GET  /projects               project index
GET  /blog                   post index
GET  /blog/{slug}            post detail
GET  /feed.xml               RSS 2.0 feed
GET  /robots.txt             robots
GET  /manifest.webmanifest   PWA manifest
GET  /icon.svg               favicon / app icon
GET  /healthz                health probe
```

## Local Development

Toolchain:

- Rust stable with `rustfmt` and Clippy
- Docker for local PostgreSQL
- `just`

```sh
just site-dev
just rust-check
just content-validate
```

Useful targets:

```sh
just fmt
just check
just test
just build
just site-release
just db-up
just db-test
just db-down
just psql
```

PostgreSQL schema changes are owned by `sqlx` migrations under
`crates/dunamismax-site/migrations/`. Startup runs migrations by default before
the HTTP listener binds. The only runtime state table is `page_view`, which
stores public route path, optional referrer, optional user agent, and
timestamp; it does not store IP addresses. Contact-form persistence is
intentionally not implemented until spam controls, retention, email delivery,
and operational visibility are designed.

Database configuration:

```sh
DUNAMISMAX_DATABASE_URL=postgres://dunamismax:dunamismax@localhost:5432/dunamismax
DUNAMISMAX_DATABASE_MAX_CONNECTIONS=10
DUNAMISMAX_DATABASE_ACQUIRE_TIMEOUT_SECS=5
DUNAMISMAX_DATABASE_MIGRATE=true
```

`DATABASE_URL` is accepted only when it is already a `postgres://` or
`postgresql://` URL. Use `just db-test` to start an isolated PostgreSQL
container on `127.0.0.1:55432` and prove migrations plus the page-view
repository path from an empty database. The general `db-*` recipes default to
`docker-compose`; set `DOCKER_COMPOSE='docker compose'` on systems that only
ship the Compose v2 plugin.

## Production

`dunamismax.com` runs on a single Ubuntu VM with PostgreSQL on the same box and
Caddy in front for TLS. The VM polls `origin/main` and rebuilds + redeploys
automatically whenever new commits land, so pushing to this repository is the
only deployment step.

Operational shape on the VM:

- one release binary installed under `/opt/dunamismax-site/releases/`
- `/opt/dunamismax-site/dunamismax-site` symlinked to the active release
- localhost-only HTTP listener on `127.0.0.1:3000` behind Caddy
- `dunamismax-site.service` running as the unprivileged `dunamismax` user
- `sqlx` migrations run at startup
- `/healthz` smoke-checked after each restart

Reference VM config lives under `deploy/` (`dunamismax-site.service`,
`Caddyfile`, `site.env.example`).

## License

MIT. See [LICENSE](LICENSE).
