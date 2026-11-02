# dunamismax.com

Stephen Sawyer’s personal site, portfolio and blog. Approved portfolio copy,
branding, project order, links and layout are preserved. Current stack descriptions follow the verified project handoffs in
[docs/portfolio.md](docs/portfolio.md).

## Stack direction (November 2, 2026)

The stack is **Astro + strict TypeScript + PostgreSQL + Drizzle**, behind
existing Caddy/Cloudflare. Drizzle was adopted in place over the existing
node-postgres pool and database and released to production on November 2,
2026. See [BUILD Phase 0](BUILD.md#phase-0--astropostgresql-stack-alignment-first).
The superseded Next.js and SQLite plans do not apply.

Keep existing semantic HTML/CSS and zero browser scripts. React islands,
Tailwind/shadcn, Actions, auth and AI libraries are optional when needed. Python
and Swift belong only where a project need or explicit request justifies them;
this site needs neither. Retain existing TypeScript CLI tools and systemd
hosting. Use Swift for a future requested Apple client, calling Astro APIs over
HTTPS; no native client is planned here. Containerization is optional.

## Current stack and routes

Astro 7.4.2, strict TypeScript 6.0.3, PostgreSQL with Drizzle ORM 0.45.4
(node-postgres driver), semantic HTML and hand-written CSS. Zero browser JavaScript, external fonts, analytics or third-party assets.
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

## Current development

```sh
npm ci
APP_ENV=local npm run dev
npm run check
npm run db:check
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
LC_ALL=en_US.UTF-8 PGBIN=/opt/homebrew/opt/postgresql@18/bin bash deploy/rehearse.sh
# Ubuntu uses /usr/lib/postgresql/18/bin by default. Set TEST_PGPORT if 55431 is taken.
```

Schema changes start in `src/db/schema.ts`. Run `npx drizzle-kit generate --name=NAME`,
review the SQL in `drizzle/` (add grants or PostgreSQL-specific statements Drizzle
cannot express), then `npm run db:check` and the rehearsal. Never use
`drizzle-kit push`, `pull` or `migrate` against a real database: `bin/schema.ts`
(`npm run schema` with `MIGRATION_CONFIG`) is the only applier.

## Current layout

| Path | Purpose |
| --- | --- |
| `src/pages/` | Astro pages/endpoints; static pages explicitly prerender |
| `src/layouts/`, `src/components/` | Metadata, navigation and shared project cards |
| `src/lib/` | Post reads, publishing, validation, safe text/RSS |
| `src/db/` | Drizzle schema, website/operator connections, catalog/content digests |
| `drizzle/` | Reviewed SQL migrations, journal and snapshots (drizzle-kit) |
| `database/baseline-catalog.json` | Production pre-Drizzle catalog required for adoption |
| `bin/*.ts` | Publishing, schema migration, data reconciliation and HTTP server |
| `tests/` | TypeScript unit, HTTP and isolated database tests |
| `public/` | Only CSS and icon, copied into build client output |
| `deploy/` | Candidate, locked cutover, rehearsal and guarded rollback |
| `docs/` | Architecture, editorial evidence and operational runbooks |

PostgreSQL is authoritative after cutover. The website role can SELECT only
`app.public_posts`, which excludes drafts/future posts. The publisher can
SELECT/INSERT/UPDATE `app.posts`, without DELETE or DDL. Migration credentials
are operator-only, and the `drizzle` journal schema is owner-only. See [publishing](docs/content.md),
[architecture](docs/architecture.md), and [production](docs/production.md).

## License

MIT. See [LICENSE](LICENSE).

## Continuous verification and dependency review

GitHub Actions verifies the pinned Node 24.22.1/npm 11.19.1 toolchain with
`npm ci`, strict checks, repository tests and builds, then `npm audit` (moderate
and above fail). Integration checks use disposable synthetic PostgreSQL or the
custom-Caddy fixture suite; no production credentials are supplied. The workflow
also runs weekly. Dependency updates are reviewed and made directly on `main`
(no Dependabot branches). An npm override pins drizzle-kit's legacy
`@esbuild-kit` loader to the tree's patched esbuild; recheck it when updating
drizzle-kit and drop it once that dependency is gone. Exact dependency pins and lockfiles remain
required; these workflows never deploy unreviewed updates.
