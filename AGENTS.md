# AGENTS.md

Repo-local operating manual for `dunamismax.com`. Reading this file plus
`README.md` and `BUILD.md` is sufficient context to begin work.

`README.md` explains the product and current/target stack. `BUILD.md` is the
active Rust rewrite plan. This file holds durable engineering, content,
deployment, and repo rules.

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
2. Preserve production. The existing Java site is the live baseline until a
   Rust phase explicitly replaces it.
3. Serve the rewrite plan. Follow `BUILD.md` in order unless Stephen changes
   scope.
4. Verify before claiming completion.
5. Keep docs and implementation synchronized.

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
- Do not break existing public URLs during the Rust cutover.
- Keep Java/Spring code only as the temporary production baseline. The target
  runtime is Rust, Leptos, Axum, Tokio, and PostgreSQL.

## Stack Rules

- Use a Rust 2024 Cargo workspace.
- Use Axum for HTTP routing and middleware.
- Use Leptos for server-rendered UI components.
- Use Tokio as the async runtime.
- Use `tracing` and `tracing-subscriber` for logs.
- Use `tower-http` where it cleanly solves compression, tracing, headers, or
  static serving.
- Use `serde` for structured data.
- Use the Rust `toml` crate for TOML content.
- Use a maintained Markdown renderer such as `pulldown-cmark` or `comrak`;
  pick one deliberately and document the supported extensions.
- Use PostgreSQL with a typed Rust access layer. Prefer `sqlx` unless a phase
  records a better reason.
- Keep DB migrations in the Rust-owned path once the rewrite begins. The
  current Flyway migrations are Java-era input, not the final migration tool.
- Use `thiserror` for library/domain errors and clear app-level error mapping.
- Keep `xtask` for repeated build, content validation, deploy, smoke, and
  migration helpers once those scripts become non-trivial.

Default against:

- Recreating Spring concepts in Rust.
- Adding a TypeScript or JavaScript app framework.
- Adding a separate Node build unless a measured CSS or asset need earns it.
- Introducing runtime asset directories when simple embedded assets work.
- Global mutable state outside explicit Axum state.
- Untyped SQL string sprawl.

## Content Rules

- `content/projects.toml` remains the project source of truth.
- `content/pages/about.md` remains the about-page body.
- Blog posts live in `content/posts/*.md` with TOML frontmatter delimited by
  `+++`.
- Keep slugs stable. Broken public links are regressions.
- Validate required content fields during tests and app startup.
- Draft blog posts must not render publicly or appear in the RSS feed.
- Render Markdown safely. Existing content contains limited raw HTML such as
  paragraph and code tags; either preserve a narrow allowlist or convert that
  content during the relevant phase, but do not silently enable arbitrary HTML.
- Keep future language/catalog expansion in content files with typed schemas,
  not hard-coded page branches.

## Web UX Rules

- Build the actual site, not a decorative landing page.
- Preserve the existing routes, canonical metadata, RSS, robots, manifest,
  favicon, theme behavior, and error handling unless a phase changes them
  intentionally.
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
- The Rust app should bind to localhost and let Caddy terminate TLS.
- Keep health checks available locally and publicly.
- Keep `/actuator/health` as a temporary compatibility route until deploy
  automation no longer needs it; prefer `/healthz` for the Rust app.
- systemd units should run as an unprivileged service user with reasonable
  sandboxing.
- Deploys should build a release binary, install it atomically, restart the
  service, and run smoke checks.
- Update `deploy/`, CI, README, and `BUILD.md` in the same pass as any deploy
  behavior change.

## Verification

Docs-only changes:

```sh
git diff --check
```

Rust rewrite phases should grow toward this normal gate:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo build --workspace
```

When the site crate exists, include route and content smokes:

```sh
cargo run -p dunamismax-site
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/ | head
curl -fsS http://127.0.0.1:3000/feed.xml | head
```

## Repository Hygiene

- Keep `README.md` focused on product, status, usage, architecture, and deploy
  shape.
- Keep `BUILD.md` as the living implementation plan and milestone checklist.
- Keep durable implementation docs under `docs/` once the Rust rewrite creates
  details worth preserving.
- Update this file when a repo-specific gotcha would save future agents time.
- Do not remove the Java production path until the Rust replacement has passed
  the cutover phase in `BUILD.md`.
- Do not edit generated build outputs, `target/`, `build/`, or `node_modules/`
  as part of normal work.

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
