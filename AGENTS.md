# AGENTS.md

The operating manual for every agent (and human) working on dunamismax.com.
Read all of it, then **Now** in [BUILD.md](BUILD.md), then the `docs/` pages for
the area you will touch. When this file and BUILD.md disagree about *how* to
work, this file wins; about *what* is done or decided, BUILD.md wins. Older
notes in `docs/migration.md` and BUILD's release history are evidence, not
instructions.

> **No AI attribution, ever.** No `Co-Authored-By` trailers, no "Generated
> with ..." lines, and no credit to Claude, Anthropic, ChatGPT, OpenAI or any
> AI tool in commit messages, tags, release notes, code, comments, docs or file
> headers. Commits use the owner's configured git identity. See
> [section 5](#5-git-rules).

Contents:

1. [What this site is](#1-what-this-site-is)
2. [Roles and autonomy](#2-roles-and-autonomy)
3. [Session workflow](#3-session-workflow)
4. [Working with BUILD.md](#4-working-with-buildmd)
5. [Git rules](#5-git-rules)
6. [Parallel sessions](#6-parallel-sessions)
7. [Architecture and conventions](#7-architecture-and-conventions)
8. [Quality gates](#8-quality-gates)
9. [Deployment and operations](#9-deployment-and-operations)
10. [Security and privacy](#10-security-and-privacy)
11. [Documentation](#11-documentation)
12. [Toolchain versions](#12-toolchain-versions)
13. [Known pitfalls](#13-known-pitfalls)
14. [Context7 documentation lookup](#14-context7-documentation-lookup)

---

## 1. What this site is

Stephen Sawyer's (`dunamismax`) personal portfolio and blog at
https://dunamismax.com. It shows his projects, an about page, contact links and
plain-text posts. It is small on purpose: a script-free, server-rendered
SvelteKit site that reads published posts from PostgreSQL and is self-hosted on
the owner's Ubuntu server behind Caddy.

Priorities, in order. Use them to settle any question:

1. **Honest.** Every status, stack or deployment claim, on the site or in these
   docs, is backed by evidence. Other projects' claims follow
   [docs/portfolio.md](docs/portfolio.md). Never invent a completed check or a
   deployed outcome.
2. **Private.** Drafts, credentials, addresses, keys, backup locations and
   private sources never reach the site, a build artifact, a log or the repo.
3. **Preserved.** Approved copy, branding, public URLs, project anchors,
   metadata, contact links and the stylesheet change only on purpose.
4. **Script-free and accessible.** Zero browser JavaScript, semantic HTML, skip
   links, `aria-current`, both color schemes, mobile layout.
5. **Small.** No feature, dependency or service without a real need.

### Non-goals

Do not build these, and push back on anything that drifts toward them:

- Public admin, forms, accounts, comments, tracking, analytics, external fonts
  or third-party assets.
- Browser JavaScript on the site, or any new public API.
- Another framework change, a second proxy, SQLite, Litestream or a hosted
  database (D-1, D-2, D-7 in BUILD.md).
- Python or Swift code without a concrete project need or explicit request
  (D-6).
- Cloudflare DNS challenges, Caddy DNS plugins, API tokens or proxy/SSL-mode
  changes (D-5).

---

## 2. Roles and autonomy

**The owner** (dunamismax) decides copy and branding, what other projects are
shown and how, releases, anything on the shared host beyond this site, DNS, and
anything involving money, accounts or credentials.

**Agents** do the engineering: code, tests, refactors, docs and BUILD.md
bookkeeping within the settled decisions.

### Decide it yourself

Make the call, record it in BUILD.md if a future session would wonder, and
keep going:

- Code structure, naming, tests, helper scripts and internal refactors.
- Tailwind utilities and markup for new presentation that keeps the preserved
  stylesheet and the approved look.
- Wording in README, BUILD, AGENTS and `docs/` (not the site's public copy).
- Splitting, adding or rewording unchecked BUILD.md steps to match real work.
- Read-only inspection of production over `ssh root@ubuntu-vm` (service state,
  release links, Caddy site files, logs) to gather evidence.

### Owner gates

Get the owner's explicit approval in the current conversation, for each
separate action:

- Committing and pushing `main` (once approved, push right away, see
  [section 5](#5-git-rules)).
- Deploying a release or changing anything on the host.
- Changing public copy, branding, URLs, anchors, metadata or contact links,
  except this site's own stack card and footer colophon, which track its real
  stack.
- Changing another project's card without fresh evidence in
  `docs/portfolio.md`.
- Changing a settled decision (`D-n`) or lowering an acceptance criterion.

### Hard limits

Nothing above loosens these:

- `main` only, never force-push, never change git config.
- Deploy only this site. Never restart shared PHP-FPM, MySQL, PostgreSQL or
  Caddy, and never modify sibling sites.
- Never change Cloudflare settings.
- No credentials, post exports or drafts in the repo, a build or a log.
- Never run `drizzle-kit push`, `pull` or `migrate` against a real database.
- Never restore an old dump or the frozen MySQL database over live PostgreSQL
  data.
- Releases only move forward. If a release breaks the site, fix it in a new
  commit and deploy that; never point `current` at an older release.

### When you are blocked

Finish everything up to the gated step, record exactly what remains in BUILD.md
**Now** (or a `Remaining:` line under the step), and say what you need in your
report. Never tick a box that is not done.

---

## 3. Session workflow

### Start of session

1. `git status --short --branch`, `git log -5 --oneline --decorate` and
   `git remote -v`. Confirm `user.email` is the owner's dunamismax address and
   stop if it is not. Preserve unrelated work in the tree.
2. If the tree is clean, `git pull --ff-only origin main`.
3. Read **Now** in BUILD.md, then the `docs/` pages for the area you will touch
   ([section 11](#11-documentation)).
4. The owner's request comes first. Otherwise take **Next step** in **Now**.
5. For code changes, run the gates first ([section 8](#8-quality-gates)). If
   the baseline is red, fixing it is the first task.

### While working

- Small, verified steps. Each commit leaves `main` working.
- Write or update tests with the change. `tests/http.ts` pins page content
  (project counts, featured cards, headers, private paths), so keep it in step.
- Look up SvelteKit 3, Svelte 5, Tailwind CSS 4, Drizzle and Vite in current
  documentation ([section 14](#14-context7-documentation-lookup)); they differ
  from older tutorials.

### Finishing a step

1. The gates for the change pass ([section 8](#8-quality-gates)).
2. BUILD.md is updated in the same commit: ticks, `Evidence:` or `Remaining:`,
   **Now**, and a handoff entry.
3. Docs the change affects are updated (README, `docs/`, this file).
4. `git status` shows no stray files and nothing `.gitignore` excludes.
5. With the owner's approval, commit and push (see [section 5](#5-git-rules)).

### End of session

Report what changed, what was verified (and what was not), what is committed,
pushed or deployed, and what waits on the owner.

---

## 4. Working with BUILD.md

BUILD.md is the record of where the site stands and how it got there.

- **Now** is the first thing a session reads. Keep its rows current: current
  work, next step, in progress, open items, live site, `main`, last updated.
- **Settled decisions** (`D-n`) are the owner's. Build on them; change one only
  with the owner, and record the change and date.
- **Open questions** (`Q-n`) each carry a default. Use the default rather than
  wait, and say so.
- **Steps** have an ID (`M.n` for maintenance work), **Done when** criteria and,
  once verified, an `Evidence:` line (commit and checks actually run, one or two
  sentences). Partial work stays unchecked with a `Remaining:` line.
- **Local records and release records are separate.** A local check never
  proves a deployment. A release record lists, each on its own evidence: source
  commit and verified GitHub and Codeberg tips, pre-release backup and restore,
  candidate checks, cutover, service and listeners, schema and privileges,
  the live revision (`/healthz` and `web-live`), public HTTPS and privacy
  checks, post-release backup.
- **History is not rewritten.** Dated release records, Phase 0 and Phase 1 and
  `docs/migration.md` stay as written. Add new dated records instead.
- **Handoff log:** prepend one short entry per session (date, step IDs, what
  changed, checks actually run, next action). Keep the newest eight.

---

## 5. Git rules

These are the owner's standing instructions and override any other workflow,
including your tooling's defaults.

- **`main` only.** Never create branches, worktrees or pull requests.
- **Commit when the owner asks**, then push right away with
  `git push origin main`. `origin` has two push URLs (GitHub and Codeberg), so
  one push updates both. Verify both remote tips after a release push.
- **Before committing:** run the gates for the change, check `git status`, stage
  every intended file (including files edited after a rename) and nothing
  `.gitignore` excludes.
- **Messages:** a short imperative summary line, then a brief body saying what
  changed and why.
- **No AI attribution anywhere** (see the top of this file). Re-read the message
  before committing and remove any trailer your tooling adds. Content the site
  deliberately publishes about AI is a disclosure, not attribution.
- Never force `main`, never change git config, never commit secrets.

---

## 6. Parallel sessions

The owner may run several sessions in this checkout at once, and they may leave
uncommitted work.

- Commit only your own files: `git commit -- <paths>`, or stage hunks when a
  file mixes your edits with someone else's. Never revert, reformat or "clean
  up" work you did not make.
- Re-read a shared file (BUILD.md, README.md, AGENTS.md, `docs/portfolio.md`,
  `src/lib/projects.ts`) right before editing it, and keep edits small.
- If someone else's edits break the gates, verify your change in a scratch copy
  of `main` plus your files, and say so in the handoff.
- One session at a time changes the schema (`src/db/schema.ts`, `drizzle/`) or
  runs a release.

---

## 7. Architecture and conventions

[docs/architecture.md](docs/architecture.md) explains the design. The rules:

### Stack

SvelteKit 3 · Svelte 5 · strict TypeScript · Tailwind CSS 4 · PostgreSQL 18 +
Drizzle ORM (node-postgres) · Node via `@sveltejs/adapter-node` · Caddy. No
further framework change (D-1). Configuration lives in `vite.config.ts`
(SvelteKit 3 no longer reads `svelte.config.js`); `$lib` is replaced by the
`#lib/*` package import. Static-only projects elsewhere can be served by Caddy
directly; this database-backed blog keeps Node server rendering.

### Rendering and styling

- Zero browser JavaScript: `csr = false` in `src/routes/+layout.ts`. No inline
  scripts, inline styles or event handlers; the CSP forbids them.
- Prerender genuinely static pages (About, Contact, Projects). Home, Blog,
  posts and RSS query PostgreSQL on each request.
- The preserved stylesheet is `src/styles/site.css`, compiled by Tailwind CSS 4
  through `src/app.css` with no preflight and served at `/css/site.css`. Use
  Tailwind utilities in `.svelte` markup for new styling.
- Theme follows `prefers-color-scheme`. Preserve skip links, `aria-current`
  and the CSP.

### HTTP boundary

`bin/server.ts` applies methods (GET/HEAD only), headers, cache policy and the
public path allowlist before adapter-node's handler (`dist/web/handler.js`).
adapter-node serves static and prerendered files before `src/hooks.server.ts`
runs, so anything that must apply to every response belongs in `bin/server.ts`.
`/_app` and prerendered `__data.json` paths stay 404. Canonical URLs use
`APP_URL`, never the request Host header.

The security headers, allowed methods and refusal message have one definition,
`src/lib/http.ts`, used by both `bin/server.ts` and the hook; the slug grammar
is `SLUG_PATTERN` in `src/lib/validation.ts`. Cache policy is the
`cachePolicy` table in `bin/server.ts`; anything not listed is no-store.
`tests/http.ts` pins the header values and the cache policy on purpose, so a
change to either needs the test changed with it.

### Data and publishing

- `src/db/schema.ts` is the schema source; `drizzle/` holds reviewed SQL
  migrations, with grants as appended custom SQL. Change the schema with
  `pnpm exec drizzle-kit generate --name=NAME`, review the SQL, then
  `pnpm run db:check` and the rehearsal. Keep migrations additive: the
  previous release keeps serving while the new one is checked, and releases
  only move forward, so every migration must leave the running release working.
- `bin/schema.ts` is the only applier. It adopts a pre-Drizzle database only
  when its catalog equals `database/baseline-catalog.json`; never edit that file
  to make adoption pass.
- Visibility lives in `app.public_posts` (published and due by the database
  clock). The web role cannot SELECT `app.posts`. No build, timer or cache is
  needed for scheduled posts, and post data is never baked or cached.
- Posts are plain text, escaped in HTML and in both RSS encoding layers.
- Publishing uses its own role and config (`publishing.env` on the host,
  `POSTS_CONFIG` locally). Edits preserve slug, status and date; scheduling
  needs an explicit offset and a future database time. Never use website
  credentials for writing, and never log credentials or post bodies (Drizzle
  query errors embed parameters).
- Outages are honest: Home stays 200 with an unknown count; Blog, posts and RSS
  return 503 with `Retry-After: 60` and no-store; static pages stay up.
  `/healthz` reports readiness for the deploy: `200`
  `{"status":"ok","revision":"<commit>","database":"ok"}` after a real query as
  the web role, `503` when PostgreSQL cannot answer. `revision` comes from the
  release's `REVISION` file.

### Portfolio

Every card comes from the typed inventory in `src/lib/projects.ts`, rendered by
`src/lib/components/ProjectCard.svelte`. Before changing another project's
status, stack or description, recheck its running service, its repository docs
and its public HTTPS response, and record the evidence in
[docs/portfolio.md](docs/portfolio.md). Update the counts and names in
`tests/http.ts` in the same change.

### Conditional technologies

Python (uv, Ruff) and Swift (SwiftUI, calling SvelteKit HTTPS endpoints) are
used only for a real need or explicit request; record their actual versions
and build commands then. Existing TypeScript operator tools stay TypeScript.
Client-side Svelte, form actions, remote functions, Better Auth and the AI SDK
are available only for a needed feature, never speculatively. Containers are
optional and must not add a proxy or expose PostgreSQL.

---

## 8. Quality gates

| Change | Run |
| --- | --- |
| Any code, dependency or content change | `pnpm run check`, `pnpm run db:check`, `pnpm run test`, `APP_ENV=production pnpm run build` |
| Data, schema, server, publishing or HTTP behavior | the above plus `bash deploy/rehearse.sh` |
| Shell scripts | `for f in deploy/*.sh; do bash -n "$f"; done` and `shellcheck -x deploy/*.sh` |
| Presentation | browser review at 320, 375, 768 and 1440 px in light and dark, no horizontal overflow, no `<script>` in output |
| Every change | `git diff --check` |

The rehearsal builds a disposable PostgreSQL cluster (never your normal
database) and tests real role privileges, the CLI, scheduling, and HTTP
populated, outage and recovered. On macOS:

```sh
LC_ALL=en_US.UTF-8 PGBIN=/opt/homebrew/opt/postgresql@18/bin bash deploy/rehearse.sh
```

Set `TEST_PGPORT` if 55431 is taken and `TEST_WEB_PORT` if 4322 is.
`make verify` runs every gate in the table in order (it sets `PGBIN` and
`LC_ALL` for Homebrew's PostgreSQL 18 when they are unset). CI (`.github/workflows/verify.yml`) runs
the same gates (including the shell checks) plus
`pnpm audit --audit-level=moderate` on every push to `main` and weekly, with no production credentials; it never deploys. Do not weaken a
check to make a change pass.

---

## 9. Deployment and operations

Read [docs/production.md](docs/production.md) and the shared host contract,
`/home/sawyer/github/ubuntu-vm-backup/docs/web-platform.md` on the VM (or its
successor), before any release. Pushing does not deploy.

| Item | Convention |
| --- | --- |
| Runtime | `deploy/dunamismax.service`, user `dunamismax-web`, `/opt/node-26/bin/node` (Node 26.13.1) |
| Listener | `127.0.0.1:4311`; the candidate takes the first free port in 4400–4499 |
| Caddy | `/etc/caddy/Caddyfile` imports `/etc/caddy/sites/dunamismax.com.caddy`; template `deploy/Caddyfile`; binary `/usr/local/lib/caddy/caddy` |
| PostgreSQL | native loopback service; database `dunamismax`, schema `app`; owner, web, publishing and migration roles |
| Credentials | `/etc/web-apps/dunamismax/{web,publishing,migration}.env`, one per identity; systemd loads only `web.env` |
| Releases | `/srv/www/dunamismax.com/releases/<commit>`, atomic `current` symlink |
| Lock | shared `/run/web-deploy/lock` through `with-deploy-lock` (descriptor 9) |
| Journal | `drizzle.__drizzle_migrations`, owner-only; production adopted at `e1c292c` |
| Build work | `/home/sawyer/web-work/dunamismax.com-<commit>/` (`src/` and the assembled `release/`) |
| Pre-migration dumps | `/var/backups/dunamismax.com/pre-migrate-<commit>.dump` (root, 0600) |

Release rules:

- Fix forward only; the host contract (section 8) is the flow.
  `deploy/build.sh` builds and checks `origin/main` from `git archive` as
  sawyer, outside the lock. `deploy/deploy.sh COMMIT` then runs as root in one
  `with-deploy-lock` process: stage, pre-migration dump and migration as the
  service account, candidate on the new unit file, switch, verify, Caddy only
  if the fragment changed, record. Never nest the lock or recreate it;
  `deploy.sh` verifies descriptor 9.
- A failure before the switch leaves the previous release serving. A failure
  after it means the new release is live and unhealthy: read
  `journalctl -u dunamismax`, fix it in a new commit and deploy that. Never
  repoint `current`, restore an old unit or fragment, or keep copies "to go
  back".
- Take and verify a fresh host backup (`bin/backup`, `restore check`,
  `restore postgres-verify`) before cutover. A timer's exit status alone is not
  restore evidence.
- Keep immutable commit releases (older ones are evidence, expired by
  `server-disk-cleanup`, not a way back) and the installed backup timers. Remove obsolete checkout code
  only after confirming recovery needs, and confirm what legacy material is
  retained in the current host contract, not from old acceptance notes.
- Before a future schema cutover: rehearse nonempty data in isolation, exclude
  concurrent publishing, and reconcile counts and full-content SHA256.
- DNS is owner-managed, DNS-only Cloudflare records pointing at the server;
  Caddy gets its own Let's Encrypt certificates. Check shared prerequisites
  without replacing the shared Caddy binary or restarting shared services.
- After a release, verify the live `current` link, service, listeners, public
  HTTPS behavior and backups yourself, and record them in BUILD.md.
- Write the release record in the same session as the cutover. The build
  keeps `rehearsal.log` in its work directory; the deploy prints the schema
  step, privilege report, candidate and production HTTP counts and the
  `web-live` line, and logs `web-deploy` to the journal. Nothing else is
  saved, so copy that output into the record when you run it.

---

## 10. Security and privacy

- The web process is read-only and gets only `web.env`. It cannot read the
  private table, write, run DDL or become another role.
- Builds never receive database credentials or post exports, and never run
  migrations. Web startup never runs migrations.
- Never serve a checkout, source, credentials or the complete server build as
  a webroot.
- `dunamismax-posts list` and `show` print private content: trusted terminals
  only, never in a log, commit or report.
- Never put credentials on command arguments or in diagnostic output.
- Never publish private sources, addresses, keys, backup locations, record IDs
  or drafts in portfolio copy or docs.

---

## 11. Documentation

| File | Holds |
| --- | --- |
| [README.md](README.md) | What the site is, its stack, routes, layout and how to develop it |
| [BUILD.md](BUILD.md) | Where the site stands: Now, decisions, open questions, steps, release history, handoff log |
| [docs/architecture.md](docs/architecture.md) | Design: HTTP boundary, rendering, schema, roles, migrations |
| [docs/content.md](docs/content.md) | Editing pages and the portfolio, and publishing posts |
| [docs/production.md](docs/production.md) | Host layout, fix-forward release and verification runbook |
| [docs/portfolio.md](docs/portfolio.md) | Dated evidence behind every portfolio claim |
| [docs/migration.md](docs/migration.md) | Historical October 2026 PHP-to-Astro acceptance |

Durable operating guidance belongs in `docs/`, status and evidence in
BUILD.md, conventions and recurring pitfalls in this file. Do not add other
agent, prompt or continuity files.

---

## 12. Toolchain versions

Pinned exactly at the host baseline (`ubuntu-vm-backup/config/web-platform.json`);
install with `pnpm install --frozen-lockfile`, never `--force` or peer
workarounds. `pnpm-workspace.yaml` sets `saveExact` and `engineStrict`; on the
VM run every build command through `node-26` (for example `node-26 pnpm run check`).

| Tool | Version |
| --- | --- |
| Node | 26.13.1 (`.node-version`, `engines.node`) |
| pnpm | 12.18.0 (`packageManager`) |
| SvelteKit | 3.4.0 |
| Svelte | 5.58.1 |
| Vite | 8.3.8 |
| @sveltejs/adapter-node | 6.0.5 |
| Tailwind CSS | 4.3.5 (`@tailwindcss/vite`) |
| TypeScript | 6.0.3, strict with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` |
| drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 |
| pg / @types/pg | 8.23.1 / 8.23.1 |
| PostgreSQL | 18 (production 18.6) |

When a version changes, update `package.json`, the lockfile, this table and
README in the same commit.

---

## 13. Known pitfalls

- SvelteKit 3 passes routine 404s to `handleError`; the hook logs only
  `kind === 'unknown'` errors, so a 404 is not an error line.
- adapter-node serves static and prerendered files before the hook runs; header
  and path rules live in `bin/server.ts`.
- Headers set by a prerendered `+server.ts` endpoint (`robots.txt`, the
  manifest, the stylesheet) are dropped: only the body is written to disk. Put
  cache policy for such paths in `cachePolicy` in `bin/server.ts`.
- `.astro/` stays in `.gitignore` so old local build output never dirties the
  VM checkout.
- On macOS the rehearsal needs `PGBIN` and a valid `LC_ALL`.
- A pnpm override in `pnpm-workspace.yaml` pins drizzle-kit's legacy
  `@esbuild-kit` loader to the tree's patched esbuild; recheck it when updating drizzle-kit and drop it once
  that dependency is gone.
- On the VM, run git in `/home/sawyer/github/dunamismax.com` as `sawyer`; as
  root it fails with "dubious ownership". Deployed helpers are mode 0644, so
  invoke them with `bash`.
- A failed `sudo -n` as sawyer does not mean privileged access is unavailable;
  use `ssh root@ubuntu-vm`.
- The full host backup archives every site's build; another site's changed
  build output can fail it (Phase 1 record). Fix the inventory in its owning
  repo rather than skipping the backup.

---

## 14. Context7 documentation lookup

Use Context7 for any library, framework, SDK, API, CLI tool or cloud service,
including familiar ones: syntax, configuration, setup, CLI usage, version
migrations and library-specific debugging. Prefer it to web search for library
docs; skip it for general programming concepts.

1. `resolve-library-id` with the library name and the question, unless you
   already have an exact `/org/project` ID.
2. Pick by exact name, relevance, snippet count, source reputation and
   benchmark score; use a version-specific ID when a version matters.
3. `query-docs` with that ID and the full question.
4. Answer from the fetched docs.

At session end, update this file when you find a durable convention, verified
command or recurring pitfall. Session results and plan changes go in BUILD.md.
