# dunamismax.com

Stephen Sawyer’s personal site, portfolio and blog. Approved portfolio copy,
branding, project order, links and layout are preserved. Current stack descriptions follow the verified project handoffs in
[docs/portfolio.md](docs/portfolio.md).

## Rewrite plan (first priority)

The November 2, 2026 stack-unification request is planned in
[BUILD.md Phase 0](BUILD.md#phase-0--unified-stack-rewrite-first-not-started).
That phase comes before further feature work and hands the rewrite to the next
implementer. This change is documentation only; the application below remains
Astro until the phase is implemented and verified.

The target is **Next.js App Router + React + Tailwind + selected shadcn/ui
components, PostgreSQL + Drizzle, and Docker Compose**, using Next
`output: 'standalone'` behind the existing Caddy. Retain the existing native
PostgreSQL database and independent web/publishing/migration roles. No logins,
payments, LLM features, desktop client or mobile app are required, so Better
Auth, Stripe, AI SDK, Tauri and Expo are deferred until needed. No hosted auth
or Vercel-specific service is required.

Preserve routes, approved design/copy, plain-text publishing, draft privacy and
outage behavior. Framework scripts replace the old zero-script guarantee with
a tested nonce-based CSP; content remains readable without JavaScript. See
[target architecture](docs/architecture.md#target-architecture--phase-0-not-implemented)
and [deployment target](docs/production.md#nextjscompose-target--not-installed)
for the security, network, backup and rollback constraints. Planned Compose and
Next files are deliverables for the rewrite, not runnable files in this checkout.

## Current stack and routes

Astro 7.4.2, strict TypeScript 6.0.3, PostgreSQL, semantic HTML and hand-written
CSS. Zero browser JavaScript, external fonts, analytics or third-party assets.
Node 24.22.1 / npm 11.19.1 are pinned; commit the npm v3 lockfile.
Astro’s [Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
builds static pages and server handlers. Caddy proxies to loopback port 4311.

| URL | Behavior |
| --- | --- |
| `/` | Dynamic latest post/count; remains 200 during database outages |
| `/about`, `/contact`, `/projects` | Prerendered HTML; no database access |
| `/blog`, `/blog?page=2` | Ten published posts per page |
| `/blog/{slug}` | Published plain-text post; escaped paragraphs |
| `/feed.xml` | Latest twenty visible posts, RSS 2.0, `application/xml` |
| `/robots.txt`, `/manifest.webmanifest` | Existing content types and metadata |
| `/healthz` | `{"status":"ok"}`, independent of PostgreSQL |
| `/css/site.css`, `/icon.svg` | Preserved stylesheet and icon URLs |

GET/HEAD only (other methods 405); unknown/private paths 404/noindex.
The www hostname permanently redirects to the apex, preserving path and query.
Canonical URLs use configured `APP_URL`, never a request Host header.
Blog/feed database failures return 503 with `Retry-After: 60` and no-store.

## Current development commands

```sh
npm ci
APP_ENV=local npm run dev
npm run check
npm test
APP_ENV=production npm run build
APP_ENV=local PORT=8000 npm start
```

Use the pinned Node/npm distributions; `.npmrc` enforces engines. No
`--force` or legacy-peer-dependency workarounds. With `APP_ENV=local` and no
`PGDATABASE`, the blog previews empty. A configured but unreachable database
remains an outage. Set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
for a local read-only database. `APP_URL` is an origin (no path/trailing slash),
HTTPS in production. `.env.example` documents the fields; never commit secrets.

```sh
# Disposable local fixture cluster, not your normal PostgreSQL database:
PGBIN=/opt/homebrew/opt/postgresql@17/bin bash deploy/rehearse.sh
# Ubuntu uses /usr/lib/postgresql/18/bin by default.
```

## Current layout

| Path | Purpose |
| --- | --- |
| `src/pages/` | Astro pages/endpoints; static pages explicitly prerender |
| `src/layouts/`, `src/components/` | Metadata, navigation and shared project cards |
| `src/lib/` | PostgreSQL reads, publishing, validation, safe text/RSS |
| `bin/*.ts` | Publishing, schema, data reconciliation and HTTP server |
| `database/schema.sql` | Additive PostgreSQL schema/view/ACL baseline |
| `tests/` | TypeScript unit, HTTP and isolated database tests |
| `public/` | Only CSS and icon, copied into build client output |
| `deploy/` | Candidate, locked cutover, rehearsal and guarded rollback |
| `docs/` | Architecture, editorial evidence and operational runbooks |

PostgreSQL is authoritative after cutover. The website role can SELECT only
`app.public_posts`, which excludes drafts/future posts. The publisher can
SELECT/INSERT/UPDATE `app.posts`, without DELETE or DDL. Migration credentials
are operator-only. See [publishing](docs/content.md),
[architecture](docs/architecture.md), and [production](docs/production.md).

## License

MIT. See [LICENSE](LICENSE).

## Continuous verification and dependency review

The existing GitHub Actions workflow verifies the pinned Node 24.22.1/npm
11.19.1 toolchain with `npm ci`, strict checks, repository tests and builds,
then `npm audit` (moderate and above fail). Integration checks use disposable
synthetic PostgreSQL or the
custom-Caddy fixture suite; no production credentials are supplied. The workflow
also runs weekly. Dependency updates are reviewed and made directly on `main`
(no Dependabot branches). Exact dependency pins and lockfiles remain
required; these workflows never deploy unreviewed updates.
Phase 0 must port these gates and the disposable database/HTTP rehearsal to the
Next/Drizzle container before replacing this current-development documentation.
