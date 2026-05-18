# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer.

The public direction is Rust-first systems, PostgreSQL-backed data, Python
automation, cryptography, encryption, high-performance infrastructure, and
practical IT operations.

## Rewrite Status

This repository is entering a full rewrite from the current Java/Spring stack
to Stephen's Rust web stack:

- Rust 2024 workspace
- Axum HTTP server
- Leptos server-side rendered UI
- Tokio runtime
- SQLx migrations and explicit PostgreSQL access
- `tracing` and `tower-http` for production observability and middleware
- PostgreSQL for durable runtime state
- Caddy and systemd on Ubuntu

The existing Java application remains the production baseline until the Rust
rewrite passes the route, content, database, deployment, and live-site gates in
[`BUILD.md`](BUILD.md). Future agents should treat [`BUILD.md`](BUILD.md) as
the active implementation plan and [`AGENTS.md`](AGENTS.md) as the durable repo
operating manual.

## Public Stack Direction

- **Rust** for CLIs, network services, protocol work, secure transport,
  trading/market-data experiments, and performance-sensitive systems.
- **Leptos + Axum + Tokio** as the default web app stack for self-hosted
  sites, dashboards, admin panels, and SaaS-style products.
- **SQLx** for explicit database access, migrations, and PostgreSQL-backed
  application state.
- **PostgreSQL** for durable application state, audit trails, search,
  reporting, and job queues before adding more infrastructure.
- **Python** for automation, bots, prototypes, data scripts, and glue, using
  `uv`, Ruff, pytest, and project-local virtual environments.
- **clap + tracing** for serious Rust CLIs, with `ratatui` when a terminal UI
  is the right product surface.
- **Bash/zsh and PowerShell** for repeatable IT operations across macOS,
  Ubuntu, and Windows.
- **Ubuntu LTS**, **Caddy**, **systemd**, SSH deploys, `pg_dump` backups,
  restore drills, and clear runbooks.

## Current Production Implementation

The current deployable app is still Java and stays in place until the Rust
rewrite is complete.

- Java 25 LTS, Spring Boot, embedded Tomcat
- Maven and JDK toolchains
- Spring Boot Actuator for health checks
- Flyway and HikariCP against PostgreSQL
- Thymeleaf templates
- Tailwind built ahead of the fat jar
- Vanilla JavaScript for the theme toggle
- JUnit, AssertJ, Spring Boot Test, and Testcontainers PostgreSQL
- Ubuntu LTS VM, Caddy, systemd, GitHub Actions over SSH

## Target Rust Implementation

The Rust rewrite should preserve the public site behavior while replacing the
runtime stack.

Expected target layout:

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
xtask/                      build, deploy, content, and smoke helpers
deploy/                     systemd unit, Caddyfile, env template
docs/                       durable runbooks after implementation settles
```

The exact layout may evolve, but the result should be a Rust-first web app
with thin route handlers, typed content models, explicit database access, and
tests around route output and content validation.

## Content

Content stays as plain files under `content/`.

```text
content/
  projects.toml             project list
  pages/about.md            about page body
  posts/                    blog posts (TOML frontmatter + Markdown)
```

The current app packages this tree into the Java jar as classpath resources.
The Rust app should either embed the content at build time for production or
load it from a configured path in development, but content validation must be
part of the normal test/build gate.

The Rust content loader uses `pulldown-cmark` with CommonMark plus GFM/table
support, then sanitizes rendered HTML through a narrow allowlist that preserves
the current `about.md` paragraph, emphasis, code, heading, link, list, quote,
and table tags while stripping arbitrary script/style behavior.

The Rust site uses hand-authored CSS embedded in the Rust binary instead of
Tailwind. The Java production baseline still keeps its Tailwind files until
the Rust cutover retires that path.

## Routes To Preserve

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
GET  /healthz                Rust health probe
GET  /actuator/health        temporary compatibility health probe
```

Keep `/actuator/health` during the cutover so old deployment checks can be
updated safely. The final Rust-native probe should be `/healthz`.

