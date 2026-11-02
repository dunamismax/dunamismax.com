# Build plan and verification

## Phase 0 — Astro/PostgreSQL stack alignment (first; pending)

Owner's final direction, November 2, 2026 Eastern: retain Astro and PostgreSQL.
This replaces the Next.js rewrite and the subsequently withdrawn SQLite plan.
Python and Swift are used only when this project actually needs them or the
owner requests them. This session updates documentation only; the next
implementer completes the remaining alignment below. No application, dependency,
database or deployment change is recorded by this plan.

### 0.1 Preserve the working application and establish the baseline

- [ ] Read AGENTS, README and docs/architecture.md, docs/content.md,
  docs/production.md, docs/migration.md and docs/portfolio.md. Inspect status,
  branch, identity and remotes; work on main only and pull --ff-only when clean.
- [ ] Run the current gates below and capture actual source/runtime evidence.
  Do not assume production has no posts from the October zero-row import.
- [ ] Retain Astro 7.4.2, @astrojs/node 11.1.9 standalone, strict TypeScript
  6.0.3, Node 24.22.1/npm 11.19.1, existing pages/components/CSS and systemd
  deployment unless a verified compatibility issue requires a coordinated update.
  Pin exact dependencies and use npm ci. Fetch current Context7 documentation
  before selecting compatible Drizzle ORM/Kit versions and migration APIs.
- [ ] Keep the current split: About/Contact/Projects prerender, while Home,
  blog/detail and RSS query PostgreSQL on demand. This database-backed blog
  needs SSR; converting it to static output would break live publication.
  Purely static future projects can be served directly by Caddy.
- [ ] Preserve all routes, eight project cards/order/anchors, approved copy,
  metadata, RSS, canonical origin, contact links, skip links, aria-current,
  dark/light CSS and mobile layout. Keep zero browser scripts/inline styles and
  the existing CSP. No React island, Tailwind or shadcn/ui is needed for this
  migration; use them only for a future UI requirement. No nonce/rendering
  changes from the cancelled Next.js plan should be implemented.

### 0.2 Adopt Drizzle with the existing PostgreSQL database

The retained part of the common stack still calls for a TypeScript schema and
reviewed migrations. The current app uses pg directly and database/schema.sql;
Drizzle adoption is the remaining implementation work, not a framework rewrite.

- [ ] Add src/db/schema.ts, server/operator connection modules, drizzle.config.ts
  and committed drizzle/ SQL migrations/snapshots. Use Drizzle's node-postgres
  driver with the existing lazy bounded pool, timeouts and sanitized errors.
  No hosted database, new production database or SQLite/libSQL driver is needed.
- [ ] Model app.posts and app.public_posts from database/schema.sql. Preserve
  bigint identity/sequence, C-collated unique slug, constraints, publication
  index, title/excerpt Unicode limits, body byte limit, statuses and timestamptz
  instants. Preserve full timestamp precision and avoid unsafe bigint coercion.
- [ ] Preserve the owner-controlled security_barrier publication view, filtered
  by published status and PostgreSQL CURRENT_TIMESTAMP. Web queries the view
  only, never app.posts with an application-only visibility filter. Maintain
  schema privileges, sequence permissions and role-escalation denials using
  reviewed custom SQL where the schema generator cannot express them.
- [ ] Retain database dunamismax, schema app, NOLOGIN owner dunamismax_owner,
  read-only dunamismax_web, bounded dunamismax_publishing and operator-only
  dunamismax_migration. Web cannot SELECT the private table or write/DDL;
  publisher has SELECT/INSERT/UPDATE and required sequence use, not DELETE/DDL.
  Keep the migration journal inaccessible to web and publishing identities.
- [ ] Rehearse fresh installation and baseline adoption on nonempty disposable
  PostgreSQL restores. Compare schema, ACLs, every stored field, row counts,
  IDs/sequence and ordered full-content SHA256 before recording a baseline as
  applied. Scope introspection to this app, review the SQL and prove repeated
  migrations are no-ops. No blind push/reset/drop, replay of CREATE against
  existing data, reimport of MySQL or generation from guessed production state.
- [ ] Make generated migrations the authoritative schema evolution path;
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

- [ ] Keep draft-by-default creation, immutable slugs and edit preserving
  status/date. Validate writes nothing; publish uses database time; scheduling
  requires explicit offset and future database time; unpublish retains date.
  Keep plain text escaping and both RSS encoding layers, Unicode/byte limits,
  protected body-file/stdin handling and private list/show output.
