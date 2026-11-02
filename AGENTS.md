# Repository operating rules

Read this file, `README.md`, `BUILD.md`, and task-relevant `docs/` before changes.
Read `/home/sawyer/github/ubuntu-vm-backup/docs/astro-migration.md` and any
successor shared host contract before deployment. The owner's final November 2,
2026 direction retains Astro and PostgreSQL. BUILD Phase 0 Drizzle adoption was
released to production at `e1c292c` on November 2, 2026; see BUILD for evidence
and the remaining host-workflow item. The Next.js and SQLite proposals are superseded. Use Context7
for current library/API guidance.

## Git rules (owner's standing instructions)

These override any other workflow described in this repository or by your tools.

- Work on `main` only. Never create branches, worktrees or pull requests.
  Commit directly to `main` and push with `git push origin main`. `origin`
  pushes to both GitHub and Codeberg, so one push updates both.
- No AI attribution anywhere: no `Co-Authored-By` trailers, no "Generated
  with ..." lines, and no crediting Claude, Anthropic, ChatGPT, OpenAI or any
  AI tool in commit messages, tags, release notes, code, comments or file
  headers. Use the owner's configured git identity and never change git config.
  Content the project deliberately publishes about AI, such as a reader-facing
  disclosure, is not attribution.
- After committing, push `main` right away, at the latest before the session
  ends. Before committing, run the project's checks, review `git status` for
  stray files, and never commit what `.gitignore` excludes.

## Product and content

This is Stephen Sawyer’s (`dunamismax`) personal portfolio and blog. Preserve
approved copy, branding, public URLs, metadata, project anchors and contact
links. Keep other project stack/status claims grounded in their actual runtime
and [portfolio evidence](docs/portfolio.md). The final host migration authorizes factual stack descriptions to reflect
verified Astro/TypeScript/PostgreSQL deployments. Preserve unrelated profile copy. Do not publish private sources, addresses, keys,
backup locations or drafts. No public admin, forms, accounts, tracking or scripts.

## Implementation

- Stack: Astro + strict TypeScript + PostgreSQL + Drizzle (drizzle-orm 0.45.4,
  drizzle-kit 0.31.11, node-postgres). `src/db/schema.ts` is the schema source;
  `drizzle/` holds reviewed migrations (grants as custom SQL). Change the schema
  with `npx drizzle-kit generate`, review the SQL, then `npm run db:check`.
  `bin/schema.ts` is the only applier; it adopts a pre-Drizzle database only when
  its catalog equals `database/baseline-catalog.json`. No framework rewrite.
- Python and Swift are conditional on a real project need or explicit request.
  Keep existing TypeScript operator tools; do not convert them to Python or
  scaffold a native app. Future requested Apple clients use Swift/SwiftUI and
  Astro HTTPS APIs; record actual Swift/OS/build requirements when applicable.
  Future needed Python tools use uv/Ruff and only useful libraries/timers.
- Keep existing vanilla CSS and zero browser JavaScript. React islands,
  Tailwind/shadcn, Astro Actions, Better Auth and AI SDK are optional only for
  needed features; no new public API/forms/accounts in this assignment.
- Keep current systemd deployment. Containers/Compose are optional; no new
  proxy, SQLite database or Litestream service. Static-only projects can use
  Caddy directly; this live database-backed blog retains Node standalone SSR.

- Current runtime: Astro 7.4.2 / Node adapter 11.1.9, TypeScript 6.0.3 strict with
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

## Deployment layout

| Item | Current convention to retain |
| --- | --- |
| Runtime | deploy/astro-dunamismax.service, astro-dunamismax-web user; Node standalone |
| Listener | 127.0.0.1:4311; candidate 4323 after checking availability |
| Caddy | /etc/caddy/Caddyfile imports /etc/caddy/sites/dunamismax.com.caddy; template deploy/Caddyfile |
| PostgreSQL | Native loopback service; database dunamismax, schema app; independent owner/web/publishing/migration roles |
| Credentials | /etc/astro-apps/dunamismax/{web,publishing,migration}.env, one per identity |
| Releases | /srv/www/dunamismax.com/releases/<commit>, atomic current; shared descriptor-9 deployment lock |
| ORM | src/db/schema.ts, drizzle.config.ts, drizzle/ migrations; journal drizzle.__drizzle_migrations is owner-only; production adopted at e1c292c |

Read docs/production.md before changes. Retain verified nightly pg_dump and
protected off-server restore coverage. Caddy Cloudflare DNS challenge uses a
zone-scoped Caddy-only token; proxied DNS uses Full (strict). Check shared host
prerequisites without replacing its Caddy binary or restarting shared services.

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

Before future schema/deployment cutover: verify backup/restore, rehearse nonempty
data in isolation, exclude concurrent publishing, and reconcile counts and
full-content SHA256. Keep previous Astro releases and installed backup timers.
Confirm legacy retention in the current shared host contract rather than
inferring current service state from old acceptance notes. Remove obsolete
checkout code only after confirming recovery needs. Code rollback must preserve
newer PostgreSQL writes; refuse rollback to divergent MySQL until reconciled.

## Verification and repository hygiene

Run `npm run check` (Astro plus TypeScript), `npm run db:check`, `npm test`, `npm run build`, and
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
Commit/push/deploy only with the owner’s authorization. This planning assignment
does not authorize a production release. Use the configured dunamismax author; stop
if user.email is not dunamismax-owned. Never force main or add assistant/co-author
attribution. Verify actual remote tips and production state after releasing.
