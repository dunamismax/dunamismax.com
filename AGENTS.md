# Repository operating rules

Read this file, `README.md`, `BUILD.md`, and task-relevant `docs/` before changes.
Read `/home/sawyer/github/ubuntu-vm-backup/docs/astro-migration.md` and any
successor shared host contract before server deployment. The November 2, 2026
owner assignment makes `BUILD.md` Phase 0 (Next.js/React/Tailwind/Drizzle/Compose)
the first implementation priority, superseding Astro-only and PHP-only rules.
The November 2 planning change is documentation only. A subsequent rewrite
assignment should implement Phase 0 rather than repeat the planning task.
Use Context7 to resolve library IDs and fetch current documentation before
choosing framework, ORM, styling or deployment APIs/versions.

## Git rules (owner's standing instructions)

These override any other workflow described in this repository or by your tools.

- Work on `main` only. Never create branches, worktrees or pull requests.
  Commit directly to `main` and push with `git push origin main`. `origin`
  pushes to both GitHub and Codeberg, so one push updates both.
- No AI attribution anywhere: no `Co-Authored-By` trailers, no "Generated
  with ..." lines, and no crediting Claude, Anthropic, ChatGPT, OpenAI or any
  AI tool in commit messages, tags, release notes, code, comments or file
  headers. Use the owner's configured git identity and never change git config.
  Content the project deliberately publishes about AI, such as a reader-facing
  disclosure, is not attribution.
- After committing, push `main` right away, at the latest before the session
  ends. Before committing, run the project's checks, review `git status` for
  stray files, and never commit what `.gitignore` excludes.

## Product and content

This is Stephen Sawyer’s (`dunamismax`) personal portfolio and blog. Preserve
approved copy, branding, public URLs, metadata, project anchors and contact
links. Keep other project stack/status claims grounded in their actual runtime
and [portfolio evidence](docs/portfolio.md). Update this site's public stack copy
with the verified rewrite; receiving a migration prompt does not establish that
sibling projects migrated. Preserve unrelated profile copy. Do not publish private
sources, addresses, keys, backup locations or drafts. No public admin, forms,
accounts or tracking. Allow only framework scripts needed by the target stack.

## Implementation and target stack

- Current implementation until Phase 0: Astro 7.4.2 / Node adapter 11.1.9,
  TypeScript 6.0.3, node-postgres, vanilla CSS and no browser scripts. Document
  current and planned state separately; none of the planned files exist yet.
- Target: Next.js App Router + React + Tailwind, selected local shadcn/ui
  components, PostgreSQL + Drizzle, and Docker Compose. Next output must be
  `standalone`, running generated `server.js` as an ordinary Node server.
  No Vercel-specific hosting requirement. No Better Auth, Stripe, AI SDK, Tauri
  or Expo unless a later feature needs logins, payments, LLMs or native clients;
  future clients use server APIs rather than direct database access. No Clerk.
- Keep strict TypeScript with noUncheckedIndexedAccess and
  exactOptionalPropertyTypes. Pin Node 24.22.1 / npm 11.19.1 and exact compatible
  dependencies; use `npm ci`. Document any necessary coordinated toolchain change.
- Preserve semantic HTML and the existing visual design, prefers-color-scheme,
  skip links and aria-current. Server Components by default; no unnecessary
  interactivity or remote assets. Replace zero-script expectations with tested
  framework-only, nonce-protected CSP. No production unsafe-inline/unsafe-eval
  or inline style attributes. Nonce-bearing HTML is request-rendered; About,
  Contact and Projects remain DB-independent rather than necessarily prerendered.
- Query current PostgreSQL for home/blog/posts/RSS without build-time or
  cross-request post caching. Never bake drafts, exports or credentials into
  builds, image layers, browser bundles or RSC payloads.
- Posts stay plain text, escaped in HTML and in both RSS encoding layers.
- Publication visibility lives in `app.public_posts`: published and due according
  to the database clock. Web cannot SELECT the underlying private table.
- Publishing uses its own PG role/config; edits preserve slug/status/date,
  scheduling requires an explicit offset and future database time. No credentials
  or post bodies in diagnostic logs. Do not use website credentials for writing.
- Preserve GET/HEAD-only behavior, private-path 404/noindex, canonical origin,
  honest home fallback and real blog/RSS 503/Retry-After/no-store responses.
  Replace `bin/server.ts`/Astro middleware with a tested Next response boundary;
  static assets and streamed errors must not bypass methods, status or headers.
- Drizzle owns TypeScript schema and reviewed SQL migrations, including the
  publication view/ACLs. Adopt the existing database without reimporting MySQL,
  destructive resets or schema writes from the web role. Keep migration and
  publishing tools separate from web startup and its image/credentials.

