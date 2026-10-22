# Repository operating rules

Read this file, `README.md`, `BUILD.md`, and task-relevant `docs/` before changes.
Read `/home/sawyer/github/ubuntu-vm-backup/docs/astro-migration.md` before any
server deployment. The owner’s Astro/TypeScript/PostgreSQL assignment replaces
the historical PHP-only implementation restrictions.

## Product and content

This is Stephen Sawyer’s (`dunamismax`) personal portfolio and blog. Preserve
approved copy, branding, public URLs, metadata, project anchors and contact
links. Keep other project stack/status claims grounded in their actual runtime
and [portfolio evidence](docs/portfolio.md). The final host migration authorizes factual stack descriptions to reflect
verified Astro/TypeScript/PostgreSQL deployments. Preserve unrelated profile copy. Do not publish private sources, addresses, keys,
backup locations or drafts. No public admin, forms, accounts, tracking or scripts.

## Implementation

- Astro 7.4.2 / Node adapter 11.1.9, TypeScript 6.0.3 strict with
  noUncheckedIndexedAccess and exactOptionalPropertyTypes.
- Pin Node 24.22.1 / npm 11.19.1 and exact dependencies; use `npm ci`.
- Semantic HTML, existing vanilla CSS, zero browser JavaScript and inline styles.
  Theme follows prefers-color-scheme. Preserve CSP, skip links and aria-current.
- Prerender genuinely static pages; query PostgreSQL for home/blog/posts/RSS.
  Never bake drafts, post exports or credentials into any build artifact.
- Posts stay plain text, escaped in HTML and in both RSS encoding layers.
- Publication visibility lives in `app.public_posts`: published and due according
  to the database clock. Web cannot SELECT the underlying private table.
- Publishing uses its own PG role/config; edits preserve slug/status/date,
  scheduling requires an explicit offset and future database time. No credentials
  or post bodies in diagnostic logs. Do not use website credentials for writing.
- `bin/server.ts` applies methods, headers and path boundaries before Astro’s
  static/SSR handler. Standalone’s static handler bypasses Astro middleware.

## Deployment and safety

Deploy only this site; never restart shared PHP-FPM, MySQL, PostgreSQL or Caddy.
Use `/usr/local/lib/caddy/caddy`, not `/usr/bin/caddy`. Build/test isolated
candidates before taking `/run/astro-deploy/lock` via `with-deploy-lock`.
Authorized privileged SSH is available with `ssh root@ubuntu-vm`. A failed
`sudo -n` as sawyer does not establish that privileged access is unavailable.
Hold it for the entire privileged transaction, including rollback. Never nest
it or recreate the lock. Root-only scripts in `deploy/` verify descriptor 9.
Node listens on 127.0.0.1:4311, as `astro-dunamismax-web`; systemd loads only
`/etc/astro-apps/dunamismax/web.env`. Publishing uses an independent identity.
Invoke deployed shell helpers with `bash`: release files are mode 0644.
Do not serve a checkout, source, credentials or the complete server build as
webroot. Keep immutable commit releases and atomic current symlinks.

Before first cutover: verify backup, rehearse real-source data in isolation,
freeze old publishing, reconcile counts and full-content SHA256. Keep legacy
PHP/MySQL/configuration/releases and installed backup timers intact until the
separate final-cleanup assignment. Remove obsolete implementation from this
repository; its Git history and retained release provide rollback sources.
Refuse rollback to MySQL after PostgreSQL writes diverge until reconciled.

## Verification and repository hygiene

Run `npm run check` (Astro plus TypeScript), `npm test`, `npm run build`, and
`bash deploy/rehearse.sh` for application/data changes. Rehearsal uses a disposable
`_test` database and tests real PostgreSQL privileges, CLI, scheduling and
HTTP outage/recovery. Run `bash -n` and `shellcheck -x deploy/*.sh` for shell.
Review browser layout at mobile/desktop widths and both color schemes when
changing presentation. Always run `git diff --check`.

Keep README focused on product/development, BUILD on verification/status,
and durable operational guidance under docs. Do not add extra agent/prompt
or continuity files. Do not invent completion or deployed outcomes.

## Git

Inspect status, branch and remotes first; pull main with `--ff-only` before
substantial work when clean. `origin` dual-pushes to GitHub and Codeberg.
Commit/push/deploy only with the owner’s authorization (the migration assignment
explicitly authorizes all three). Use the configured dunamismax author; stop
if user.email is not dunamismax-owned. Never force main or add assistant/co-author
attribution. Verify actual remote tips and production state after releasing.
