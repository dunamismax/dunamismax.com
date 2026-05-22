# BUILD.md

Build, verification, and operational notes for `dunamismax.com`.

`README.md` covers the product, stack, and layout. `AGENTS.md` holds durable
repo operating rules. This file is a short reference for verification gates
and any active follow-up work.

Last reviewed: 2026-05-22.

---

## Status

The Rust web app is live at `https://dunamismax.com`. The Ubuntu VM polls
`origin/main` and rebuilds + restarts the service on every push, so
committing to `main` is the deploy.

## Verification

Docs-only changes:

```sh
git diff --check
```

Normal gate before pushing:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo build --workspace
cargo build -p dunamismax-site --release
```

Or, equivalently:

```sh
just rust-check
```

PostgreSQL-backed integration test (spins up an isolated container on
`127.0.0.1:55432`):

```sh
just db-test
```

Local site smoke:

```sh
DUNAMISMAX_SITE_ADDR=127.0.0.1:3000 cargo run -p dunamismax-site
curl -fsS http://127.0.0.1:3000/healthz
curl -fsS http://127.0.0.1:3000/
curl -fsS http://127.0.0.1:3000/feed.xml | head
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/does-not-exist
```

Production smoke after a push has been picked up by the VM:

```sh
curl -fsSI https://dunamismax.com/ | sed -n '1,16p'
curl -fsS https://dunamismax.com/healthz
curl -fsS https://dunamismax.com/feed.xml | head
curl -fsS -o /dev/null -w '%{http_code}\n' https://dunamismax.com/does-not-exist
```

## Product Invariants

- The site stays self-hostable and simple to operate.
- Public URLs stay stable.
- Content stays plain-file editable under `content/`.
- Markdown and TOML parsing fail loudly on invalid content.
- Draft posts never render publicly or appear in RSS.
- PostgreSQL remains the only durable runtime state store.
- The Rust app does not need Node at runtime or build time.
- The deploy artifact is one Rust binary plus environment and service
  configuration.

## Open Follow-ups

These are not blocking but are worth picking up when convenient:

- [ ] Move durable runbooks into `docs/` (deploy steps, backup/restore,
      incident notes) once they exist in stable form.
- [ ] Document the security headers and CSP the site actually serves.
- [ ] Add structured request logging that explicitly excludes sensitive
      fields.
- [ ] Add a periodic link check for internal pages and configured external
      project URLs.
- [ ] Add RSS validation in CI.
- [ ] Add a final accessibility and mobile pass.

## Future Expansion

When time allows, the site should grow language/ecosystem coverage:

- [ ] Design a typed content schema for languages or stack pages.
- [ ] Decide whether language content belongs in this repo or links out to
      `langindex`.
- [ ] Add content files for the first complete language slice.
- [ ] Build Leptos pages/components for language lists and detail pages.
- [ ] Add search/filter behavior only if it works without a heavy frontend
      framework.
- [ ] Add tests for language content validation, routing, ordering, and broken
      internal links.
