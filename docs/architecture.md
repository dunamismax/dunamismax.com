# Architecture

## Current implementation

The following describes checked-in Astro/PostgreSQL code. Pending Drizzle
alignment is in [BUILD Phase 0](../BUILD.md#phase-0--astropostgresql-stack-alignment-first-pending); no framework,
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
base table and cannot become a publisher/owner. The small lazy pool (4) has
connection and statement deadlines and sanitized error reporting.

A home database error yields a neutral writing link and unknown count. It never
claims there are no posts during an outage. Blog routes/RSS return an honest
503/no-store with Retry-After; static pages and health remain available.

The TypeScript publisher uses transactions and row locks, validates Unicode
limits/plain text/timestamps, preserves unspecified fields, and leaves slugs
immutable. Only publish/schedule change drafts to published. Unpublish retains
the publication date. PostgreSQL is authoritative after cutover; the retained
MySQL database is a frozen rollback source, not a second writer.

Migration tooling is the only remaining MySQL client dependency. It exports a
consistent UTC snapshot privately, imports to an empty target transactionally,
reconciles every field using an ordered SHA256 and restores the identity sequence.
It is safe to rerun with identical data and refuses a differing nonempty target.
No migration snapshot or credential is committed or copied into release assets.

## Target alignment (pending)

Retain Caddy -> loopback Node/Astro -> native PostgreSQL. Keep .astro pages,
layouts, components and vanilla CSS. Existing static pages stay prerendered;
Home/blog/posts/RSS stay request-rendered. Preserve bin/server.ts's boundary,
CSP/no-script policy, canonical origins, actual 404/503 statuses and honest home
fallback. No Next runtime, React rewrite or nonce-driven rendering change.

Add Drizzle with node-postgres, src/db/schema.ts and reviewed drizzle/ SQL.
Adopt the existing database rather than copying it into a new engine. Web still
uses only app.public_posts through the read-only role. Keep the security-barrier
view/database-clock filter, independent publisher/migration identities, limits,
timeouts, row locks and transactions. Migrations include ACLs, constraints and
view definitions even where custom SQL is necessary. Verify fresh initialization
and nonempty baseline adoption; protect the migration journal from web/writer
access. Do not run DDL in web startup or provide operator credentials to builds.

Python/Swift, client frameworks, Actions, auth and AI features are added only
for actual requirements or explicit requests. Existing TypeScript publishing
and maintenance code stays TypeScript; no new Swift/Python project is needed.
Any future native client calls Astro HTTPS endpoints rather than PostgreSQL.
