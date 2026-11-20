# Build plan and verification

## Phase 1 — SvelteKit stack migration (November 20, 2026)

Owner's direction, November 20, 2026: change the planned and implemented stack to
**SvelteKit 3 · Svelte 5 · TypeScript · Tailwind CSS 4 · PostgreSQL 18 + Drizzle
ORM · Node (adapter-node) · Caddy**. This replaces Astro as the web framework.
PostgreSQL, Drizzle, the schema/migrations, roles, publishing CLI, systemd
deployment and Caddy are retained unchanged.

Status: implemented, verified locally and released to production at `064bca5`
(owner-authorized, November 20, 2026). See the local record and the
[production release record](#production-release-record-november-20-2026-eastern).

### 1.1 Framework port

- [x] Pin SvelteKit 3.4.0, Svelte 5.58.1, Vite 8.3.8, @sveltejs/vite-plugin-svelte
  7.3.1, @sveltejs/adapter-node 6.0.5, svelte-check 4.7.8, Tailwind CSS 4.3.5 and
  @tailwindcss/vite 4.3.5 exactly; remove astro, @astrojs/node, @astrojs/check.
  Keep Node 24.22.3 / npm 11.19.1, TypeScript 6.0.3 strict, Drizzle and pg pins.
  Current SvelteKit 3 docs fetched with Context7 (config in `vite.config.ts`,
  `#lib` subpath import, hook types in `@sveltejs/kit/hooks`, `$app/tsconfig`).
- [x] Port pages to `src/routes/`: Home (`+page.server.ts`, honest 200 on outage),
  Blog index/pagination and post detail (`error(404|503)` → `+error.svelte`),
  prerendered About/Contact/Projects (`+page.ts`), `+server.ts` endpoints for
  feed.xml, healthz, robots.txt, manifest.webmanifest and css/site.css.
- [x] Root `+layout.svelte` reproduces head metadata, canonical/OG/Twitter tags,
  noindex rules, skip link, both navs with aria-current and the footer.
  `+layout.ts` sets `csr = false` (zero browser JavaScript); `app.html` has no
  inline style wrapper so the CSP stays unchanged.
- [x] `src/hooks.server.ts` replaces Astro middleware (same headers, 405,
  noindex, Retry-After) and adds a sanitized `handleError`. `bin/server.ts` now
  wraps `dist/web/handler.js`; the allowlist, CSP and cache policy are unchanged,
  so `/_app` and prerendered `__data.json` paths stay 404.
- [x] Tailwind CSS 4: `src/app.css` imports theme and utilities (no preflight)
  and the preserved stylesheet (`src/styles/site.css`) as the components layer;
  utilities are scanned only from `.svelte` files. The compiled stylesheet is a
  prerendered endpoint at the preserved `/css/site.css` URL with a content hash.
- [x] Keep `dist/cli/bin/*.js` entry points so `deploy/*.sh`, the systemd unit
  and the publishing wrapper work unchanged, and rollback to the retained Astro
  release stays valid (no schema change). Host contract names (`astro-*`) kept.
- [x] Update only this site's stack card and footer colophon to the new stack.
  Profile copy and other projects' Astro claims are unchanged (they describe
  other deployments and Stephen's experience; change only with evidence).

### 1.2 Release

- [x] Commit and push main; GitHub Actions Verify passed on Ubuntu for `10ee7d4`
  (check, db:check, unit, build, PG 18 rehearsal, audit).
- [x] On the VM: `deploy/prepare.sh`, backup/restore verification, then locked
  cutover. Evidence below. Open: the full host backup is blocked by the shared
  inventory (see the release record), which the ubuntu-vm-backup owner must update.

### Local verification record (November 20, 2026 Eastern)

Local implementation only; not a release record. macOS, Node 24.22.3 /
npm 11.19.1 (mise), Homebrew PostgreSQL 18.6.

- `npm ci` from the regenerated lockfile; `npm audit` 0 vulnerabilities.
- `npm run check`: svelte-kit sync, svelte-check 0 errors / 0 warnings, tsc clean.
- `npm run db:check`: drizzle-kit check passes, no schema changes.
- `npm test`: 6 unit tests pass. `APP_ENV=production npm run build` passes;
  prerendered pages contain no `<script>`, inline style or event handler.
- `bash deploy/rehearse.sh` on PostgreSQL 18.6: database suite passes; HTTP
  130 populated / 127 outage / 130 recovered (two new private paths:
  `/src/app.css`, `/_app/version.json`; `/dist/web/handler.js` replaces the
  Astro entry path).
- Browser comparison against live production (Astro `e1c292c` or later) using
  computed styles and box sizes of every body element: Home at 1280 px dark is
  identical except the intentionally changed dunamismax.com stack chips and
  footer colophon; About, Contact, Blog and 404 at 375 px light are identical.
- `bash -n` and `shellcheck -x deploy/*.sh` pass; `git diff --check` clean.

### Production release record (November 20, 2026 Eastern)

Owner-authorized. Separate from the local record above and from Phase 0.

- Source: `10ee7d4` (port), `62dbde1` (keep ignoring the retired `.astro/`
  cache so the VM checkout stays clean for prepare) and `064bca5` (log only
  unexpected server errors; SvelteKit 3 passes routine 404s to `handleError`).
  GitHub and Codeberg tips verified after each push; VM checkout fast-forwarded.
- Restore-drill compatibility: the host's `applications-verify` reinstalls with
  `npm ci --omit=dev --ignore-scripts` and runs `dist/cli/bin/server.js`
  (inventory entry unchanged). A local copy of the build with only production
  dependencies served /, /blog, /about, /feed.xml, /healthz and /css/site.css 200.
- Pre-release backup: the full `bin/backup --push` **failed** in application
  archiving because graceandfootnotes.com had just been redeployed by another
  session as SvelteKit (`build/`), while `config/applications.json` still
  expects its `dist/server/entry.mjs`. Not caused or changed here. In its place:
  `dunamismax-backup.service` (fresh dunamismax dump, isolated postgres-verify
  PASS) before each cutover, `restore check` 108 files / 0 failures, and
  `restore postgres-verify` 9 databases PASS.
- `deploy/prepare.sh` on the VM for both candidates: svelte-check 0/0, unit,
  build, PG 18 rehearsal 130 / 127 / 130 HTTP.
- Cutover 1 under `with-deploy-lock` at about 8:45 a.m. Eastern: `e1c292c` →
  `62dbde1`, checkpoint `/root/dunamismax-astro-20261120T134522Z`. Schema step
  no-op (`adopted: false`, 1 migration, 0 rows, empty-content digest);
  privilege report passed; candidate and public production 124 HTTP checks
  each (empty blog); Caddy validated and reloaded; no shared service restarted.
- Cutover 2 at about 8:48 a.m. Eastern: `62dbde1` → `064bca5`, checkpoint
  `/root/dunamismax-astro-20261120T134852Z`; same schema/privilege/124-check
  results. No `Request failed` lines after it, versus 20 from 404 checks before.
- Independent checks: current → `064bca5`; astro-dunamismax active,
  ExecMainStatus 0, user astro-dunamismax-web, only web.env; 127.0.0.1:4311 and
  PG 127.0.0.1:5432 loopback-only; no failed units; `dunamismax-posts list`
  works. Public HTTPS: CSP/nosniff/referrer headers, no-store, no `<script>`,
  /healthz ok, /css/site.css cached 300 s, www 301 preserves path/query,
  Let's Encrypt certificate valid to 2027-01-04, all five host sites 200.
- Rollback: `rollback.sh CHECKPOINT --check` passed under the lock for both
  checkpoints; Astro `e1c292c` remains retained and schema-compatible. No
  rollback was performed.
- Post-release: `dunamismax-backup.service` archive verified (postgres-verify
  PASS). A full host snapshot with `applications-verify` of `064bca5` is pending
  the shared-inventory fix above.

## Phase 0 — Astro/PostgreSQL stack alignment (first)

Historical: superseded as the framework direction by Phase 1. The Drizzle
adoption below remains current and in production.

Owner's final direction, November 2, 2026 Eastern: retain Astro and PostgreSQL.
This replaces the Next.js rewrite and the subsequently withdrawn SQLite plan.
Python and Swift are used only when this project actually needs them or the
owner requests them.

Status: Drizzle adoption is implemented, verified locally and released to
production at `e1c292c` (owner-authorized, November 2, 2026). See the
[local verification record](#local-verification-record-november-2-2026-eastern)
and [production release record](#production-release-record-november-2-2026-eastern).
The former open item (a Caddy Cloudflare DNS-challenge assumption) was closed by
the owner's clarification on November 2, 2026: no such setup is part of the stack.

### 0.1 Preserve the working application and establish the baseline

- [x] Read AGENTS, README and docs/architecture.md, docs/content.md,
  docs/production.md, docs/migration.md and docs/portfolio.md. Inspect status,
  branch, identity and remotes; work on main only and pull --ff-only when clean.
- [x] Run the current gates below and capture actual source/runtime evidence.
  Do not assume production has no posts from the October zero-row import.
- [x] Retain Astro 7.4.2, @astrojs/node 11.1.9 standalone, strict TypeScript
  6.0.3, Node 24.22.3/npm 11.19.1, existing pages/components/CSS and systemd
  deployment unless a verified compatibility issue requires a coordinated update.
  Pin exact dependencies and use npm ci. Fetch current Context7 documentation
  before selecting compatible Drizzle ORM/Kit versions and migration APIs.
- [x] Keep the current split: About/Contact/Projects prerender, while Home,
  blog/detail and RSS query PostgreSQL on demand. This database-backed blog
  needs SSR; converting it to static output would break live publication.
  Purely static future projects can be served directly by Caddy.
- [x] Preserve all routes, eight project cards/order/anchors, approved copy,
  metadata, RSS, canonical origin, contact links, skip links, aria-current,
  dark/light CSS and mobile layout. Keep zero browser scripts/inline styles and
  the existing CSP. No React island, Tailwind or shadcn/ui is needed for this
  migration; use them only for a future UI requirement. No nonce/rendering
  changes from the cancelled Next.js plan should be implemented.

### 0.2 Adopt Drizzle with the existing PostgreSQL database

The retained part of the common stack still calls for a TypeScript schema and
reviewed migrations. The current app uses pg directly and database/schema.sql;
Drizzle adoption is the remaining implementation work, not a framework rewrite.

- [x] Add src/db/schema.ts, server/operator connection modules, drizzle.config.ts
  and committed drizzle/ SQL migrations/snapshots. Use Drizzle's node-postgres
  driver with the existing lazy bounded pool, timeouts and sanitized errors.
  No hosted database, new production database or SQLite/libSQL driver is needed.
- [x] Model app.posts and app.public_posts from database/schema.sql. Preserve
  bigint identity/sequence, C-collated unique slug, constraints, publication
  index, title/excerpt Unicode limits, body byte limit, statuses and timestamptz
  instants. Preserve full timestamp precision and avoid unsafe bigint coercion.
- [x] Preserve the owner-controlled security_barrier publication view, filtered
  by published status and PostgreSQL CURRENT_TIMESTAMP. Web queries the view
  only, never app.posts with an application-only visibility filter. Maintain
  schema privileges, sequence permissions and role-escalation denials using
  reviewed custom SQL where the schema generator cannot express them.
- [x] Retain database dunamismax, schema app, NOLOGIN owner dunamismax_owner,
  read-only dunamismax_web, bounded dunamismax_publishing and operator-only
  dunamismax_migration. Web cannot SELECT the private table or write/DDL;
  publisher has SELECT/INSERT/UPDATE and required sequence use, not DELETE/DDL.
  Keep the migration journal inaccessible to web and publishing identities.
- [x] Rehearse fresh installation and baseline adoption on nonempty disposable
  PostgreSQL restores. Compare schema, ACLs, every stored field, row counts,
  IDs/sequence and ordered full-content SHA256 before recording a baseline as
  applied. Scope introspection to this app, review the SQL and prove repeated
  migrations are no-ops. No blind push/reset/drop, replay of CREATE against
  existing data, reimport of MySQL or generation from guessed production state.
- [x] Make generated migrations the authoritative schema evolution path;
  adapt bin/schema.ts and database/schema.sql so there are not two divergent
  schema sources. Migration credentials remain operator-only, outside builds
  and web startup. Keep reviewed raw SQL for PostgreSQL-specific constraints,
  grants and views when necessary; ORM adoption must not weaken boundaries.

### 0.3 Adapt data access, publishing and verification in place

| Existing file / surface | Required work |
| --- | --- |
| src/lib/posts.ts | Use Drizzle view queries; preserve ordering by published_at/id descending, limits, offsets, lazy pool and deadlines |
| src/lib/publisher.ts | Port transactions/row locks to Drizzle; preserve create/edit/validate/publish/schedule/unpublish semantics |
| bin/posts.ts, src/lib/credentials.ts | Keep the TypeScript CLI/interface and independent protected config; no Python rewrite is needed |
| bin/schema.ts, bin/verify-database.ts | Apply reviewed Drizzle migrations separately; retain actual PG permission-denial tests |
| bin/migrate-data.ts | Historical MySQL import is not the new migration; retain/remove only after checking recovery needs |
| tests/database.ts, deploy/rehearse.sh | Exercise fresh/adopted schemas, real role denials, SQL binding, publishing lifecycle and populated/outage/recovery HTTP |
| package.json, tsconfig.cli.json, Makefile, CI | Include schema/migration modules, exact pins, explicit checks and isolated migration rehearsals |
| deploy/prepare.sh, cutover.sh, lib.sh, rollback.sh, posts-wrapper.sh | Adapt schema/tool artifact paths only as required; retain locks, expected-current guard, independent credentials and rollback |

- [x] Keep draft-by-default creation, immutable slugs and edit preserving
  status/date. Validate writes nothing; publish uses database time; scheduling
  requires explicit offset and future database time; unpublish retains date.
  Keep plain text escaping and both RSS encoding layers, Unicode/byte limits,
  protected body-file/stdin handling and private list/show output.
- [x] Preserve database-clock scheduling without rebuild, restart, timer or
  cache invalidation. Do not bake or persistently cache post data. Test due-time
  publication and immediate unpublish on list/count/detail/RSS.
- [x] Keep bin/server.ts as the uniform method/header/path boundary before
  Astro static/SSR handling. Preserve GET/HEAD-only/405, private-path 404/noindex,
  honest home 200 fallback and blog/post/feed 503 with Retry-After: 60/no-store.
- [x] Keep content and credentials out of build artifacts/logs. No production
  database credentials during build; build and DB-independent pages/health
  must work with the database unavailable. Missing production config fails
  clearly; only explicit local/test configuration allows empty preview.
- [x] Run current check/unit/build and isolated PG rehearsal after application
  changes. Expand tests for Drizzle baseline replay and unchanged privileges.
  Review browser at 320/375/768/1440 in both schemes if presentation changes.
  Run bash syntax/ShellCheck for edited shell and always git diff --check.

### 0.4 Keep the existing self-hosted deployment and backup model

- [x] Keep the site-scoped systemd Node service on 127.0.0.1:4311, native PG
  loopback-only, existing Caddy fragment/custom binary and protected per-role
  env files. Containerization/Compose is optional, not required work. If ever
  chosen, document loopback-only port publishing and safe native-PG connectivity
  before changing it; never expose PG to make a container connection work.
- [x] Build/test isolated candidates before taking the existing shared deployment
  lock. Hold descriptor 9 for the full privileged cutover/rollback. Exclude
  publishing while migrating; apply only additive, rollback-compatible schema
  changes. Keep immutable commit releases and atomic current pointers. Do not
  restart shared PostgreSQL/Caddy or modify sibling apps.
- [x] Verify DNS and TLS. *(Owner, November 2, 2026: domains are on Cloudflare
  with DNS-only records the owner manages himself, pointing at the server's
  public IP; Caddy is the reverse proxy and obtains its own Let's Encrypt
  certificates. No Cloudflare DNS challenge, Caddy DNS plugin, token or proxy
  mode is part of the stack.)* Verified November 2: dunamismax.com/www resolve
  directly to the origin, and origin TLS is a valid Let's Encrypt certificate
  (expires 2027-01-04). Caddy was not modified here.
- [x] Retain nightly pg_dump backups, encrypted off-server copies and isolated
  restore checks including data, roles, ACLs, Drizzle journal and app release.
  Confirm actual backup/restore evidence before a release. Litestream/R2 SQLite
  replication, WAL/busy_timeout settings and SQLite files are out of scope.
- [x] Rehearse code rollback against newer PG writes. Do not restore old database
  dumps or divergent MySQL over authoritative data; stop for reconciliation if
  an old release is incompatible. Retain existing backup timers/recovery sources.

### 0.5 Conditional technologies and completion

- [x] Add no Python or Swift code/toolchain here unless a concrete project need
  or explicit request exists. Existing TypeScript publishing/maintenance tools
  remain TypeScript. Preserve factual portfolio references to other projects'
  Python work; these are not dependencies of this site.
- [x] If a future native Apple app is needed/requested, use Swift/SwiftUI and
  HTTPS Astro endpoints, with SwiftData or GRDB only for actual local storage
  needs. Record Swift version, minimum OS targets, observation conventions and
  a verified xcodebuild/test command then. Do not scaffold a native app now.
- [x] If a future Python utility is needed/requested, use uv and Ruff, with
  Typer/httpx/Pydantic only as useful and systemd timers for recurring jobs.
  It must use project-authorized PG credentials or an API, not an SQLite file.
- [x] Astro Actions/forms, API endpoints for clients, React islands, Tailwind/
  shadcn, Better Auth and AI SDK remain available when a real feature needs
  them. Current portfolio has no public writes, accounts, payments, AI or native
  client. Do not install these speculatively or weaken the read-only surface.
- [x] Update README/architecture/content/production and AGENTS to the delivered
  Drizzle paths/commands; public stack claims change only with verified evidence.
  No changes to sibling stack claims based on a shared prompt. Keep old migration
  acceptance dated and separate from new local checks/live release acceptance.
- [x] Mark local completion only after actual checks. Production deployment
  requires release authorization; this docs assignment does not deploy. For a
  release record commit, verified remote tips, service/listener, data/privileges,
  public HTTP/privacy/TLS, backup/restore and rollback evidence separately.

### Local verification record (November 2, 2026 Eastern)

Local implementation only; not a release record. Toolchain Node 24.22.1 /
npm 11.19.1 (mise), Homebrew PostgreSQL 18.6 and 17.11 on macOS.

- Baseline before changes: check 0 errors, 6 unit tests, production build, and
  rehearsal (database suite; HTTP 115 populated / 112 outage / 115 recovered).
- Production, read-only over authorized root SSH: active release `cfade65`,
  `app.posts` 0 rows, sequence unused, no `drizzle` schema, PostgreSQL 18.6.
  Owner default privileges in app grant publishing SELECT/INSERT/UPDATE on new
  relations (including the existing view) — hence the separate journal schema.
  The normalized catalog of schema app was captured as
  `database/baseline-catalog.json` (read-only transaction).
- Selected stable drizzle-orm 0.45.4 / drizzle-kit 0.31.11 (1.0 still RC) after
  Context7 docs. npm override pins drizzle-kit's nested esbuild; audit clean.
- Generated `drizzle/0000_baseline.sql`; removed CREATE SCHEMA (host bootstrap)
  and appended the reviewed grants. `drizzle-kit check` passes and generate
  reports no drift (`npm run db:check`); an injected schema change fails it.
- Rehearsal on PostgreSQL 18 and 17, with a fixture mirroring production roles,
  database/schema ACLs and default privileges: fresh install equals the
  production catalog; repeated runs are no-ops; a populated pre-Drizzle database
  (MySQL-import fixture, microsecond instants, advanced sequence) and its
  pg_dump/pg_restore copy were adopted with identical catalog, rows, IDs,
  sequence and full-content SHA256; a drifted ACL is refused with no journal
  created. Web/publisher journal access and all prior role denials fail as
  expected. Drizzle web reads, publisher lifecycle, SQL binding, due-time
  publication and immediate unpublish (count/detail/latest), timestamp
  preservation on edit/unpublish and parameter-free CLI errors pass. HTTP
  124 populated / 121 outage / 124 recovered (new private-path checks).
- No presentation change, so browser review was not repeated. Shell scripts:
  only rehearse.sh exports PGBIN; bash -n and ShellCheck pass.

### Production release record (November 2, 2026 Eastern)

Owner-authorized release of `e1c292c7c999f3dc96f54384fd9350e008339a18`,
replacing `cfade65`. Separate from the local record above and from the October
migration acceptance.

- Source: main pushed; GitHub and Codeberg tips both verified at `e1c292c`.
  VM checkout fast-forwarded; `deploy/prepare.sh` built the isolated candidate
  (check 0 errors, 6 unit tests, build, PG 18 rehearsal 124/121/124 HTTP);
  `db:check` and `npm audit` clean in the candidate.
- Pre-release host backup `f650974` (pushed, both backup remotes verified),
  `restore check` 95 files / 0 failures, `restore postgres-verify` 7 databases.
- Cutover under `with-deploy-lock` (exclusive; publishing excluded) at about
  3:18 p.m. Eastern, checkpoint `/root/dunamismax-astro-20261102T201802Z`.
  Schema step: `adopted: true`, 1 migration, 0 rows, digest unchanged.
  Privilege report passed, including web/publisher denial on the journal.
  Candidate service and public production each passed 118 HTTP checks; the
  www redirect check passed. No shared service was restarted (Caddy reload).
- Independent checks: current → `e1c292c`; astro-dunamismax active, ExecMainStatus
  0, user astro-dunamismax-web, only web.env; 127.0.0.1:4311 and PG
  127.0.0.1:5432 loopback-only; no failed units. Journal holds one row whose hash
  equals SHA256 of `drizzle/0000_baseline.sql`; `drizzle` schema owner-only;
  app catalog still equals `database/baseline-catalog.json`. The installed
  `dunamismax-posts list` works through Drizzle. HTTPS: CSP and no-store
  present, /healthz ok, www 301 preserves path/query, all five host sites 200.
- Rollback: `rollback.sh CHECKPOINT --check` passed under the lock. The retained
  `cfade65` release, run temporarily on 127.0.0.1:4323 with only web.env against
  the adopted live database, passed its own 109-check suite; locally it passed
  115 populated checks against a database migrated and written by `e1c292c`.
  No production rollback was performed.
- Post-release host backup `44a3cac` pushed; `restore check` 95 / 0 failures,
  `postgres-verify` 7 databases (dunamismax including the journal schema), and
  `applications-verify` served `e1c292c` from restored PostgreSQL with HTTP 200.
  A later unrelated snapshot `3d1d352` is the tip of both backup remotes.

### References for implementation

Recheck current, version-compatible docs with Context7; avoid stale CLI examples
or introspection instructions for another SQL dialect.

- [Migrating to SvelteKit 3](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [SvelteKit adapter-node](https://svelte.dev/docs/kit/adapter-node)
- [Tailwind CSS: disabling preflight](https://tailwindcss.com/docs/preflight)
- [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/) (historical)
- [Drizzle with existing PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-existing)
- [Drizzle schema introspection](https://orm.drizzle.team/docs/drizzle-kit-pull)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)

## Existing Astro/PostgreSQL verification (historical acceptance)

Astro/strict TypeScript/PostgreSQL replaces this repository’s PHP implementation.
Preserved: approved portfolio, routes, CSS/icon, metadata, RSS/plain text,
pagination, zero browser scripts, draft privacy and database outage behavior.
About/Contact/Projects prerender; PostgreSQL remains authoritative for posts.

Production was verified at release `c93aaec` on October 22, 2026 Eastern. The public
109-check HTTP suite, live database privileges, guarded rollback check and
post-cutover encrypted backup/restore verification passed. Backup snapshot
`12e8d86` was verified on both backup remotes. See the acceptance record below.

## Gates

```sh
npm ci
npm run check
npm run db:check
npm test
APP_ENV=production npm run build
bash deploy/rehearse.sh
for f in deploy/*.sh; do bash -n "$f"; done
shellcheck -x deploy/*.sh
git diff --check
```

On macOS set PGBIN to the installed PostgreSQL bin directory and LC_ALL to a
valid locale (for example en_US.UTF-8) for rehearsal.
Unit tests port meaningful legacy escaping, Unicode, dates, credential and RSS
cases. PostgreSQL tests cover schema reapplication, real role restrictions,
SQL binding, draft/future visibility, scheduling without builds, transactional
CLI create/edit/validate/publish/schedule/unpublish and failed input/config.
HTTP checks cover preserved content/project counts, landmarks, metadata, methods,
HEAD, private paths, pagination, RSS limits and outages/recovery against the
compiled server. Browser QA covers widths 320/375/768/1440 in light/dark mode.
The previous implementation passed its 249 checks before replacement.

Real source migration, production cutover, remote tips, backup/restore and
rollback verification results belong in [migration acceptance](docs/migration.md).
Do not claim those deployment gates complete based on local fixtures.
