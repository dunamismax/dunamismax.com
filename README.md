# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer.

Server-rendered Spring Boot 4 app on Kotlin and the JVM, backed by
PostgreSQL, with Thymeleaf, HTMX, and Tailwind on top. One language, one
database, one VM.

## Stack

- **Kotlin 2.2.20** on **JDK 21** with virtual threads
- **Spring Boot 4.0.6** + Spring MVC + Spring Data JDBC + jOOQ
- **kotlinx.serialization**, **commonmark-java**, **tomlj**
- **PostgreSQL 18** with `pgcrypto`, `pg_trgm`, `pg_stat_statements`
- **Flyway** for migrations
- **Thymeleaf** templates with **HTMX** for progressive enhancement
- **Tailwind v4** for styling, built ahead of the fat jar
- **Testcontainers PostgreSQL** for integration tests
- **Caddy** in front of the Spring Boot fat jar under **systemd** on a single Ubuntu VM
- **GitHub Actions** for CI and deploy over SSH

## Layout

```
content/                editable site content (TOML + Markdown)
  projects.toml         project list
  pages/about.md        about page body
  posts/                blog posts (TOML frontmatter + Markdown)
src/main/kotlin/        Kotlin application sources
src/main/resources/
  application*.yml      Spring config
  templates/            Thymeleaf templates
  static/               icon, generated CSS, theme.js
  db/migration/         Flyway migrations
src/main/tailwind/      Tailwind input.css
src/test/kotlin/        Testcontainers-backed integration tests
deploy/                 systemd unit, Caddyfile fragment, env template
compose.yaml            local PostgreSQL 18
justfile                developer entrypoints
build.gradle.kts        Gradle Kotlin DSL build
```

Content (projects, posts, about copy) stays as plain files under
`content/`. The Gradle build packages that tree into the fat jar as
classpath resources, and the app loads it into memory at boot. The
database exists for runtime-only state (visits, future contact-form
submissions, future link-check results); content is not persisted there
and does not need a migration when it changes.

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
GET  /actuator/health        health probe (used by deploy)
```

## Quick start

Toolchain:

- JDK 21 (Temurin recommended)
- Node 22+ for Tailwind
- Docker (for the local PostgreSQL 18 container)
- [`just`](https://github.com/casey/just)

First run:

```sh
just install         # npm ci
just db-up           # docker compose up -d postgres
just css             # build the Tailwind stylesheet once
just dev             # bootRun with the `dev` profile
```

Then open <http://localhost:8080>.

Useful targets:

```sh
just css-watch       # rebuild Tailwind on change
just test            # ./gradlew test (uses Testcontainers PG 18)
just build           # ./gradlew clean build
just jar             # ./gradlew bootJar
just psql            # psql into the local database
```

## Editing content

- **Projects** — edit `content/projects.toml`. Each `[[projects]]` entry
  defines a card. `featured = true` lifts a project onto the home page.
- **Posts** — add `content/posts/<slug>.md` with TOML frontmatter:

  ```toml
  +++
  title = "Post title"
  description = "Short summary used on the index and in RSS."
  published_on = 2026-05-11
  tags = ["kotlin", "postgres"]
  +++

  Body content in Markdown.
  ```
- **About** — edit `content/pages/about.md`.

Content is reloaded on application start, so a code-free content edit
still needs a redeploy. That keeps the operating story simple: one
artifact, one truth.

## Production deploy

`dunamismax.com` runs on a single Ubuntu VM with PostgreSQL 18 on the
same box, the Spring Boot fat jar under `systemd`, and Caddy in front
for TLS. Cloudflare proxies the public domain.

One-time host setup:

```sh
sudo mkdir -p /opt/dunamismax-site
sudo cp deploy/dunamismax-site.service /etc/systemd/system/
sudo cp deploy/site.env.example /opt/dunamismax-site/site.env  # then edit
sudo systemctl daemon-reload
sudo systemctl enable dunamismax-site.service
```

Caddy site block lives at `/etc/caddy/Caddyfile` (the fragment in
`deploy/Caddyfile` shows the shape). Reload Caddy with `sudo systemctl
reload caddy` after edits; validate first with `sudo caddy validate
--config /etc/caddy/Caddyfile`.

Deploys are GitHub Actions over SSH. The workflow:

1. Builds Tailwind and the Spring Boot fat jar
2. Copies the jar to `/opt/dunamismax-site/`
3. Updates the `dunamismax-site.jar` symlink to the new artifact
4. Restarts `dunamismax-site.service`
5. Hits `/actuator/health` and fails the deploy if the app is not `UP`

Required GitHub secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`,
optionally `DEPLOY_PORT`. The deploy user needs passwordless `sudo
systemctl restart dunamismax-site.service`.

Flyway runs at app boot, so migrations ship with the jar — there is no
separate migrate step.

Health check:

```sh
curl -sS https://dunamismax.com/actuator/health
curl -sS https://dunamismax.com/feed.xml | head
```

## License

GPL-3.0. See [LICENSE](LICENSE).