- [ ] Preserve database-clock scheduling without rebuild, restart, timer or
  cache invalidation. Do not bake or persistently cache post data. Test due-time
  publication and immediate unpublish on list/count/detail/RSS.
- [ ] Keep bin/server.ts as the uniform method/header/path boundary before
  Astro static/SSR handling. Preserve GET/HEAD-only/405, private-path 404/noindex,
  honest home 200 fallback and blog/post/feed 503 with Retry-After: 60/no-store.
- [ ] Keep content and credentials out of build artifacts/logs. No production
  database credentials during build; build and DB-independent pages/health
  must work with the database unavailable. Missing production config fails
  clearly; only explicit local/test configuration allows empty preview.
- [ ] Run current check/unit/build and isolated PG rehearsal after application
  changes. Expand tests for Drizzle baseline replay and unchanged privileges.
  Review browser at 320/375/768/1440 in both schemes if presentation changes.
  Run bash syntax/ShellCheck for edited shell and always git diff --check.

### 0.4 Keep the existing self-hosted deployment and backup model

- [ ] Keep the site-scoped systemd Node service on 127.0.0.1:4311, native PG
  loopback-only, existing Caddy fragment/custom binary and protected per-role
  env files. Containerization/Compose is optional, not required work. If ever
  chosen, document loopback-only port publishing and safe native-PG connectivity
  before changing it; never expose PG to make a container connection work.
- [ ] Build/test isolated candidates before taking the existing shared deployment
  lock. Hold descriptor 9 for the full privileged cutover/rollback. Exclude
  publishing while migrating; apply only additive, rollback-compatible schema
  changes. Keep immutable commit releases and atomic current pointers. Do not
  restart shared PostgreSQL/Caddy or modify sibling apps.
- [ ] Verify Caddy's Cloudflare DNS plugin, zone-scoped Caddy-only token and
  valid origin TLS; proxied DNS uses Full (strict). Missing shared-host support
  belongs in the owning host workflow; do not replace shared Caddy here.
- [ ] Retain nightly pg_dump backups, encrypted off-server copies and isolated
  restore checks including data, roles, ACLs, Drizzle journal and app release.
  Confirm actual backup/restore evidence before a release. Litestream/R2 SQLite
  replication, WAL/busy_timeout settings and SQLite files are out of scope.
- [ ] Rehearse code rollback against newer PG writes. Do not restore old database
  dumps or divergent MySQL over authoritative data; stop for reconciliation if
  an old release is incompatible. Retain existing backup timers/recovery sources.

### 0.5 Conditional technologies and completion

- [ ] Add no Python or Swift code/toolchain here unless a concrete project need
  or explicit request exists. Existing TypeScript publishing/maintenance tools
  remain TypeScript. Preserve factual portfolio references to other projects'
  Python work; these are not dependencies of this site.
- [ ] If a future native Apple app is needed/requested, use Swift/SwiftUI and
  HTTPS Astro endpoints, with SwiftData or GRDB only for actual local storage
  needs. Record Swift version, minimum OS targets, observation conventions and
  a verified xcodebuild/test command then. Do not scaffold a native app now.
- [ ] If a future Python utility is needed/requested, use uv and Ruff, with
  Typer/httpx/Pydantic only as useful and systemd timers for recurring jobs.
  It must use project-authorized PG credentials or an API, not an SQLite file.
- [ ] Astro Actions/forms, API endpoints for clients, React islands, Tailwind/
  shadcn, Better Auth and AI SDK remain available when a real feature needs
  them. Current portfolio has no public writes, accounts, payments, AI or native
  client. Do not install these speculatively or weaken the read-only surface.
- [ ] Update README/architecture/content/production and AGENTS to the delivered
  Drizzle paths/commands; public stack claims change only with verified evidence.
  No changes to sibling stack claims based on a shared prompt. Keep old migration
  acceptance dated and separate from new local checks/live release acceptance.
- [ ] Mark local completion only after actual checks. Production deployment
  requires release authorization; this docs assignment does not deploy. For a
  release record commit, verified remote tips, service/listener, data/privileges,
  public HTTP/privacy/TLS, backup/restore and rollback evidence separately.

### References for implementation

Recheck current, version-compatible docs with Context7; avoid stale CLI examples
or introspection instructions for another SQL dialect.

- [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
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
npm test
APP_ENV=production npm run build
bash deploy/rehearse.sh
for f in deploy/*.sh; do bash -n "$f"; done
shellcheck -x deploy/*.sh
git diff --check
```

On macOS set PGBIN to the installed PostgreSQL bin directory for rehearsal.
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
