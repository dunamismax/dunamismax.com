# Architecture

## Current implementation

The following describes checked-in SvelteKit 3 / Svelte 5 / TypeScript /
Tailwind CSS 4 / PostgreSQL 18 + Drizzle code on Node (adapter-node) behind Caddy.
Status is in [BUILD Phase 1](../BUILD.md#phase-1--sveltekit-stack-migration-november-20-2026);
the earlier Astro implementation is historical (BUILD Phase 0).

Caddy → loopback Node → SvelteKit adapter-node handler → PostgreSQL for writing.
The Node web process is read-only and receives only web.env. About, Contact
and Projects are prerendered; Home, Blog, Post and RSS read current data.
All share the preserved semantic layout, CSS, icon and approved portfolio.
The website sends zero browser scripts: the root `+layout.ts` sets `csr = false`,
so SvelteKit emits server-rendered HTML with no hydration or client bundle.
Svelte components live in `src/lib/components/` and are imported via the
`#lib/*` subpath import declared in package.json (SvelteKit 3 replaced `$lib`).

Styling is the preserved hand-written stylesheet (`src/styles/site.css`)
compiled by Tailwind CSS 4 (`src/app.css`, `@tailwindcss/vite`) into the
components layer. Preflight is omitted so base rendering is unchanged, and
utilities are generated only from classes used in `.svelte` markup. The
compiled CSS is a prerendered endpoint at the stable `/css/site.css` URL,
linked with a content-hash query, rather than a hashed `/_app` asset.

`bin/server.ts` is the uniform HTTP boundary before adapter-node’s handler
(`dist/web/handler.js`). It enforces GET/HEAD, headers, cache policy and an
explicit public path surface. This matters because the adapter serves static and
prerendered files before `src/hooks.server.ts` runs. The hook also protects SSR
responses, sets noindex/Retry-After and logs only sanitized errors. Both take
the security headers, the allowed methods and the refusal message from
`src/lib/http.ts`, and the slug grammar from `SLUG_PATTERN` in
`src/lib/validation.ts`, so the two layers cannot drift. Headers that a
prerendered endpoint declares never reach the client, because its output is
served as a static file; the cache policy for the stylesheet, robots.txt, the
manifest and the icon is therefore the `cachePolicy` table in `bin/server.ts`,
and everything else is no-store. `tests/http.ts` pins the headers and cache
policy of every response class. CSP forbids
inline styles and scripts. Only the build’s client/prerendered directories are
read internally; Caddy proxies requests and never exposes a source or
server-build webroot. SvelteKit’s prerendered `__data.json` files and `/_app`
paths are outside the allowlist and return 404.

`app.posts` preserves IDs, slugs, all text, statuses and UTC instants. IDs are
bigint identities; migration refuses overflow rather than changing IDs. The
publication index orders timestamp then ID descending. `app.public_posts`
is an owner-controlled security-barrier view filtered by published status and
PostgreSQL CURRENT_TIMESTAMP. Each website query sees current database time;
no build, scheduler or cache invalidation is required for scheduled publication.
Lists/counts/detail/RSS all query that view. Web has no access to the private
base table and cannot become a publisher/owner. Website reads are Drizzle
queries on that view (src/db/web.ts) over the small lazy node-postgres pool (4),
with connection and statement deadlines and sanitized error reporting.

A home database error yields a neutral writing link and unknown count. It never
claims there are no posts during an outage. Blog routes/RSS return an honest
503/no-store with Retry-After; static pages remain available. `/healthz` runs one
real query through the website pool and answers 503 when it fails, so the
deploy's candidate check proves the database path, and it reports the release's
`REVISION`.

The TypeScript publisher uses Drizzle transactions and row locks, validates Unicode
limits/plain text/timestamps, preserves unspecified fields, and leaves slugs
immutable. Only publish/schedule change drafts to published. Unpublish retains
the publication date. PostgreSQL is authoritative. MySQL is retired on the host,
and the one-time MySQL import tool and its `mysql2` driver were removed on
2026-11-21 (BUILD M.5); `docs/migration.md` records how the import was done.

## Schema and migrations

`src/db/schema.ts` defines app.posts and the app.public_posts view; drizzle-kit
generates reviewed SQL into `drizzle/` (only schema app is in scope). Grants are
appended as reviewed custom SQL because Drizzle does not model them. The
migration journal is `drizzle.__drizzle_migrations`, in its own owner-only schema
so app's default privileges never expose it to the web or publishing roles.

`bin/schema.ts` is the only applier. It connects with migration credentials,
SET ROLEs to dunamismax_owner, takes an advisory lock and runs Drizzle's
node-postgres migrator. A database that predates Drizzle (app.posts present,
empty journal) is adopted only if its normalized catalog — columns, collations,
defaults, identity, constraints, indexes, view definition/options, owners and
expanded ACLs — equals `database/baseline-catalog.json`, which was captured
read-only from production. Adoption records the baseline hash without replaying
its CREATE statements. Before and after, it compares row count, maximum ID,
sequence state and an ordered SHA256 of every stored field; any difference fails.
Repeated runs are no-ops. Web startup and builds never run migrations.

Python/Swift, client-side interactivity, form actions, remote functions, auth
and AI features are added only for actual requirements or explicit requests.
Existing TypeScript publishing and maintenance code stays TypeScript; no new
Swift/Python project is needed. Any future native client calls SvelteKit HTTPS
endpoints rather than PostgreSQL.
