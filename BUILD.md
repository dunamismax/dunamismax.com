# Build plan and verification

## Phase 0 — Unified stack rewrite (first; not started)

Requested November 2, 2026 Eastern. Complete this phase before any further
feature or presentation work. This implementation handoff changes documentation
only. No Next.js implementation, dependency change,
database change, container deployment or production verification is recorded here.
The Astro acceptance record below remains historical evidence.

### 0.1 Establish the baseline and prove the difficult boundaries

- [ ] Read `AGENTS.md`, `README.md`, this plan and `docs/{architecture,content,
  production,migration,portfolio}.md`. Work on `main` only, without a branch,
  worktree or PR. Inspect status/remotes/identity; pull `--ff-only` when clean.
- [ ] Capture a fresh baseline from the current implementation using the gates
  below, the route table in README and `tests/http.ts`. Do not assume the blog
  is still empty because the October migration moved zero rows. Review current
  source and, when release work is authorized, actual production independently.
- [ ] Fetch current stable documentation with Context7. Select compatible exact
  Next.js, React, Tailwind, shadcn CLI/component and Drizzle versions; record
  them with the lockfile. Keep Node 24.22.1 / npm 11.19.1 unless verified version
  requirements require a coordinated, documented toolchain update. Do not copy
  a canary example's version or use unpinned `latest` dependencies.
- [ ] Before the full port, prototype a built standalone server with strict CSP,
  a working framework asset, a real 404 and a database-outage **503**. Next.js
  streaming can commit 200 before an error; `error.tsx` alone is not a 503
  implementation. Choose a supported response boundary that decides status and
  headers before streaming; test failures during rendering as well as initial
  connection failure. Do not accept a preflight/read race that hides an outage.
- [ ] Prove the chosen Node/Next response boundary also covers static assets,
  HEAD, denied methods and private paths. Retire the Astro-specific handler in
  `bin/server.ts`; do not copy its import of `dist/server/entry.mjs` or assume a
  custom Next server is compatible with generated standalone output.

### 0.2 Replace the framework and styling without redesigning the site

- [ ] Replace Astro and its adapter/checker with Next.js App Router and React,
  strict TypeScript, Tailwind and only useful shadcn/ui primitives (for example
  cards, buttons rendered as links, and pagination). Keep components local and
  styled to the existing design. No stock dashboard, new theme switcher or
  client state is required. Use Server Components by default.
- [ ] Add `next.config.ts` with `output: 'standalone'`; use the Node runtime,
  without Vercel services, edge-only deployment assumptions or hosted storage.
  Keep both strictness flags; replace Astro-generated types/configuration and
  include Next's generated types. Make `check` perform explicit type/lint checks
  supported by the chosen version; do not rely on the build for all checks.
