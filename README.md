# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer.

The public copy now reflects the current direction: Rust-first systems,
PostgreSQL-backed data, Python automation, cryptography, encryption,
high-performance infrastructure, and practical IT operations.

## Public Stack Direction

- **Rust** for CLIs, network services, protocol work, secure transport,
  trading/market-data experiments, and performance-sensitive systems.
- **PostgreSQL** for durable application state, audit trails, search,
  reporting, and job queues before adding more infrastructure.
- **Python** for automation, bots, prototypes, data scripts, and glue, using
  `uv`, Ruff, pytest, and project-local virtual environments.
- **Bash/zsh and PowerShell** for repeatable IT operations across macOS,
  Ubuntu, and Windows.
- **Ubuntu LTS**, **Caddy**, **systemd**, SSH deploys, `pg_dump` backups,
  restore drills, and clear runbooks.

## Current Implementation

The public content is the product surface. The current site backend is an
existing deployable web app and remains in place until a future rewrite earns
the time.

- Java 25 LTS, Spring Boot, embedded Tomcat
- Maven and JDK toolchains
- Spring Boot Actuator for health checks
- Flyway and HikariCP against PostgreSQL
- Thymeleaf templates
- Tailwind built ahead of the fat jar
- Vanilla JavaScript for the theme toggle
- JUnit, AssertJ, Spring Boot Test, and Testcontainers PostgreSQL
- Ubuntu LTS VM, Caddy, systemd, GitHub Actions over SSH

## Layout

```text
content/                editable site content (TOML + Markdown)
  projects.toml         project list
  pages/about.md        about page body
  posts/                blog posts (TOML frontmatter + Markdown)
src/main/java/          current application sources
src/main/resources/
  application*.yml      app config
  templates/            Thymeleaf templates
  static/               icon, generated CSS, theme.js
  db/migration/         Flyway migrations
src/main/tailwind/      Tailwind input.css
src/test/               integration and content tests
deploy/                 systemd unit, Caddyfile fragment, env template
compose.yaml            local PostgreSQL
justfile                developer entrypoints
pom.xml                 Maven build
```

Content stays as plain files under `content/`. The build packages that tree
into the fat jar as classpath resources, and the app loads it into memory at
boot. The database exists for runtime-only state such as visits, future
contact-form submissions, and future link-check results.

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
GET  /actuator/health        health probe
```

## Quick Start

Toolchain:

- JDK 25 for the current site build
- Node 22+ for Tailwind
- Docker for the local PostgreSQL container
- `just`

```sh
just install
just db-up
just dev
```

Useful targets:

```sh
just css-watch
just test
just build
just jar
just psql
```

## Editing Content

- Projects: edit `content/projects.toml`.
- About: edit `content/pages/about.md`.
- Posts: add `content/posts/<slug>.md` with TOML frontmatter.

Content is reloaded on application start, so a content edit still needs a
redeploy.

## Production Deploy

`dunamismax.com` runs on a single Ubuntu VM with PostgreSQL on the same box,
the fat jar under systemd, and Caddy in front for TLS. Cloudflare proxies the
public domain.

Deploys are GitHub Actions over SSH. The workflow builds Tailwind and the fat
jar, copies the jar to `/opt/dunamismax-site/`, updates the
`dunamismax-site.jar` symlink, restarts `dunamismax-site.service`, and checks
`/actuator/health`.

Manual health checks:

```sh
curl -sS https://dunamismax.com/actuator/health
curl -sS https://dunamismax.com/feed.xml | head
```

## License

MIT. See [LICENSE](LICENSE).
