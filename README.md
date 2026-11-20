# dunamismax.com

**Stephen Sawyer's personal site: portfolio, about page, contact links and a
plain-text blog.** It is server-rendered SvelteKit with no browser JavaScript,
reads published posts from PostgreSQL, and is self-hosted behind Caddy.

| | |
| --- | --- |
| **Website** | [dunamismax.com](https://dunamismax.com) |
| **Status** | Live; see **Now** in [BUILD.md](BUILD.md) |
| **Source** | [GitHub](https://github.com/dunamismax/dunamismax.com) · [Codeberg](https://codeberg.org/dunamismax/dunamismax.com) |

## What's on the site

- **Home** with six featured projects and the latest post.
- **Projects**: fifteen projects in five groups (games and play, websites and
  publishing, apps in development, infrastructure and support, and bots, tools
  and teaching), each with a stable anchor. Every claim is checked against the project's running service and
  repository; the evidence is in [docs/portfolio.md](docs/portfolio.md).
- **About** and **Contact**.
- **Blog** and an **RSS feed** of plain-text posts. Drafts and scheduled posts
  stay private until the database clock says they are due.

No scripts, external fonts, analytics, forms, accounts or third-party assets.
The theme follows the reader's light or dark preference.

## Stack

**SvelteKit 3 · Svelte 5 · TypeScript · Tailwind CSS 4 · PostgreSQL 18 +
Drizzle ORM · Node (adapter-node) · Caddy**

| Layer | Choice |
| --- | --- |
| Framework | SvelteKit 3.4.0 and Svelte 5.58.1 on Vite 8.3.8, configured in `vite.config.ts`; `csr = false`, so pages ship no JavaScript |
| Language | TypeScript 6.0.3, strict, with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` |
| Styling | The preserved hand-written stylesheet (`src/styles/site.css`), compiled by Tailwind CSS 4.3.5 without preflight and served at `/css/site.css` |
| Data | PostgreSQL 18 through Drizzle ORM 0.45.4 (node-postgres); reviewed SQL migrations in `drizzle/` |
| Server | `@sveltejs/adapter-node` 6.0.5 behind `bin/server.ts`, which enforces methods, headers and the public path list |
| Hosting | systemd on the owner's Ubuntu server, loopback port 4311, behind Caddy with automatic HTTPS |
| Toolchain | Node 24.22.3 and npm 11.19.1, exact pins and a committed lockfile |

## Routes

| URL | Behavior |
| --- | --- |
| `/` | Latest post and post count; stays 200 during a database outage |
| `/about`, `/contact`, `/projects` | Prerendered HTML; no database access |
| `/blog`, `/blog?page=2` | Ten published posts per page |
| `/blog/{slug}` | One published post, escaped into paragraphs |
| `/feed.xml` | The latest twenty published posts, RSS 2.0, `application/xml` |
| `/robots.txt`, `/manifest.webmanifest` | Crawler rules and web manifest |
| `/healthz` | `{"status":"ok"}`, independent of PostgreSQL |
| `/css/site.css`, `/icon.svg` | The compiled stylesheet and the icon |

Only GET and HEAD are allowed (other methods get 405). Unknown and private
paths return 404 with noindex. The www hostname redirects permanently to the
apex, keeping path and query. Canonical URLs come from the configured
`APP_URL`, never the request's Host header. When the database is down, the
blog, posts and feed return 503 with `Retry-After: 60` and no-store.

## Development

Use the pinned Node and npm (`.node-version`; `.npmrc` enforces engines).

```sh
npm ci
APP_ENV=local npm run dev      # http://127.0.0.1:8000
```

With `APP_ENV=local` and no `PGDATABASE`, the blog previews empty. To read a
local database, set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` and `PGPASSWORD`
for a read-only role; [.env.example](.env.example) lists the fields. A
configured but unreachable database is treated as an outage. `APP_URL` is an
origin with no path or trailing slash, HTTPS in production. Never commit
secrets.

The checks, the same ones CI runs:

```sh
npm run check                     # svelte-check and TypeScript
npm run db:check                  # Drizzle schema has no unreviewed changes
npm test                          # unit tests
APP_ENV=production npm run build  # web build and CLI
APP_ENV=local PORT=8000 npm start # run the built server
```

The rehearsal starts a disposable PostgreSQL cluster (not your normal
database), runs the database suite against real role privileges, then the HTTP
suite against the built server with data, during an outage and after recovery:

```sh
LC_ALL=en_US.UTF-8 PGBIN=/opt/homebrew/opt/postgresql@18/bin bash deploy/rehearse.sh
```

On Ubuntu `PGBIN` defaults to `/usr/lib/postgresql/18/bin`. Set `TEST_PGPORT`
if port 55431 is taken.

### Changing the schema

Edit `src/db/schema.ts`, run `npx drizzle-kit generate --name=NAME`, review the
SQL in `drizzle/` (add grants or PostgreSQL statements Drizzle cannot express),
then `npm run db:check` and the rehearsal. `bin/schema.ts` (`npm run schema`
with `MIGRATION_CONFIG`) is the only thing that applies migrations; never run
`drizzle-kit push`, `pull` or `migrate` against a real database.

### Editing pages and the portfolio

Pages are in `src/routes/`. Every project card comes from the typed inventory
in `src/lib/projects.ts`; check a project's evidence in
[docs/portfolio.md](docs/portfolio.md) before changing its card, and keep
`tests/http.ts` in step. [docs/content.md](docs/content.md) covers pages and
the publishing CLI.

## Publishing and security

Posts live in PostgreSQL `app.posts` and are written only through the
`dunamismax-posts` CLI, with its own database role and config. The website role
can read only the `app.public_posts` view, which leaves out drafts and posts not
yet due, and cannot write. Migration credentials are operator-only, and the
`drizzle` journal schema is owner-only. Builds never receive database
credentials or post data. See [docs/content.md](docs/content.md),
[docs/architecture.md](docs/architecture.md) and
[docs/production.md](docs/production.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `src/routes/` | Pages, loads and endpoints; static pages set `prerender = true` |
| `src/routes/+layout.svelte`, `src/lib/components/` | Metadata, navigation, footer and the shared project card (imported as `#lib/*`) |
| `src/lib/projects.ts` | Typed portfolio inventory: groups, order, anchors and featured projects |
| `src/lib/` | Post reads, publishing, validation, safe text and RSS |
| `src/app.css`, `src/styles/site.css` | Tailwind CSS 4 entry and the preserved stylesheet |
| `src/hooks.server.ts`, `src/app.html` | Response headers, sanitized errors and the HTML shell |
| `src/db/` | Drizzle schema, website and operator connections, catalog and content digests |
| `drizzle/` | Reviewed SQL migrations, journal and snapshots |
| `database/baseline-catalog.json` | Production's pre-Drizzle catalog, required for adoption |
| `bin/` | HTTP server, publishing CLI, schema applier, database verification, historical MySQL import |
| `tests/` | Unit, HTTP and isolated database tests |
| `static/` | The icon |
| `deploy/` | systemd unit, Caddy template, candidate, locked cutover, rehearsal and rollback |
| `docs/` | Architecture, content, production runbook, portfolio evidence, migration history |

## Continuous integration

GitHub Actions ([verify.yml](.github/workflows/verify.yml)) runs on every push
to `main`, weekly and on demand. It checks the pinned Node and npm, installs
with `npm ci`, runs `npm run check`, `npm run db:check`, `npm test` and the
production build, runs the rehearsal against a disposable PostgreSQL 18 cluster
with synthetic data, and fails on any `npm audit` finding of moderate severity
or above. CI gets no production credentials and never deploys. Dependency
updates are reviewed and committed by hand on `main`; there is no Dependabot.
An npm override pins drizzle-kit's legacy `@esbuild-kit` loader to the tree's
patched esbuild until drizzle-kit drops it.

## Documentation

- [AGENTS.md](AGENTS.md): how work is done here (for agents and humans)
- [BUILD.md](BUILD.md): current status, decisions, next steps and release records
- [docs/architecture.md](docs/architecture.md),
  [docs/content.md](docs/content.md),
  [docs/production.md](docs/production.md),
  [docs/portfolio.md](docs/portfolio.md),
  [docs/migration.md](docs/migration.md)

## License

MIT. See [LICENSE](LICENSE).