- [ ] Port the following inventory. Paths on the right are proposed new source
  locations, not files already delivered by this planning change.

  | Existing source | Rewrite destination / contract |
  | --- | --- |
  | `src/layouts/Layout.astro`, `NavLink.astro` | `src/app/layout.tsx`, React navigation/footer and metadata helpers; preserve title suffix, canonical, OG/Twitter, feed/icon/manifest links, skip link and `aria-current` |
  | `src/pages/{index,about,contact,projects}.astro` | `src/app/page.tsx` and corresponding route `page.tsx` files; same approved copy, eight projects/order, contact links and anchors |
  | `src/components/projects/*.astro`, `LatestCard.astro` | React components; shared home/projects content and honest unknown-count fallback |
  | `src/pages/blog/{index,[slug]}.astro` | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`; ten posts/page, strict pagination, true private/missing 404 |
  | `src/pages/feed.xml.ts` | `src/app/feed.xml/route.ts`; RSS 2.0, twenty entries, both escaping layers |
  | `src/pages/{robots.txt,manifest.webmanifest,healthz}.ts` | Exact public route handlers and content types; DB-independent health remains `{"status":"ok"}` |
  | `src/pages/404.astro`, `src/components/Error.astro` | Shared accessible React errors plus status-aware response handling; no canonical on errors, `noindex`, correct 404/503 |
  | `public/css/site.css`, `public/icon.svg` | Tailwind/global theme plus compatibility stylesheet at `/css/site.css`; retain icon URL and avoid duplicate/conflicting resets |
  | `src/lib/{text,rss,validation,config,credentials}.ts` | Retain tested behavior; adapt imports/configuration only as needed, with secrets confined to server/operator modules |

- [ ] Map existing CSS tokens, layout, focus styles, wrapping and media-query
  color scheme into Tailwind/global CSS. Keep system fonts, dark/light visuals,
  responsive navigation and readable posts. Preserve `/css/site.css` as a useful
  stylesheet URL even if Next emits additional hashed CSS. No inline style
  attributes or third-party font/script/CDN requests are needed.
- [ ] Replace the old zero-script assertion with an explicit framework-only
  allowance. Implement fresh request nonces for Next/React scripts and any
  framework style elements, preserving the remaining security headers. Do not
  add production `unsafe-inline`/`unsafe-eval`. The nonce strategy requires
  request-rendered HTML, including DB-independent About/Contact/Projects;
  static prerendering is no longer mandatory. See `docs/architecture.md`.
- [ ] Ensure posts remain escaped text, including HTML/Markdown-like input;
  render paragraphs/line breaks with React text nodes or the existing audited
  escaping path. Do not pass raw stored bodies to `dangerouslySetInnerHTML`.
  Retain RSS's separate HTML-then-XML escaping behavior.
- [ ] Keep every public URL/metadata contract and www-to-apex 301 including
  query strings. Disable automatic prefetch/client navigation where it could
  serve stale writing; ordinary anchors are sufficient. No public write/API
  surface, forms, auth or Server Actions are needed. See architecture for RSC
  and static asset coverage.

### 0.3 Adopt Drizzle over the existing PostgreSQL data

- [ ] Retain the native PostgreSQL database `dunamismax`, schema `app` and roles
  `dunamismax_owner` (NOLOGIN), `dunamismax_web`, `dunamismax_publishing`, and
  `dunamismax_migration`. This is a PostgreSQL-to-PostgreSQL adoption, not another
  MySQL import or a reason to provision a replacement production database.
- [ ] Create `src/db/schema.ts`, separate server/operator connection modules,
  `drizzle.config.ts` and committed `drizzle/` SQL/snapshots. Model `app.posts`
  and the read view from `database/schema.sql`: bigint identity, C-collated
  unique slug, Unicode limits, byte limit, statuses, timestamptz fields,
  constraints and publication index. Do not silently coerce bigint IDs into
  unsafe JavaScript numbers or truncate timestamp precision during adoption.
- [ ] Preserve the owner-controlled `security_barrier` view `app.public_posts`,
  filtered by published status and PostgreSQL `CURRENT_TIMESTAMP`. Express
  grants/revokes, view security properties and unsupported DDL as reviewed
  custom SQL migrations. Introspection alone does not establish equivalent ACLs.
  The website must query the view through Drizzle using its read-only role;
  adding a TypeScript `where` filter over `app.posts` is not equivalent.
- [ ] Rehearse both fresh installation and baseline adoption on nonempty
  disposable restores. Verify schema equivalence before recording an existing
  baseline as applied; do not blindly run CREATE migrations, `push`, drop/reset
  commands or introspection initialization against production. Scope Drizzle
  to this application's schema and protect its migration journal from web/writer
  access. Prove repeat migration runs are no-ops. Never generate migrations on
  the production host from guessed schema state.
- [ ] Convert `src/lib/posts.ts`, `src/lib/publisher.ts` and relevant CLI schema
  tooling to Drizzle with node-postgres as the driver. Keep the lazy bounded
  web pool, deadlines, parameter binding, sanitized logs, row-locking
  transactions and independent credentials. Preserve all publisher command
  semantics and limits in `docs/content.md` and `tests/database.ts`.
- [ ] Keep list/count/detail/RSS current at database time. Do not bake post
  results into builds or ISR, persistently cache them, or prefetch them across
  requests; unpublish and
  due-time transitions must appear without a build, restart or invalidation job.
  Build successfully with no database credentials or network database available.
- [ ] Before/after adoption, compare every stored field, IDs/sequence, row
  counts, UTC instants and ordered full-content SHA256 privately. No post bodies,
  dumps, credentials or private sentinels in artifacts, images, logs or commits.

### 0.4 Package the app and operator tools with Docker Compose

- [ ] Add a pinned multi-stage `Dockerfile`, `.dockerignore` and `compose.yaml`
  (planned files). Install with `npm ci`, build with no secrets, then copy only
  `.next/standalone`, `.next/static` and `public` into the non-root web image.
  Run generated `server.js`; `public`/static assets are not copied automatically.
  Exclude `.env*`, dumps, drafts, `.git`, local outputs and development modules
  from build context/runtime as appropriate. Disable Next telemetry.
- [ ] Produce a separate operator/tools target with compiled publishing,
  migration and privilege-verification tools and reviewed SQL migrations.
  Define `publisher` and `migrate` as explicit one-off tools, outside default
  web startup. Each gets only its own existing protected env file and database
  role. Never give the web service a Docker socket, writer or migration secret;
  never run DDL automatically in web startup.
- [ ] Use Compose project `dunamismax`, web service `web`. On Ubuntu use
  `network_mode: host`, `HOSTNAME=127.0.0.1`, `PORT=4311`, `PGHOST=127.0.0.1`;
  candidate port 4323 must first be checked free under the shared host workflow.
  No `ports` mapping in host mode. This keeps native PostgreSQL loopback-only
  without changing/restarting the shared cluster. Read the network rationale
  and local-development alternative in `docs/production.md` before changing it.
- [ ] Add healthcheck, restart policy, graceful termination, unprivileged user,
  dropped capabilities and no-new-privileges; use a read-only filesystem with
  only demonstrated Next runtime/tmp/cache paths writable. Resource and database
  connection limits must fit the shared host. Test runtime secret loading and
  filesystem permissions as the actual container UID.
- [ ] Keep existing secret paths under `/etc/astro-apps/dunamismax/` during this
  migration; their historical directory name does not require a credential move.
  Compose runs under the privileged operator and may load the corresponding
  root-only `env_file` per service. Do not print rendered secret-bearing config,
  put secrets in build args or expose them with `NEXT_PUBLIC_*`.
- [ ] Keep local dev simple: npm dev plus an isolated local DB, or a documented
  development-only Compose override/private DB network. Do not assume Linux
  host networking works unchanged on a Mac. Default production Compose must
  never start another PostgreSQL, Caddy, Coolify or Dokploy service.

### 0.5 Replace the release workflow and rehearse rollback

- [ ] Rewrite `deploy/{prepare,cutover,lib,rollback,rehearse,posts-wrapper}.sh`
  for immutable commit-tagged images/recorded digests and Compose releases;
  adapt `deploy/astro-dunamismax.service` into a site-scoped Compose lifecycle
  unit or an explicitly documented equivalent. Keep bash invocation, root-only
  credentials, full-transaction descriptor-9 locking, expected-current guards,
  candidate isolation and rollback traps. The old scripts accept Astro only.
- [ ] Preserve the current Caddy site fragment and loopback upstream. Validate
  the custom binary's `dns.providers.cloudflare` module and DNS-challenge
  configuration with a zone-scoped token supplied only to Caddy. For proxied
  DNS, verify Full (strict) and a valid origin certificate; never use Flexible.
  Do not replace/restart shared Caddy or alter another zone/site. If the shared
  binary lacks the module, record that host prerequisite for its owner instead
  of swapping the shared binary as part of this site's deployment.
- [ ] Build/test the candidate before taking the shared lock. For an authorized
  cutover, take one lock for migration, publisher exclusion, service switch,
  validation and rollback. Run migrations only as the operator role; use
  additive schema changes compatible with the retained Astro release.
- [ ] Test the candidate on 4323 without stopping the active site. Switch the
  active release atomically; stop only the old site process before the new web
  container claims 4311. Never run a global Compose down/prune or remove volumes.
  Retain the previous image/digest, release, unit, Caddy fragment and publisher
  wrapper. Automatic failure recovery must stop the new container before
  restarting the old site and restore its matching publisher/tooling.
- [ ] Rehearse first Astro-to-Next rollback and subsequent Next-to-Next rollback
  against nonempty test data. Rollback changes code/config, not authoritative
  PostgreSQL content. Refuse incompatible schema/data rollback; never restore
  frozen MySQL or an old database dump over newer posts.
- [ ] Verify nightly `pg_dump`, encrypted off-server copies, monitored job
  results and an isolated restore including roles/ACLs and the active application
  release/image. Extend existing host/site backup tooling only within authorized
  scope; do not replace working timers or use a same-host copy as the only backup.
  See `docs/production.md` for host prerequisites and release evidence.

### 0.6 Port verification and finish the implementation handoff

- [ ] Update scripts, Makefile, CI and ignore rules for Next/Drizzle/container
  output. Replace Astro-specific HTTP markup assertions while retaining their
  behavioral coverage. Test CSP nonce correctness, actual browser hydration and
  absence of unauthorized scripts/styles; a blanket no-`script` test must go.
- [ ] Run check/unit/build; real PostgreSQL privileges and CLI tests; fresh and
  adopted migration replay; populated/outage/recovery HTTP against **the built
  container**, including HEAD/methods on static assets and errors. Assert that
  private/future content is absent from HTML, RSC, RSS and `.next`/image assets; test
  due-time publication and immediate unpublish without a rebuild. Test true 404
  and 503 before streaming, bad pagination and invalid slugs, and startup with
  missing/wrong-role credentials.
- [ ] Review 320/375/768/1440 widths in both color schemes, keyboard navigation,
  focus/skip links, overflow and long/Unicode posts. Check pages and ordinary
  links with scripts disabled as well as enabled; preserve readable HTML.
- [ ] Run `bash -n`, ShellCheck, Compose validation without printing secrets,
  image startup/health/termination and rollback rehearsals, dependency audit,
  and `git diff --check`. Keep all destructive tests on disposable `_test` DBs.
- [ ] Rewrite README commands/layout and architecture/content/production
  runbooks to the actually delivered stack. Update `AGENTS.md` with the final
  Compose/Caddy/port/database/secret conventions, and replace this phase's
  pending items with concrete results. Do not create a duplicate CLAUDE.md.
  Update public stack wording only where the release/evidence supports it;
  do not claim sibling projects migrated just because they received this prompt.
- [ ] Remove obsolete Astro dependencies/config/types/pages after parity; remove
  legacy MySQL tooling only after confirming no retained recovery process needs
  it. Preserve historical acceptance evidence and protected rollback releases.
  No Better Auth, Stripe, AI SDK, Tauri or Expo until a real feature needs them.

### 0.7 Release acceptance (separate from local completion)

- [ ] Confirm release authorization before production mutation. This planning
  assignment does not deploy; the former migration's authorization/evidence is
  not a new production release approval. Follow the shared host contract first.
- [ ] For an authorized release: record fresh backup/restore results, exact
  commit/image digest, reconciled data/privileges, verified remote tips, active
  Compose service/listener, public HTTP/browser/TLS checks and rollback check.
  Record the new acceptance separately in `docs/migration.md`; never relabel
  the October Astro results as Next.js verification.

### Implementation references

Reviewed for this handoff; recheck stable-version requirements when implementing.
Use these official guides alongside current Context7 results. Verify migration
syntax for PostgreSQL and the selected stable version rather than copying a
legacy CLI command or another SQL dialect's baseline example.

- [Next standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
  and [CSP/nonces](https://nextjs.org/docs/app/guides/content-security-policy).
- [Tailwind with Next](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
  and [shadcn/ui with Next](https://ui.shadcn.com/docs/installation/next).
- [Drizzle with existing PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-existing)
  and [schema introspection/baseline](https://orm.drizzle.team/docs/drizzle-kit-pull).
- [Docker host networking](https://docs.docker.com/engine/network/drivers/host/),
  [Caddy Cloudflare DNS module](https://github.com/caddy-dns/cloudflare), and
  [Cloudflare Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/).

## Existing Astro verification (baseline until Phase 0 replaces it)

Astro/strict TypeScript/PostgreSQL replaces this repository’s PHP implementation.
Preserved: approved portfolio, routes, CSS/icon, metadata, RSS/plain text,
pagination, zero browser scripts, draft privacy and database outage behavior.
About/Contact/Projects prerender; PostgreSQL remains authoritative for posts.

Production was verified at release `c93aaec` on October 22, 2026 Eastern. The public
109-check HTTP suite, live database privileges, guarded rollback check and
post-cutover encrypted backup/restore verification passed. Backup snapshot
`12e8d86` was verified on both backup remotes. See the acceptance record below.

### Current implementation gates

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
