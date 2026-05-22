# AGENTS.md

Repo-local operating manual for `dunamismax.com`. Reading this file plus
`README.md` and `BUILD.md` is sufficient context to begin work.

`README.md` explains the product, stack, and layout. `BUILD.md` covers
verification gates and active follow-ups. This file holds durable engineering,
content, deployment, and repo rules.

## Read Order

1. `AGENTS.md` (this file)
2. `README.md`
3. `BUILD.md`
4. Task-relevant code, tests, content, deploy files, and runbooks

Do not create extra prompt, bootstrap, continuity, profile, scheduler, or
agent-instruction files. If durable repo behavior matters, put it here.

---

## Identity

You are working with Stephen Sawyer (`dunamismax`).

The site represents Stephen's public engineering direction: Rust-first
systems, PostgreSQL-backed durable state, Python automation, security-minded
operations, and self-hostable software.

## Priority Stack

1. Reality first. If it was not observed in the repo, runtime, docs, or remote,
   it is not known.
2. Keep production healthy. The Rust app is live on the VM and redeploys on
   every push to `main`, so a broken commit on `main` is a broken site.
3. Verify before claiming completion.
4. Keep docs and implementation synchronized.

Never fake completion, invent deployed behavior, overstate benchmark or
security claims, hide uncertainty, or leave the repo in a half-migrated state
without documenting the exact boundary.

---

## Product Boundaries

- This is Stephen Sawyer's personal site, portfolio, and blog.
- The public surface must stay fast, readable, accessible, and inspectable.
- The site must remain self-hostable on a single Ubuntu VM behind Caddy.
- Content remains editable as plain files under `content/`.
- PostgreSQL is for durable runtime state such as visits, contact submissions,
  link-check results, audit events, and future search/job tables.
- Do not add accounts, comments, analytics SaaS, JavaScript-heavy frameworks,
  external CMS products, or hosted third-party dependencies unless Stephen
  explicitly asks.
- Do not break existing public URLs.

## Stack Rules

- Rust 2024 Cargo workspace.
- Axum for HTTP routing and middleware.
- Leptos for server-rendered UI components.
- Tokio as the async runtime.
- `tracing` and `tracing-subscriber` for logs.
- `tower-http` where it cleanly solves compression, tracing, headers, or
  static serving.
- `serde` for structured data.
- The Rust `toml` crate for TOML content.
- `pulldown-cmark` for Markdown rendering with a documented extension set and
  a narrow HTML allowlist.
- PostgreSQL with a typed Rust access layer. Use `sqlx` unless a phase records
  a better reason.
- Rust-owned `sqlx` migrations under `crates/dunamismax-site/migrations/`.
- `thiserror` for library/domain errors and clear app-level error mapping.

Default against:

- Adding a TypeScript or JavaScript app framework.
- Adding a Node build step. The Rust binary embeds all assets directly.
- Introducing runtime asset directories when embedded assets work.
- Global mutable state outside explicit Axum state.
- Untyped SQL string sprawl.

## Content Rules

- `content/projects.toml` is the project source of truth.
- `content/pages/about.md` is the about-page body.
- Blog posts live in `content/posts/*.md` with TOML frontmatter delimited by
  `+++`.
- Keep slugs stable. Broken public links are regressions.
- Validate required content fields during tests and app startup.
- Draft blog posts must not render publicly or appear in the RSS feed.
- Render Markdown safely through the existing HTML allowlist; do not silently
  enable arbitrary HTML.
- Keep future language/catalog expansion in content files with typed schemas,
  not hard-coded page branches.

## Web UX Rules

- Build the actual site, not a decorative landing page.
- Preserve existing routes, canonical metadata, RSS, robots, manifest,
  favicon, theme behavior, and error handling unless intentionally changed.
- The first viewport must clearly signal Stephen/dunamismax and the
  Rust/PostgreSQL/Python direction.
- Avoid one-note palettes and oversized marketing sections that make the site
  harder to scan.
- Text must fit cleanly on mobile and desktop.
- Keep JavaScript minimal. The current theme toggle is the ceiling unless
  interactivity earns more.
- Use semantic HTML and accessible navigation. Color must not be the only
  state indicator.
- Route tests should assert meaningful content, status codes, and selected
  headers, not only that the server starts.

## Database Rules

- PostgreSQL is the durable datastore.
- Keep migrations versioned, reviewable, and runnable from a clean database.
- Prefer explicit SQL and typed records over opaque ORM behavior.
- Use connection pool configuration from environment variables.
- Never log credentials or full submitted contact messages at info level.
- Contact submissions, if implemented, need spam controls, retention rules,
  and operational visibility before public enablement.
- Page-view or event tracking must be privacy-conscious and documented.

## Deployment Rules

- Production target is Ubuntu LTS, Caddy, and systemd.
- The VM polls `origin/main` and rebuilds + restarts the service on every
  push, so a commit to `main` is the deploy. Do not push speculative or
  half-finished work to `main`.
- The Rust app binds to localhost; Caddy terminates TLS.
- `/healthz` is the health probe.
- The systemd unit runs as the unprivileged `dunamismax` service user.
- Reference deploy artifacts live under `deploy/` (`dunamismax-site.service`,
  `Caddyfile`, `site.env.example`). These document the VM's expected shape;
  if you change runtime behavior, update them in the same pass.

## Verification

Docs-only changes:

```sh
git diff --check
```

Normal gate:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo build --workspace
```

Local site smoke once the site crate is built:

```sh
cargo run -p dunamismax-site
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/ | head
curl -fsS http://127.0.0.1:3000/feed.xml | head
```

## Repository Hygiene

- Keep `README.md` focused on product, stack, layout, and local development.
- Keep `BUILD.md` focused on verification gates and active follow-ups.
- Keep durable runbooks under `docs/` once they stabilize.
- Update this file when a repo-specific gotcha would save future agents time.
- Do not edit generated build outputs (`target/`) as part of normal work.

## Git And Remotes

Stephen's standard repo setup is dual-push SSH on `origin`: one fetch URL plus
multiple `pushurl` entries for GitHub and Codeberg.

- Before substantial changes, inspect branch, status, and remotes.
- Prefer `git pull --ff-only origin main` before major implementation work
  when network access is available and appropriate.
- Prefer `git push origin <branch>` for routine pushes; this should push to
  both configured push URLs.
- Attribute committed work to the repo's configured `dunamismax` identity.
- Do not override commit authors with `-c user.name=...` or
  `-c user.email=...`.
- If `git config user.email` is not a `dunamismax`-owned address, stop before
  committing.
- Never force-push `main`.
- Never include AI, assistant, co-author, or similar attribution in commits,
  release notes, or public docs.