## Deployment layout (current and planned)

See `docs/production.md` for the current settings and the Phase 0 target. Reuse
the existing host and database; do not migrate sibling applications in this repo.

| Item | Current | Phase 0 target (not installed) |
| --- | --- | --- |
| Runtime definition | `deploy/astro-dunamismax.service` | Root `Dockerfile` and `compose.yaml`; project `dunamismax`, service `web`, explicit `publisher`/`migrate` tools |
| Caddy | `/etc/caddy/Caddyfile` imports `/etc/caddy/sites/dunamismax.com.caddy`; template `deploy/Caddyfile` | Same host Caddy and site fragment; proxy `127.0.0.1:4311`, www-to-apex redirect |
| Ports/network | Web `127.0.0.1:4311`, candidate 4323, native PG `127.0.0.1:5432` | Linux host networking, `HOSTNAME=127.0.0.1`, same web/PG ports; no Compose `ports` in host mode; check candidate availability |
| Database/roles | `dunamismax`, schema `app`; `dunamismax_{owner,web,publishing,migration}` | Same data/roles; Drizzle baseline and migrations, least privilege |
| Secrets | `/etc/astro-apps/dunamismax/{web,publishing,migration}.env` | Retain protected paths; one matching env file per service/tool; none during build |
| Release identity | `/srv/www/dunamismax.com/releases/<commit>` and atomic `current` | Same release tracking plus immutable container image digest; retain Astro rollback |

Never assume a bridge container's localhost is the host PostgreSQL. Production
uses Linux host networking to retain the existing loopback-only native database
without a shared service change; document a separate Mac/dev setup. New app port
allocation and Caddy routes require the shared host inventory, not a guessed port.
Use the custom Caddy Cloudflare DNS plugin with a zone-scoped Caddy-only token,
Full (strict) for proxied DNS, and nightly verified off-server pg_dump backups.
Do not install a second proxy or a PostgreSQL container for this site's production.

## Deployment and safety

Deploy only this site; never restart shared PHP-FPM, MySQL, PostgreSQL or Caddy.
Use `/usr/local/lib/caddy/caddy`, not `/usr/bin/caddy`. Build/test isolated
candidates before taking `/run/astro-deploy/lock` via `with-deploy-lock`.
Authorized privileged SSH is available with `ssh root@ubuntu-vm`. A failed
`sudo -n` as sawyer does not establish that privileged access is unavailable.
Hold it for the entire privileged transaction, including rollback. Never nest
it or recreate the lock. Root-only scripts in `deploy/` verify descriptor 9.
Current Node listens on 127.0.0.1:4311 as `astro-dunamismax-web`; systemd loads
only `/etc/astro-apps/dunamismax/web.env`. Target containers remain unprivileged
with separate web/operator credentials. Publishing uses an independent identity.
Invoke deployed shell helpers with `bash`: release files are mode 0644.
Do not serve a checkout, source, credentials or the complete server build as
webroot. Keep immutable commit releases and atomic current symlinks.

Before Next cutover: verify backup/restore, rehearse a nonempty PostgreSQL
restore/baseline in isolation, exclude publishing during migration and reconcile
counts/full-content SHA256. Keep the preceding Astro release, image/configuration
checkpoints and existing backup timers available. Recheck legacy retention with
the shared host contract; never infer current PHP/MySQL service state from old
acceptance notes. Code rollback must preserve newer PostgreSQL writes; never
roll back to divergent MySQL. Retire obsolete checkout code only after parity.

## Verification and repository hygiene

Until Phase 0, run `npm run check` (Astro plus TypeScript), `npm test`,
`npm run build`, and `bash deploy/rehearse.sh` for application/data changes.
Rehearsal uses a disposable
`_test` database and tests real PostgreSQL privileges, CLI, scheduling and
HTTP outage/recovery. Port these gates to Next/Drizzle and the actual built
container, including adopted/fresh migrations, RSC privacy, strict CSP and
before-stream status checks; see BUILD Phase 0. Run `bash -n` and
`shellcheck -x deploy/*.sh` for shell.
Review browser layout at mobile/desktop widths and both color schemes when
changing presentation. Always run `git diff --check`.

Keep README focused on product/development, BUILD on verification/status,
and durable operational guidance under docs. Do not add extra agent/prompt
or continuity files. Do not invent completion or deployed outcomes.

## Git

Inspect status, branch and remotes first; pull main with `--ff-only` before
substantial work when clean. `origin` dual-pushes to GitHub and Codeberg.
Commit/push/deploy only with the owner’s authorization; the former Astro
migration's authorization is not a new production release approval. Use the
configured dunamismax author; stop if user.email is not dunamismax-owned.
Never force main or add assistant/co-author
attribution. Verify actual remote tips and production state after releasing.