## Local Development

Toolchain for the Rust rewrite:

- Rust stable with `rustfmt` and Clippy
- Docker for local PostgreSQL when database-backed phases need it
- `just`

```sh
just site-dev
just rust-check
just content-validate
```

Useful Rust targets:

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

The Rust runtime owns PostgreSQL schema changes with embedded `sqlx`
migrations under `crates/dunamismax-site/migrations/`. Startup runs migrations
by default before the HTTP listener binds. The current runtime state table is
`page_view`, which stores public route path, optional referrer, optional user
agent, and timestamp; it does not store IP addresses. Contact-form persistence
is intentionally not implemented until spam controls, retention, email
delivery, and operational visibility are designed.

Rust database configuration:

```sh
DUNAMISMAX_DATABASE_URL=postgres://dunamismax:dunamismax@localhost:5432/dunamismax
DUNAMISMAX_DATABASE_MAX_CONNECTIONS=10
DUNAMISMAX_DATABASE_ACQUIRE_TIMEOUT_SECS=5
DUNAMISMAX_DATABASE_MIGRATE=true
```

`DATABASE_URL` is accepted only when it is already a `postgres://` or
`postgresql://` URL. Java-era `jdbc:postgresql://...` values are ignored by the
Rust config so the two runtimes can coexist during migration. Use `just
db-test` to start the local PostgreSQL container and prove migrations from an
empty database plus the page-view repository path. `just db-test` uses an
isolated temporary container on `127.0.0.1:55432` so it does not depend on any
existing local Postgres bound to `5432`. The general `db-*` recipes default to
`docker-compose`; set `DOCKER_COMPOSE='docker compose'` on systems that only
ship the Compose v2 plugin.

Toolchain for the current Java production baseline:

- JDK 25
- Node 22+ for Tailwind
- Docker for local PostgreSQL
- `just`

```sh
just java-install
just db-up
just java-dev
```

Useful Java fallback targets:

```sh
just java-css-watch
just java-test
just java-build
just java-jar
just java-clean
```

`just dev`, `just fmt`, `just check`, `just test`, `just build`, and
`just clean` now point at the Rust workflow. Java commands stay under
`java-*` while the Java app remains the production fallback.

## Production Deploy

`dunamismax.com` runs on a single Ubuntu VM with PostgreSQL on the same box and
Caddy in front for TLS. The Rust deployment is prepared as a manual GitHub
Actions cutover workflow so pushing this repository does not automatically
replace the still-live Java service.

The prepared Rust deployment keeps the same operational model:

- one release binary installed under `/opt/dunamismax-site/releases/`
- `/opt/dunamismax-site/dunamismax-site` symlinked to the active release
- localhost-only HTTP listener on `127.0.0.1:3000` behind Caddy
- `dunamismax-site.service` running as the unprivileged `dunamismax` user
- Rust-owned `sqlx` migrations run at startup by default
- local `/healthz` and `/actuator/health` smoke checks after restart

Before the first Rust cutover on the VM:

```sh
id -u dunamismax >/dev/null 2>&1 || \
  sudo useradd --system --home-dir /opt/dunamismax-site --shell /usr/sbin/nologin dunamismax
sudo install -d -o dunamismax -g dunamismax -m 0750 /opt/dunamismax-site
sudo install -o dunamismax -g dunamismax -m 0640 deploy/site.env.example /opt/dunamismax-site/site.env
sudoedit /opt/dunamismax-site/site.env
sudoedit /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
```

The GitHub Actions deploy workflow is `workflow_dispatch` only during cutover
preparation. Run it manually after the VM has the Rust `site.env`, the updated
Caddy upstream, and PostgreSQL credentials in place.

Rollback remains the last known-good Java deployment until Rust has served
production traffic successfully. Keep the previous Java jar and Java-era
service unit available on the VM so the service can be pointed back to the jar
and restarted if the first Rust cutover needs to be backed out.

## License

MIT. See [LICENSE](LICENSE).
