# BUILD.md

Active build plan for the `dunamismax.com` Rust rewrite.

`README.md` explains the product and stack direction. `AGENTS.md` holds
durable repo operating rules. This file stays focused on current state, open
work, phase order, and verification.

Last reviewed: 2026-05-17.

---

## Current Baseline

The production implementation is a Java web app:

- Java 25, Spring Boot, embedded Tomcat, Maven
- Thymeleaf server templates
- Tailwind built by Node before packaging
- Spring Actuator health checks
- Flyway and HikariCP against PostgreSQL
- File-backed content loaded from `content/`
- Routes for home, about, contact, projects, blog, RSS, robots, manifest, and
  icon
- GitHub Actions CI and SSH deploy to an Ubuntu VM
- Caddy reverse proxy and systemd service

Root docs are now aligned for the rewrite:

- [x] `README.md` states the current Java baseline and target Rust stack.
- [x] `AGENTS.md` exists with repo-local operating rules.
- [x] `BUILD.md` exists with a multi-pass Rust migration plan.

Do not delete or disable the Java production path until the Rust cutover phase
passes.

---

## Target Architecture

The rewrite target is a Rust web app modeled after Stephen's FileFerry site
stack, adapted for this repo's content, PostgreSQL, and portfolio/blog needs.

Recommended target:

- Cargo workspace at the repository root.
- `crates/dunamismax-site` binary crate for the public website.
- Optional `xtask` crate for repeatable build, content, deploy, and smoke
  helpers once shell recipes become too large.
- Axum router with explicit app state.
- Leptos SSR page components.
- Tokio runtime.
- `tracing` instrumentation.
- `tower-http` for request tracing, compression, headers, and static/asset
  concerns where appropriate.
- Typed content loader for TOML projects, Markdown pages, and Markdown posts
  with TOML frontmatter.
- PostgreSQL connection pool and Rust-owned migrations for runtime state.
- Caddy plus systemd production deployment.

Target public routes:

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

Keep the Java app and Rust app runnable side by side during migration. The
Rust app should use `DUNAMISMAX_SITE_ADDR`, defaulting to `127.0.0.1:3000`.

---

## Product Invariants

- The site must remain self-hostable and simple to operate.
- Public URLs must remain stable.
- Content must remain plain-file editable.
- Markdown and TOML parsing must fail loudly on invalid content.
- Draft posts must never render publicly or appear in RSS.
- PostgreSQL remains the durable runtime state store.
- The Rust app should not need Node at runtime.
- The final deploy artifact should be one Rust binary plus environment and
  service configuration.
- The public copy should keep the Rust/PostgreSQL/Python/security/operations
  positioning already present in the current site.

---

## Phase Plan

Work these in order. Each coding pass should leave the repo in a coherent
state, update this file, commit its changes, and push through `origin` so both
configured push remotes receive the branch.

### Phase 1: Rust Workspace Scaffold

Goal: add a Rust workspace without disturbing the Java production path.

- [x] Add root `Cargo.toml` with workspace package metadata, Rust edition, and
      shared dependency versions.
- [x] Add `crates/dunamismax-site` with a minimal Axum server.
- [x] Add `/healthz` and `/actuator/health` responses.
- [x] Add `DUNAMISMAX_SITE_ADDR` and `DUNAMISMAX_SITE_LOG` configuration.
- [x] Add tracing initialization.
- [x] Add route tests for health and unknown-route behavior.
- [x] Add Rust-oriented `just` targets while preserving current Java targets.
- [x] Add CI steps for Rust format, clippy, test, and build without removing
      Java CI yet.

Exit criteria: `cargo fmt --all --check`, `cargo clippy`, `cargo test`, and
`cargo build` pass for the scaffold, and the Java app is still untouched.

### Phase 2: Typed Content Loader

Goal: port the file-backed content model before touching page design.

- [x] Model projects, categories, statuses, pages, posts, frontmatter, and
      page metadata in Rust.
- [x] Parse `content/projects.toml` with duplicate-slug and required-field
      validation.
