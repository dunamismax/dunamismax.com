# Architecture

## Current implementation

The following describes checked-in Astro/PostgreSQL/Drizzle code. Status is in
[BUILD Phase 0](../BUILD.md#phase-0--astropostgresql-stack-alignment-first); no framework,
database-engine or language conversion is planned.

Caddy → loopback Node → Astro static/SSR handler → PostgreSQL for writing.
The Node web process is read-only and receives only web.env. About, Contact
and Projects are prerendered; Home, Blog, Post and RSS read current data.
All share the preserved semantic layout, CSS, icon and approved portfolio.
The website sends zero browser scripts.

`bin/server.ts` is the uniform HTTP boundary before Astro’s standalone handler.
It enforces GET/HEAD, headers, cache policy and an explicit public path surface.
This matters because adapter static-file handling precedes Astro middleware.
The middleware also protects SSR responses and sets noindex/Retry-After.
Prerendered headers are captured by the adapter. CSP forbids inline styles and
scripts. Only the build’s client directory is used internally for static files;
Caddy proxies requests and never exposes a source or server-build webroot.

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
503/no-store with Retry-After; static pages and health remain available.

The TypeScript publisher uses Drizzle transactions and row locks, validates Unicode
limits/plain text/timestamps, preserves unspecified fields, and leaves slugs
immutable. Only publish/schedule change drafts to published. Unpublish retains
the publication date. PostgreSQL is authoritative after cutover; the retained
MySQL database is a frozen rollback source, not a second writer.

Migration tooling is the only remaining MySQL client dependency. It exports a
consistent UTC snapshot privately, imports to an empty target transactionally,
reconciles every field using an ordered SHA256 and restores the identity sequence.
It is safe to rerun with identical data and refuses a differing nonempty target.
No migration snapshot or credential is committed or copied into release assets.

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

Python/Swift, client frameworks, Actions, auth and AI features are added only
for actual requirements or explicit requests. Existing TypeScript publishing
and maintenance code stays TypeScript; no new Swift/Python project is needed.
Any future native client calls Astro HTTPS endpoints rather than PostgreSQL.
