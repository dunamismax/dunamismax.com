# Architecture

## Current implementation (Astro)

This describes the checked-in implementation. The November 2, 2026 rewrite is
planned in [BUILD Phase 0](../BUILD.md#phase-0--unified-stack-rewrite-first-not-started);
the target below supersedes Astro-specific design rules when implemented.

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

## Target architecture — Phase 0 (not implemented)

```text
Browser -> Cloudflare (when proxied, Full strict) -> existing host Caddy
        -> 127.0.0.1:4311 -> Compose web / Next standalone Node server
        -> Drizzle + node-postgres / dunamismax_web -> app.public_posts

Authorized shell -> separate publisher tool / dunamismax_publishing -> app.posts
Authorized deploy -> separate migration tool / dunamismax_migration -> reviewed DDL
```

Next.js App Router and React replace Astro; Tailwind and selected local
shadcn/ui primitives adopt the existing tokens and semantic design. Keep source
under `src/app`, reusable React under `src/components`, and server database
modules under `src/db`. Continue using `src/lib` for text, RSS, validation and
configuration where their tested behavior transfers. Avoid new public API
routes beyond the existing endpoint contracts. Better Auth, Stripe, AI SDK,
Tauri and Expo have no current product requirement and are not dependencies
of this migration. Any future native client talks to a Next API, never PostgreSQL.

Use `output: 'standalone'`, the Node runtime and generated `server.js`, with
copied `public` and `.next/static` directories. Keep build-time inputs public
and deterministic: no post query, database credential or draft export during
build. Runtime secrets are not `NEXT_PUBLIC_*` variables. Mark database and
secret modules server-only and keep CLI migration/publisher imports outside
client dependency graphs.

### Rendering, status and caching

Home, blog, post detail and RSS must read current `app.public_posts` using the
website role through Drizzle. Preserve database-clock visibility, timestamp/ID
ordering, ten-post pages and the twenty-item feed. Do not use persistent Next
data/full-route/client caches, ISR or CDN caching for writing. Prefer plain
anchors over prefetched client transitions so publication and unpublication do
not depend on client cache invalidation. RSC responses must expose only the same
public data as HTML, never private records or connection configuration.

Preserve actual response statuses: missing/draft/future posts and invalid
pagination are 404; database failures for blog/post/feed are 503 with
`Retry-After: 60`, `Cache-Control: no-store` and `noindex`. Home keeps a 200
neutral writing link/unknown count. About, Contact, Projects, health and static
assets remain independent of database availability. Decide status before
streaming; Next error/loading boundaries can otherwise yield a misleading 200.
The Phase 0 prototype must prove the supported solution before the whole port.

### CSP and the HTTP boundary

The target permits necessary first-party Next/React scripts. It supersedes
the old no-script rule without adding tracking or arbitrary product scripts.
Use fresh cryptographic request nonces, propagate CSP into the render request
and response, and authorize the framework's required script/style elements.
Keep production free of `unsafe-inline` and `unsafe-eval`, external font/script
origins and style attributes. Ensure untrusted request headers cannot choose
the nonce. Both successful and error HTML need the policy.

Nonce-bearing HTML is rendered per request, including the database-independent
pages. Do not cache/reuse a nonce-bearing response or force static generation
to preserve the Astro prerender implementation detail. Static CSS, icon and
hashed framework assets can use appropriate independent cache policies.

Next configuration/response handling and Caddy must enforce the public boundary
for document, RSC, endpoint, error and static requests, including direct origin
tests. Allow only required `/_next/static/...` artifacts in addition to the
existing URL surface; no blanket permission for source, `.next/server`, maps,
environment files, CLI code or Docker/config files. No image optimizer endpoint
is needed for the existing SVG icon. Preserve GET/HEAD-only/405, security
headers, trusted canonical `APP_URL`, www redirect and noindex on errors.
Do not transplant Astro's adapter handler into Next or rely on a middleware
matcher that skips the very static paths the old boundary protected.

### Schema and operational separation

Drizzle's TypeScript schema and versioned SQL replace the hand-applied schema
workflow. Retain `app.posts` and the owner-controlled security-barrier
`app.public_posts` view; migration SQL must explicitly preserve ACLs and
constraints, not just table shape. Web has SELECT on the view only; publisher
has bounded SELECT/INSERT/UPDATE and identity-sequence use; only migrations may
DDL. No DELETE, TRUNCATE, role escalation or base-table SELECT for web.

Adopt a verified nonempty restore as a baseline before touching the live
migration journal. Test clean installation and existing-schema adoption plus
repeat migration execution. Preserve IDs, full text, timestamp precision and
identity sequence; retain transaction/row-lock CLI semantics. The existing
Astro release must remain able to read/write the retained schema for rollback.
Compose web startup never applies migrations or mounts operator secrets.