- [x] Parse `content/pages/about.md`.
- [x] Parse `content/posts/*.md` with `+++` TOML frontmatter.
- [x] Render Markdown with documented extensions and safe HTML behavior,
      accounting for the limited raw HTML currently present in
      `content/pages/about.md`.
- [x] Preserve published/draft filtering and newest-post sorting.
- [x] Add unit tests for valid content, missing keys, duplicate slugs, draft
      filtering, slug fallback, date parsing, and reading-time calculation.
- [x] Add a content validation command or test that fails the normal build
      gate on bad content.

Exit criteria: the Rust content layer can load the existing `content/` tree and
produce the same logical projects, pages, and published posts as Java.

### Phase 3: Leptos Page Shell And Routes

Goal: reproduce the public route surface in Rust with SSR HTML.

- [x] Build the shared Leptos layout with head metadata, canonical URL, header,
      footer, skip link, and active navigation state.
- [x] Implement home with featured projects and latest post.
- [x] Implement about using rendered Markdown body.
- [x] Implement projects grouped by category and sorted by position/name.
- [x] Implement blog index and post detail.
- [x] Implement contact page with the existing public contact methods.
- [x] Implement error/not-found page.
- [x] Implement RSS feed at `/feed.xml`.
- [x] Implement robots, manifest, and icon routes.
- [x] Add route tests for all public paths, selected metadata, meaningful body
      content, 404 behavior, and draft exclusion.

Exit criteria: the Rust app serves every current public URL with equivalent
content and correct status codes.

### Phase 4: Styling, Assets, And Theme Behavior

Goal: make the Rust-rendered site look and behave like the intended production
site without carrying unnecessary Java/Node assumptions.

- [x] Decide whether to keep Tailwind as a build-time tool or replace it with
      hand-authored CSS embedded in the Rust binary.
- [x] Port the current visual system into Rust-served assets.
- [x] Preserve dark/light theme behavior and local storage key compatibility.
- [x] Serve CSS, theme JS if still needed, favicon, manifest, and robots with
      correct content types.
- [x] Add cache headers where appropriate.
- [x] Run browser checks at desktop and mobile widths.
- [x] Fix visible overflow, overlap, contrast, and navigation issues.

Exit criteria: the Rust site is visually production-ready and does not depend
on Java resources or Spring static serving.

### Phase 5: PostgreSQL Runtime State

Goal: replace Java-era database wiring with explicit Rust database ownership.

- [x] Choose and document the Rust migration/access stack. Prefer `sqlx` unless
      this phase records a better reason.
- [x] Port the existing page-view schema or replace it with a cleaner
      Rust-owned migration.
- [x] Add database URL, pool size, timeout, and migration configuration.
- [x] Implement startup migration behavior or a clear `xtask`/deploy migration
      step.
- [x] Add repository functions for current runtime state.
- [x] Add tests using a real PostgreSQL container or an explicitly documented
      integration-test path.
- [x] Keep contact-form persistence disabled until spam, retention, email, and
      operations rules are designed.

Exit criteria: Rust owns the database schema needed for production parity and
the normal test/deploy path proves migrations from an empty database.

### Phase 6: CI, Build, And Developer Workflow

Goal: make Rust the normal local and CI workflow while Java still exists as a
fallback.

- [x] Update `justfile` with Rust-first commands: `fmt`, `check`, `test`,
      `site-dev`, `site-release`, `db-up`, `db-down`, `psql`, and `clean`.
- [x] Keep any Java fallback targets clearly labeled until removal.
- [x] Update GitHub Actions to run Rust gates and only keep Java gates while
      the Java app remains deployable.
- [x] Add content validation to CI.
- [x] Add a release build check for `crates/dunamismax-site`.
- [x] Document local development in `README.md`.

Exit criteria: a future agent can run one documented command to verify the
Rust site locally and in CI.

### Phase 7: Deployment Cutover

Goal: deploy the Rust binary behind Caddy without losing the current site.

- [ ] Add or update `deploy/dunamismax-site.service` for the Rust binary.
- [ ] Add or update `deploy/site.env.example` for Rust environment variables.
- [ ] Update `deploy/Caddyfile` if routes, health checks, headers, or upstream
      ports changed.
- [ ] Update GitHub Actions deploy to build the Rust release binary, copy it to
      the VM, install or symlink it atomically, restart systemd, and smoke
      `/healthz`.
- [ ] Keep a rollback note for the last Java jar deployment until Rust has run
      in production.
- [ ] Smoke locally on the VM with `curl`.
- [ ] Smoke publicly over HTTPS for `/`, `/projects`, `/blog`, `/feed.xml`,
      `/manifest.webmanifest`, `/healthz`, and a missing page.
- [ ] Update README production deploy notes.

Exit criteria: production `https://dunamismax.com` is served by the Rust app
and deploy automation proves it.

### Phase 8: Retire Java, Maven, And Node-Only Build Pieces

Goal: remove obsolete implementation once Rust is live and verified.

- [ ] Remove Spring/Java sources, Maven wrapper, `pom.xml`, and Java test
      resources.
- [ ] Remove Node/Tailwind files only if Phase 4 no longer uses Tailwind.
- [ ] Remove Java-era GitHub Actions steps.
- [ ] Remove Java-era deploy artifacts and docs.
- [ ] Update `.gitignore` for the Rust project shape.
- [ ] Update README layout and quick-start sections to the final Rust state.
- [ ] Run the full Rust gate after deletion.

Exit criteria: the repo no longer contains obsolete Java production code and
all documented commands describe the Rust site.

### Phase 9: Language And Portfolio Expansion

Goal: after the Rust rewrite is stable, add the broader language/project
coverage Stephen wants without mixing it into the runtime migration.

- [ ] Design a typed content schema for languages, ecosystems, or stack pages.
- [ ] Decide whether language content belongs in this repo or should link out
      to `langindex`.
- [ ] Add content files for the first complete language slice.
- [ ] Build Leptos pages/components for language lists and detail pages.
- [ ] Add search/filter behavior only if it works without a heavy frontend
      framework.
- [ ] Add tests for language content validation, routing, ordering, and broken
      internal links.
- [ ] Expand the schema and content in follow-up passes until the remaining
      languages are represented.

Exit criteria: language coverage is content-driven, typed, test-backed, and no
longer blocked by the Rust rewrite.

### Phase 10: Final Hardening

Goal: make the Rust site boring to operate.

- [ ] Add a deployment runbook under `docs/`.
- [ ] Add database backup and restore notes if runtime state is enabled.
- [ ] Add security headers and document the CSP.
- [ ] Add structured request logging that avoids sensitive data.
- [ ] Add link checks for internal pages and configured external project URLs.
- [ ] Add RSS validation.
- [ ] Add a final accessibility and mobile pass.
- [ ] Confirm README, AGENTS, BUILD, deploy files, and live behavior agree.
- [ ] Retire this build plan when every phase is complete.

Exit criteria: future work can proceed as normal feature development rather
than rewrite migration.

---

## Verification

Docs-only changes:

```sh
git diff --check
```

Current Java baseline:

```sh
just install
just db-up
just test
just build
```

Target Rust gate once the workspace exists:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo build --workspace
```

PostgreSQL-backed Rust runtime state gate:

```sh
just db-test
```

Target local site smoke once the Rust site crate exists:

```sh
DUNAMISMAX_SITE_ADDR=127.0.0.1:3000 cargo run -p dunamismax-site
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/
curl -fsS http://127.0.0.1:3000/feed.xml | head
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/does-not-exist
```

Production smoke after cutover:

```sh
curl -fsSI https://dunamismax.com/ | sed -n '1,16p'
curl -fsS https://dunamismax.com/healthz
curl -fsS https://dunamismax.com/feed.xml | head
curl -fsS -o /dev/null -w '%{http_code}\n' https://dunamismax.com/does-not-exist
```
