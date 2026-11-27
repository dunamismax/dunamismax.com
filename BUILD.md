# BUILD.md

Where dunamismax.com stands, what is decided, what is next, and the evidence
for every release. Start with **Now**. [AGENTS.md](AGENTS.md) says how to work;
this file records what is done.

## Now

| | |
| --- | --- |
| **Current work** | Maintenance. Every planned phase is complete. M.7 (two retired game projects removed from the portfolio) is live at `a1be687`. M.6 (five portfolio cards corrected against the live host) is live at `1e324bc`. M.5 (host web-platform contract: pnpm 12.18.0, Node 26.13.1, baseline pins, fix-forward deploy with a candidate check) is live at `f2cb23c`. No feature work is planned. |
| **Next step** | None planned. The open items below wait on the owner. |
| **In progress** | Nothing claimed. |
| **Open items** | Public copy outside the project cards is still the owner's call: Home says "eight public websites" (the host serves seven public websites and three `noindex` previews), and About lists Alembic; RiverMind's table server is TypeScript now ([portfolio evidence](docs/portfolio.md)). |
| **Live site** | https://dunamismax.com. `/srv/www/dunamismax.com/current` → `a1be687`, `dunamismax` active on `/opt/node-26/bin/node`. Last recorded release: `1e324bc` → `a1be687`, November 27, 2026 at 00:35 UTC ([record](#retired-projects-removed-november-27-2026)). |
| **`main`** | `a1be687` plus this release record, pushed to GitHub and Codeberg. |
| **Last updated** | 2026-11-27 |

## How to use this file

1. **Orient.** Read **Now**, then AGENTS.md. Check `git status --short --branch`
   and `git log -5 --oneline`; preserve unrelated work.
2. **Choose.** The owner's request comes first. Otherwise take **Next step**.
3. **Claim.** Put the step ID, a one-line goal and the date under
   **In progress**. One step at a time; parallel sessions claim different steps.
4. **Build and verify.** Meet every **Done when** criterion through the real
   entry point (the built server, the rehearsal, the live site) as well as the
   [gates](#gates).
5. **Record.** Tick what is verified and add an `Evidence:` line (commit and
   checks run, one or two sentences). Partial work stays unchecked with a
   `Remaining:` line.
6. **Advance.** Update **Now**, then prepend a [handoff](#handoff-log) entry.

You may split, add or reword unchecked steps; say why in the handoff. Do not
delete unfinished steps, lower criteria or change a settled decision without
the owner. Release records are dated and never rewritten; local records and
release records stay separate.

## Settled decisions

Decided with the owner. Build on them; change one only with the owner, and
record the change here with the date.

| ID | Decision |
| --- | --- |
| D-1 | **Stack** (owner, 2026-11-20): SvelteKit 3 · Svelte 5 · TypeScript · Tailwind CSS 4 · PostgreSQL 18 + Drizzle ORM · Node (adapter-node) · Caddy, replacing Astro (Phase 1). No further framework change. |
| D-2 | **Data** (owner, 2026-11-02): PostgreSQL is authoritative for posts. `src/db/schema.ts` and reviewed `drizzle/` migrations are the only schema source; `bin/schema.ts` is the only applier (Phase 0, live since `e1c292c`). No SQLite, Litestream or hosted database. |
| D-3 | **Script-free site:** zero browser JavaScript (`csr = false`), semantic HTML, the preserved stylesheet compiled by Tailwind CSS 4 without preflight, the existing CSP. |
| D-4 | **Posts:** plain text, published through the independent publishing role and CLI. Visibility is the database-clock view `app.public_posts`; no rebuild, timer or cache for scheduled posts. |
| D-5 | **Hosting** (owner, 2026-11-02): self-hosted on the owner's Ubuntu server under systemd, behind the shared custom Caddy, with immutable releases and the shared deployment lock. DNS is owner-managed, DNS-only Cloudflare records; Caddy gets its own Let's Encrypt certificates. No DNS challenge, Caddy DNS plugin, token or proxy mode. Production runs as a systemd unit on `/opt/node-26/bin/node`, never in a container (owner, 2026-11-21, host web-platform contract); containers only for local development and tests. Releases fix forward: each is checked as a candidate before it takes traffic, and there is no way back to an older release (owner, 2026-11-21). |
| D-6 | **Python and Swift** only for a real project need or explicit request. Existing TypeScript operator tools stay TypeScript; no native app is planned. |
| D-7 | **Superseded:** the Next.js rewrite and the SQLite plan do not apply. |
| D-8 | **No public writes:** no admin, forms, accounts, tracking or new public API. |
| D-9 | **Releases** need the owner's authorization each time, and a fresh verified host backup before cutover. |

## Open questions

Use the default until the owner decides otherwise.

| ID | Question | Default until decided |
| --- | --- | --- |
| Q-1 | ~~Retire the MySQL migration tooling?~~ | **Decided by the owner, 2026-11-21:** removed in M.5 (`bin/migrate-data.ts`, `migrate:data`, `mysql2`); MySQL is retired on the host and nothing else used them. |
| Q-2 | Prune the retained PHP/MySQL recovery material? | Keep as recovery evidence. Older release directories are expired by the host's `server-disk-cleanup` (it keeps five); they are not a way back. |

## Steps

- [x] **M.1 · Record the `fb9ea59` release.** Production `current` points at
  `fb9ea59` (*Use the current Ubuntu deployment paths and service names*), but
  the last release recorded here is `4fbdc4f`.
  - Done when: a dated release record below gives the evidence that exists for
    that cutover (time, checkpoint, schema step, host backups, service and
    public checks, rollback check), or says plainly which parts were not
    recorded; **Now** is updated.
  - Evidence: [record](#refresh-record-and-deployment-names-november-20-2026),
    written from a read-only host inspection (checkpoints, unit journal,
    candidates, backup history) and GitHub Actions. The inspection found a
    second unrecorded cutover, `4fbdc4f` → `aef964e`, and a host-side unit
    rename between the two; all three are in the record, with a list of what
    was not kept.
- [x] **M.2 · Release the portfolio updates on `main`.** Owner gate.
  `3605c15`, plus any committed portfolio recheck.
  - Done when: a release record below meets the
    [release record contents](#release-record-contents) and **Now** names the
    new live commit.

- [x] **M.3 · Boundary, test and release-evidence maintenance.** Found while
  reviewing the repository for M.1. No page, copy, route, schema or stylesheet
  change.
  - One definition of the HTTP boundary: `src/lib/http.ts` (security headers,
    methods, refusal message) and `SLUG_PATTERN`, used by `bin/server.ts`, the
    hook, the post route and the CLI in place of repeated literals.
  - Cache policy fix: `/robots.txt` and `/manifest.webmanifest` declared a
    five-minute cache in their endpoints, but prerendering drops endpoint
    headers and both were served no-store. `bin/server.ts` now sets it.
  - Tests: `tests/http.ts` pins the four security headers and the cache
    policy on eleven paths and a refused method (the checks each release did
    by hand); four new unit tests cover the portfolio inventory's structure,
    the slug grammar, the boundary constants and the date and XML helpers.
  - Release evidence: `cutover.sh` keeps `schema-step.log` and `completed-at`
    in the checkpoint and `prepare.sh` keeps `.candidate-rehearsal.log`, so a
    record can be written from files (M.1 could not recover these).
  - Tooling: `rehearse.sh` fails clearly when its web port is taken instead of
    testing whatever answers there, and takes `TEST_WEB_PORT`; `make verify`
    runs every gate; CI runs the shell checks it was documented to run. Home
    reads the latest post and the count in parallel.
  - Done when: every gate passes and the built pages are unchanged.
  - Evidence (local, Node 24.22.3, PostgreSQL 18): baseline
    gates green before the change (6 unit tests; 135 / 132 / 135 HTTP).
    After it, `make verify`: svelte-check 0 errors and 0 warnings, `db:check`,
    10 unit tests, production build, rehearsal 195 populated / 192 outage /
    195 recovered HTTP checks, `bash -n`, shellcheck, `git diff --check`.
    Thirteen responses from the built server compared byte for byte before
    and after: every body identical (the empty feed differs only in its
    build time), headers identical except the two cache headers above, no
    `<script>`. `cutover.sh` and `prepare.sh` run only on the host and are
    covered by syntax and shellcheck alone until M.4.
- [x] **M.4 · Release M.3.** Owner gate.
  - Done when: a release record below meets the
    [release record contents](#release-record-contents), cites the new
    checkpoint and candidate log files, and **Now** names the new live commit.
  - Evidence: owner-authorized; `eeeb06d` → `be15ef5` on November 21, 2026 at
    02:01:52 UTC,
    [record](#boundary-and-release-evidence-maintenance-november-21-2026-utc).
    The schema step and completion time were read from the checkpoint's new
    files and the candidate counts from `.candidate-rehearsal.log`.

- [x] **M.5 · Align with the host web-platform contract.** Owner request,
  2026-11-21; the contract is
  `/home/sawyer/github/ubuntu-vm-backup/docs/web-platform.md`. Tooling only: no
  page, copy, route, schema or stylesheet change.
  - Done when: `bin/web-conformance` passes; pnpm 12.18.0 with a committed
    `pnpm-lock.yaml` (from `pnpm import`), no npm anywhere; Node 26.13.1 in
    `.node-version`, `engines`, CI and the unit; `pg` and `@types/pg` 8.23.1,
    `@types/node` 26.6.6; `mysql2`, `bin/migrate-data.ts` and `migrate:data`
    gone; rollback gone (script, checkpoints, pointer, docs) and replaced by
    `deploy/build.sh` and `deploy/deploy.sh`; `/healthz` reports the release's
    `REVISION` and a real database check; the gates pass on Node 26; the first
    deploy with the new flow serves the commit from `/opt/node-26`.
  - Evidence: `1546441` and `f2cb23c` (release dependencies installed fresh:
    20 MB release instead of 147 MB); `web-conformance` conforms; released
    `be15ef5` → `f2cb23c` on November 21, 2026 at 15:39:56 UTC,
    [record](#host-contract-alignment-november-21-2026).

- [x] **M.6 · Correct portfolio cards that drifted.** Owner request,
  2026-11-21, after every site moved to the host contract: check the projects
  page against the repositories and the live server and fix what is no longer
  true. Card text only; no markup, route, schema or stylesheet change.
  - Done when: each changed card has dated evidence in
    [docs/portfolio.md](docs/portfolio.md); the counts in `tests/http.ts`
    still hold (15 cards, 6 featured); the gates pass; a release serves the
    corrected cards.
  - Changed: RiverMind Poker (its table server is TypeScript inside the
    SvelteKit service, Python trains the bots), Grace & Footnotes (one theme
    script, not zero JavaScript), Field Cadence (deployed as a development
    preview, not "nothing deployed"), Day by Word (the web version runs on
    SvelteKit and PostgreSQL at daybyword.com as a preview), C From The Ground
    Up (38 lessons in six parts, not 35 in five).
  - Evidence: `1e324bc` (cards and the dated evidence in
    `docs/portfolio.md`); gates and rehearsal passed; released `f2cb23c` →
    `1e324bc` on November 21, 2026 at 19:03 UTC,
    [record](#portfolio-corrections-november-21-2026).

- [x] **M.7 · Remove the two retired game projects.** Owner request,
  2026-11-27: two game projects were retired and taken off the host; remove
  every mention from the site.
  - Done when: their cards, featured places and Home, About and Projects copy
    are gone, with dated evidence in [docs/portfolio.md](docs/portfolio.md);
    `tests/http.ts` holds 13 cards and 6 featured; the gates pass; a release
    serves it.
  - Changed: Games & play holds RiverMind Poker alone; Grace & Footnotes and
    C From The Ground Up take the two featured places; Home, About and
    Projects copy no longer claim a Go game server. This step is an owner
    request, so the copy gates are met.
  - Evidence: `a1be687`; gates and rehearsal passed; released `1e324bc` →
    `a1be687` on November 27, 2026 at 00:35 UTC,
    [record](#retired-projects-removed-november-27-2026).

### Release record contents

Every release record lists, each on its own evidence: source commit and both
remote tips; `deploy/build.sh` results (gates and `rehearsal.log` counts);
pre-release backup (D-9) where taken; the deploy's time, pre-migration dump,
schema step, journal count and privilege report; candidate port, `/healthz`
and HTTP checks; production `/healthz`, HTTP checks and the `web-live` line;
independent checks (unit state, user, Node binary, loopback listeners, failed
units, clean unit journal, public HTTPS, CSP, no `<script>`, www redirect,
sibling sites 200); post-release backup and `applications-verify` where run.

From M.5 on the build keeps `rehearsal.log` in its work directory and the
deploy prints everything else (and logs `web-deploy` to the journal). Nothing
else is saved: copy the output into the record as you run it.

## Phase overview

- [x] **PHP → Astro/PostgreSQL** (October 22, 2026, `c93aaec`). Historical;
  [docs/migration.md](docs/migration.md).
- [x] **Phase 0 · Drizzle on the existing PostgreSQL** (November 2, 2026,
  `e1c292c`). The Astro direction is superseded; the Drizzle adoption is live.
- [x] **Phase 1 · SvelteKit stack migration** (November 20, 2026, `064bca5`).
- [x] **Portfolio refresh** (November 20, 2026, `4fbdc4f`). Fifteen cards in
  five groups.
- Maintenance (**M.n** steps above).

## Gates

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run db:check
pnpm run test
APP_ENV=production pnpm run build
bash deploy/rehearse.sh
for f in deploy/*.sh; do bash -n "$f"; done
shellcheck -x deploy/*.sh
git diff --check
```

`make verify` runs all of them after `pnpm install --frozen-lockfile` (on the VM, run each through `node-26`). On macOS set `PGBIN` to the installed PostgreSQL bin directory and `LC_ALL` to
a valid locale (for example `en_US.UTF-8`) for the rehearsal. Unit tests cover
escaping, Unicode, dates, credentials and RSS. The PostgreSQL suite covers
schema reapplication and adoption, real role restrictions, SQL binding,
draft/future visibility, scheduling without builds, the transactional CLI
lifecycle and failed input or config. HTTP checks cover page content and
project counts, landmarks, metadata, methods, HEAD, private paths, pagination,
RSS limits, and outage and recovery against the compiled server. Browser review
covers 320, 375, 768 and 1440 px in light and dark. The HTTP checks also pin
the security headers and cache policy of every response class. CI runs the
same gates plus `pnpm audit --audit-level=moderate`.

Local checks never prove a deployment. Production evidence goes in a dated
release record below.

## Handoff log

Newest first; keep eight. Date, step IDs, what changed, checks actually run,
next action.

**2026-11-27 · M.7 built and released: `1e324bc` → `a1be687`.** Owner asked
for two retired game projects to be removed everywhere. Their cards, featured
places and Home, About and Projects copy are gone; Grace & Footnotes and C From
The Ground Up are featured instead; Go game-server claims are gone. Checks run:
`make verify` on the Mac (check, db:check, tests, build, rehearsal, shell
checks, `git diff --check`), then `deploy/build.sh` with the rehearsal and
`deploy/deploy.sh` on the VM after a verified host backup. Not done: browser
review at the four widths (the card grid markup is unchanged). Next: none
planned.

**2026-11-21 · M.6 built and released: `f2cb23c` → `1e324bc`.** Owner asked
for the projects page to be checked against the repositories and the live
server after every site moved to the host contract, and fixed. Five cards
changed (RiverMind Poker, Grace & Footnotes, Field Cadence, Day by Word, C
From The Ground Up); evidence is the November 21 section of
`docs/portfolio.md`. Checks run: check, db:check, 10 unit tests, production
build, `git diff --check`, then `deploy/build.sh` with the rehearsal and
`deploy/deploy.sh` (candidate, switch, live and public HTTP checks). Not
done: Home and About sentences that are also out of date (see **Now**, open
items), because that copy is an owner gate; no browser review at the four
widths, since only text inside existing cards changed. Next action: none
planned.

**2026-11-21 · M.5 built and released: `be15ef5` → `f2cb23c`.** Owner asked to align the site with the host
web-platform contract. pnpm 12.18.0 (`pnpm import`, then a clean
`pnpm-lock.yaml`: the import had carried a `mysql2` peer resolution of
drizzle-orm, removed), `pnpm-workspace.yaml` (`saveExact`, `engineStrict`,
`allowBuilds: esbuild`, the `@esbuild-kit` override moved from `overrides` in
`package.json`); Node 26.13.1 in `.node-version`, `engines`, CI, the unit and
the publishing wrapper; `pg`/`@types/pg` 8.23.1 and `@types/node` 26.6.6 (the
baseline); `mysql2` and the MySQL import tool removed (Q-1 decided), the
adoption test now seeds its legacy rows with SQL. Rollback removed:
`rollback.sh`, `cutover.sh`, `prepare.sh` and their docs, replaced by
`deploy/build.sh` (sawyer, outside the lock) and `deploy/deploy.sh` (root,
one lock: stage, dump, migrate as the service account, candidate, switch,
verify, Caddy if changed, record). `/healthz` now runs a real query and
reports `REVISION`, so it answers 503 during a database outage (previously
always 200). The HTTP smoke check is compiled into the release
(`dist/cli/tests/http.js`); the rehearsal's default web port moved from 4322
(Field Cadence's) to 54311. Checks run on the VM with `node-26`: check (0
errors, 0 warnings), db:check, 10 unit tests, build, rehearsal (database
suite; 197 populated / 194 outage / 197 recovered HTTP checks), `bash -n`,
shellcheck, `git diff --check`, `web-conformance` (conforms). tsx 4.20.6
prints a Node 26 `module.register()` deprecation warning in dev and test runs
only. The first build showed `install --prod` leaves dev packages in pnpm's
virtual store, fixed forward in `f2cb23c`. Released with the new flow at
15:39 UTC ([record](#host-contract-alignment-november-21-2026)); the old
rollback pointer and the restore copies in the `/root` checkpoint were
removed. Next action: none planned.

**2026-11-20 · M.1 recorded, M.3 built, M.4 released: `eeeb06d` → `be15ef5`.** Asked to continue BUILD.md
and improve the project. M.1: a read-only host inspection found two
unrecorded cutovers, not one (`4fbdc4f` → `aef964e` at 14:26 UTC and
`aef964e` → `fb9ea59` at 15:45 UTC) and a host-side unit rename between
them; the [record](#refresh-record-and-deployment-names-november-20-2026)
gives what survives and lists what does not. M.3 (added this session): one
definition of the HTTP boundary, the robots and manifest cache fix, pinned
headers in the HTTP checks, four new unit tests, release evidence kept by
`cutover.sh` and `prepare.sh`, `make verify`, shell checks in CI. Checks
run: baseline gates, then `make verify` (10 unit tests; 195 / 192 / 195
HTTP; shellcheck; `git diff --check`) and a byte comparison of thirteen
built responses. Not run: a browser review (no presentation change) and the
host-only scripts, which the release then exercised. Committed, pushed and
released with the owner's approval (M.4: backups, cutover, independent checks
and rollback check all passed; see the record). `npm audit` is
clean; newer versions exist for pg, svelte, tsx, typescript and the type
packages and were left pinned. Three logs from this release remain on the
host: `/root/dunamismax-{pre,post}release-backup-be15ef5.log` and
`/home/sawyer/web-candidates/dunamismax-prepare-be15ef5.log`. Next action:
none planned; the open items in **Now** are the owner's.

**2026-11-20 · M.2 released: `fb9ea59` → `eeeb06d`.** Owner-authorized. Ships
a since-retired project card (`3605c15`) and the portfolio recheck (`eeeb06d`:
Imaging Services and the support site on SvelteKit, the C course at
cfromthegroundup.com; evidence in docs/portfolio.md). The first pre-release
host backup failed twice for reasons outside this site: Vincent Sawyer's new
25 GiB media tree did not fit the `/tmp` staging tmpfs, and the RiverMind web
archive still required a retired `200.html`. Both were fixed in
ubuntu-vm-backup (`d05d4f8`, `58a8a44`, `b931862`) before cutover; see the
[record](#portfolio-updates-november-20-2026). Next action: M.1.

**2026-11-20 · Docs: README, BUILD and AGENTS restructured.** Asked to bring
the three files in line with the owner's other repositories (RiverMind
Poker, C From The Ground Up). BUILD gains **Now**, settled decisions,
open questions with defaults, maintenance steps, this log and a fixed list of
release record contents; every earlier record below is unchanged. AGENTS is
reorganized into roles and autonomy, session workflow, git, parallel sessions,
conventions, gates, deployment, security, toolchain and pitfalls. README
describes the site as it is now. A read-only check found production on
`fb9ea59` with no release record (M.1). Docs only: `git diff --check`; no code
changed. Next action: M.1.

**2026-11-20 · Portfolio commits after the refresh release (from git
history).** `fb9ea59` renamed the deployment paths and unit to the current
host names (`/etc/web-apps`, `dunamismax.service`) and is live; `3605c15`
updated a since-retired project card and is not deployed. Checks for both were not
recorded here. Next action: M.1, then M.2 with the owner.

---

## Release history

Dated records, newest first. They are evidence as written at the time and are
not rewritten; later sections supersede earlier directions where they say so.

## Retired projects removed (November 27, 2026)

M.7. `src/lib/projects.ts`, Home, About and Projects copy, `tests/http.ts` and
docs: two cards removed, two featured places reassigned, 13 projects. No
route, schema, server or stylesheet change.

- [x] Released to production (owner-requested), November 27, 2026 at 00:35
  UTC: `1e324bc` → `a1be687`.
  - Source: `a1be687` pushed to GitHub and Codeberg (`ls-remote` shows
    `a1be687`); VM checkout clean at that commit.
  - Build (`deploy/build.sh`, sawyer, outside the lock, Node 26.13.1 and pnpm
    12.18.0): gates and production build passed; rehearsal: PostgreSQL suite
    passed, 195 populated / 192 outage / 195 recovered HTTP checks.
  - Pre-release backup (D-9): the host backup ran at 00:27–00:33 UTC and
    committed snapshot `f291970` in ubuntu-vm-backup after `postgres-verify`
    and `applications-verify` (13 artifacts) passed; GitHub and Codeberg both
    verified the snapshot. The deploy also took its pre-migration dump.
  - Deploy (`with-deploy-lock bash …/deploy/deploy.sh a1be687…`): staged
    `releases/a1be687…`; schema step `adopted: false`, 1 migration of 1
    available, 0 rows; privilege report: production roles verified.
    Candidate: 190 HTTP checks (empty blog). Switch, restart; 190 HTTP checks
    on the live port; `web-live`: `/opt/node-v26.13.1-linux-x64/bin/node`,
    `releases/a1be687…`, revision `a1be687…`, `current`. Public HTTPS: 190
    HTTP checks.
  - Independent checks, from outside the server: `/healthz` reports `a1be687`
    with `"database":"ok"`; `/projects` shows 13 cards and Home 6 featured,
    neither retired name appears on Home, Projects or About, no `<script>`;
    the www redirect answers 301; `dunamismax` active and no failed units.

## Portfolio corrections (November 21, 2026)

M.6. Card text in `src/lib/projects.ts` only: five cards, same fifteen
projects, same anchors. No markup, route, schema or stylesheet change.

- [x] Released to production (owner-requested), November 21, 2026 at 19:03
  UTC: `f2cb23c` → `1e324bc`.
  - Source: `1e324bc` pushed to GitHub and Codeberg (`git push` updated both;
    `ls-remote` shows `1e324bc`); VM checkout clean at that commit.
  - Build (`deploy/build.sh`, sawyer, outside the lock, Node 26.13.1 and pnpm
    12.18.0): svelte-check 0 errors and 0 warnings, db:check, 10 unit tests,
    production build, rehearsal (PostgreSQL suite passed; 197 populated / 194
    outage / 197 recovered HTTP checks), `bash -n`, shellcheck.
  - Pre-release backup (D-9): the host backup ran at 18:44–19:02 UTC and
    committed snapshot `14332af` in ubuntu-vm-backup after `postgres-verify`
    (18 databases) and `applications-verify` (18 artifacts) passed and
    `restore check` decrypted 154 files; GitHub has the snapshot, and its
    upload to the Codeberg mirror timed out twice and is to be retried. The
    deploy also took `/var/backups/dunamismax.com/pre-migrate-1e324bc….dump`.
  - Deploy (`with-deploy-lock bash …/deploy/deploy.sh 1e324bc…`): staged
    `releases/1e324bc…`; schema step `adopted: false`, 1 migration of 1
    available, 0 rows, the empty-content digest; privilege report: production
    roles verified. Candidate: 192 HTTP checks (empty blog). Switch, restart;
    192 HTTP checks on the live port; `web-live`:
    `/opt/node-v26.13.1-linux-x64/bin/node`, `releases/1e324bc…`, revision
    `1e324bc…`, `current`. Public HTTPS: 192 HTTP checks.
  - Independent checks, from outside the server: `/healthz` reports `1e324bc`
    with `"database":"ok"`; `/projects` shows the five corrected cards and none
    of the replaced wording ("Python table server", "Not yet deployed", "35
    runnable"); fifteen cards; no `<script>`; the www redirect answers 301.

## Host contract alignment (November 21, 2026)

M.5. Tooling only: no page, copy, route, schema or stylesheet change; `/healthz`
now reports the revision and a database check. First release with
`deploy/build.sh` and `deploy/deploy.sh`.

- [x] Released to production (owner-requested), November 21, 2026 at
  15:39:52–15:39:57 UTC: `be15ef5` → `f2cb23c`.
  - Source: `1546441` and `f2cb23c` pushed to GitHub and Codeberg (`git push`
    updated both); VM checkout clean at `f2cb23c`.
  - Build (`deploy/build.sh`, sawyer, outside the lock, Node 26.13.1 and pnpm
    12.18.0): svelte-check 0 errors and 0 warnings, db:check, 10 unit tests,
    production build, rehearsal (PostgreSQL suite passed; 197 populated / 194
    outage / 197 recovered HTTP checks), `bash -n`, shellcheck. Release 20 MB.
  - Pre-release backup: not the D-9 host backup (see **Now**). The deploy took
    `/var/backups/dunamismax.com/pre-migrate-f2cb23c….dump` (root, 0600).
  - Deploy (`with-deploy-lock bash …/deploy/deploy.sh f2cb23c…`): staged
    `releases/f2cb23c…`; schema step `adopted: false`, 1 migration of 1
    available, 0 rows, the empty-content digest; journal 1 row = 1 entry;
    privilege report: production roles verified. Candidate on port 4400 as
    `dunamismax-web` under the new unit: `/healthz` reported `f2cb23c` with
    `"database":"ok"`, 192 HTTP checks (empty blog). Switch, restart; port
    4311 `/healthz` reported `f2cb23c`, 192 HTTP checks; `web-live`:
    `/opt/node-v26.13.1-linux-x64/bin/node`, `releases/f2cb23c…`, revision
    `f2cb23c…`, `current`. Caddy fragment unchanged (not reloaded). Public
    HTTPS: 192 HTTP checks; www redirect keeps path and query.
  - Independent checks: `dunamismax` active, 0 restarts, ExecMainStatus 0, user
    `dunamismax-web`; installed unit equals `deploy/dunamismax.service`; only
    4311 and 5432 on loopback, no candidate left; no failed units; unit
    journal since the restart has no warning or error lines. Public `/`,
    `/about`, `/projects`, `/blog`, `/feed.xml` 200, `/missing` 404, `/healthz`
    200 with the revision; CSP, HSTS and nosniff present; no `<script>`;
    `dunamismax-posts --help` runs on Node 26; the ten other public sites 200.
  - Rollback material removed: `/srv/www/dunamismax.com/last-web-rollback`,
    and `previous-*` and `site.caddy` from
    `/root/dunamismax-web-20261121T020152Z` (its evidence logs are kept).
  - Post-release backup and `applications-verify`: not run here (they write
    the ubuntu-vm-backup repository); the 07:30 UTC daily backup runs them.
    The probe starts `dist/cli/bin/server.js` with `PG*` variables on
    `/opt/node-26`, which this release supports.

## Boundary and release-evidence maintenance (November 21, 2026 UTC)

M.3 and M.4. No page, copy, route, schema or stylesheet change. One definition
of the HTTP boundary (`src/lib/http.ts`, `SLUG_PATTERN`); `/robots.txt` and
`/manifest.webmanifest` now carry the five-minute cache they always declared;
the HTTP checks pin security headers and cache policy; `cutover.sh` and
`prepare.sh` keep their evidence; `make verify`; shell checks in CI. The commit
also carries the M.1 record below. Local evidence is under M.3 in
[Steps](#steps).

- [x] Released to production (owner-authorized), November 21, 2026 at
  02:01:52 UTC (November 20, 9:01 p.m. Eastern): `eeeb06d` → `be15ef5`.
  - Source: `be15ef5` pushed to GitHub and Codeberg (both tips verified);
    GitHub Actions Verify passed, including the new shell step; VM checkout
    fast-forwarded as `sawyer`, clean. `deploy/prepare.sh` candidate passed
    svelte-check (0 errors, 0 warnings), 10 unit tests, build, shellcheck, the
    PostgreSQL database test and the PG 18 rehearsal; its
    `.candidate-rehearsal.log` reads 195 populated / 192 outage / 195
    recovered HTTP checks.
  - Pre-release: `bin/backup --push` passed at 01:54 UTC, snapshot `b38bd15`
    verified on both mirrors; its own restore verification passed
    (`postgres-verify` 13 databases, `applications-verify` 18 artifacts,
    dunamismax.com `eeeb06d` HTTP 200 from restored data). Then
    `restore check` 133 files, 0 failures, and `restore postgres-verify`
    13 databases.
  - Cutover under `with-deploy-lock`, checkpoint
    `/root/dunamismax-web-20261121T020152Z`, `completed-at` 02:01:56 UTC.
    `schema-step.log`: `adopted: false`, 1 migration of 1 available, 0 rows,
    the empty-content digest. Privilege report: production roles verified.
    Candidate and public production each passed 189 HTTP checks (empty
    blog). Full Caddy config valid. No shared service restarted.
  - Independent checks: current → `be15ef5`; dunamismax active and running,
    ExecMainStatus 0, 0 restarts, user dunamismax-web; 4311 and 5432
    loopback-only, 4323 closed; no failed units; no error lines in the unit
    log since cutover; caddy and postgresql@18-main active. Public HTTPS: /,
    /projects (15 cards), /about, /contact, /blog, /feed.xml, /healthz 200
    and no-store; /missing 404; POST 405; `/robots.txt`,
    `/manifest.webmanifest` and `/css/site.css` cached 300 s and `/icon.svg`
    one day; CSP, nosniff, referrer and permissions headers present; no
    `<script>`; www 301 preserves path and query; the nine other public
    sites 200.
  - Rollback: `rollback.sh CHECKPOINT --check` passed under the lock; not
    performed.
  - Post-release: `bin/backup --push` passed at 02:05 UTC, snapshot `f536f58`
    verified on both mirrors; inventory records `current=be15ef5`, 13
    releases; `applications-verify` passed, 18 artifacts, and served
    dunamismax.com `be15ef5` with HTTP 200 from restored data;
    `postgres-verify` 13 databases.

## Portfolio updates (November 20, 2026)

Content-only change (M.2): `src/lib/projects.ts`, one line each of Home and
About copy, and docs. Routes, schema, server, deployment scripts and the
stylesheet are unchanged. A since-retired game card shows its prototype
(`3605c15`); the Imaging Services demo and RustDesk remote
support name SvelteKit instead of Astro; the C course links
cfromthegroundup.com with the mdBook edition as a mirror (`eeeb06d`).
Evidence: [docs/portfolio.md](docs/portfolio.md#verified-entries).

- [x] Local: `npm run check` (0 errors, 0 warnings), `npm run db:check`,
  `npm test` (6 of 6) on Node 24.22.3; production build and 129 HTTP checks
  (empty) against a local server; `git diff --check`.
- [x] Released to production (owner-authorized), November 20, 2026 at
  23:00:34 UTC: `fb9ea59` → `eeeb06d`.
  - Source: `eeeb06d` pushed to GitHub and Codeberg (both tips verified);
    VM checkout fast-forwarded; `deploy/prepare.sh` candidate passed
    svelte-check (0 errors, 0 warnings), unit tests, build, shellcheck, the
    PostgreSQL database test and the PG 18 rehearsal (135 populated / 132
    outage / 135 recovered HTTP checks).
  - Pre-release: the first two `bin/backup --push` runs failed (media
    staging out of `/tmp` space, then the stale RiverMind web requirement);
    after the ubuntu-vm-backup fixes, snapshot `b0be8a5` committed and both
    mirrors verified; its own restore verification passed; `restore check`
    131 files, 0 failures; `postgres-verify` 12 databases;
    `applications-verify` 18 artifacts.
  - Cutover under `with-deploy-lock`, checkpoint
    `/root/dunamismax-web-20261120T230030Z`. Schema step no-op
    (`adopted: false`, 1 migration, 0 rows); production roles verified;
    candidate HTTP checks passed; full Caddy config valid; public production
    129 HTTP checks (empty blog). No shared service restarted.
  - Independent checks: current → `eeeb06d`; dunamismax active,
    ExecMainStatus 0, 0 restarts, user dunamismax-web; 4311 and 5432
    loopback-only; no failed units; no error lines in the unit log since
    cutover; caddy and postgresql@18-main active. Public HTTPS: /,
    /projects (15 cards), /about, /blog, /feed.xml, /healthz 200; no Astro
    on /projects or /about; CSP and no-store present; no `<script>`; www
    301 preserves path and query; the eight other public sites 200.
  - Rollback: `rollback.sh CHECKPOINT --check` passed under the lock; not
    performed.
  - Post-release: `bin/backup --push` snapshot `49de3de`, both mirrors
    verified, inventory records `current=eeeb06d`; `applications-verify`
    passed, 18 artifacts.

## Refresh record and deployment names (November 20, 2026)

Two cutovers between the portfolio refresh (`4fbdc4f`) and the portfolio
updates (`eeeb06d`) were not recorded when they happened. This record (M.1)
was written afterwards from a read-only inspection of the host at 01:35 UTC on
November 21, 2026: the root-only cutover checkpoints, the unit journal, the
candidate directories, the ubuntu-vm-backup history and GitHub Actions. It
gives the evidence that survives and says which parts do not. Nothing on the
host was changed to write it.

Neither release changed a page, route, schema or stylesheet. `aef964e` only
adds the refresh release record to BUILD.md. `fb9ea59` renames the deployment
paths and units in scripts and docs to the host's current names
(`/etc/web-apps`, `/opt/node-runtime`, `/run/web-deploy/lock`,
`dunamismax.service`, `dunamismax-candidate`): 18 files, 72 lines each way.

- [x] `4fbdc4f` → `aef964e`, November 20, 2026 at 14:26:08 UTC.
  - Source: GitHub Actions Verify passed for `aef964e` (push at 14:23 UTC).
    The inventory in backup snapshot `320f76e` (14:24:50 UTC) shows the VM
    checkout at `aef964e` and `current=4fbdc4f`.
  - Candidate: `.candidate-sha256` was written at 14:24:57 UTC.
    `deploy/prepare.sh` writes it only after check, unit tests, build, the
    rehearsal, `bash -n` and shellcheck pass.
  - Cutover: checkpoint `/root/dunamismax-astro-20261120T142608Z`, previous
    release `4fbdc4f`, previous unit active. Privilege report: production
    roles verified. Candidate and public production each passed 129 HTTP
    checks (empty blog). Journal: the candidate served on 4323 from 14:26:09
    to 14:26:10 and the unit restarted at 14:26:10 listening on 4311.
  - Post-release: snapshot `733e5a1` (14:26:53 UTC) holds a new application
    archive and database dump, and its inventory shows `current=aef964e`.
- Host rename, 15:15:34 UTC. Not a cutover from this repository and it has no
  checkpoint here. The journal shows `astro-dunamismax.service` stopping at
  15:15:34 and `dunamismax.service` starting at 15:15:36 on 4311, still
  serving `aef964e`. ubuntu-vm-backup `102f22d` and snapshot `53ef357`
  (15:20:18 UTC) record the renamed unit and publishing wrapper. Until the
  next cutover the live release's own deploy scripts named the old paths.
- [x] `aef964e` → `fb9ea59`, November 20, 2026 at 15:45:07 UTC.
  - Source: committed at 15:20:35 UTC; GitHub Actions Verify passed (push at
    15:20 UTC). The inventory in snapshot `0b1f6f4` shows the VM checkout at
    `fb9ea59` and `current=aef964e`.
  - Candidate: `.candidate-sha256` was written at 15:44:35 UTC.
  - Pre-release: full host snapshot `0b1f6f4` (archives, data, files,
    inventory, metadata, secrets) at 15:42:11 UTC, three minutes before
    cutover, with a fresh dunamismax dump.
  - Cutover: checkpoint `/root/dunamismax-web-20261120T154507Z`, previous
    release `aef964e`, previous unit active. Privilege report: production
    roles verified. Candidate and public production each passed 129 HTTP
    checks (empty blog). Journal: the candidate served on 4323 from 15:45:08
    to 15:45:09 and the unit restarted at 15:45:10 listening on 4311.
  - In service until the M.2 cutover at 23:00:30 UTC: the unit journal for
    that period has five lines and none reports a failure, an error or an
    unavailable database.
  - Post-release: snapshot `570c831` (15:49:04 UTC) holds a new application
    archive and its inventory shows `current=fb9ea59`, eleven releases.
  - Rollback target: the M.2 checkpoint names `fb9ea59` as its previous
    release, and `rollback.sh --check` against it passed during M.2.
- Not recorded for either cutover, and not reconstructed here: verification
  of the Codeberg tip at the time (on November 21 both remotes' `main`
  contain both commits); the candidate's check counts; the output of
  `restore check`, `postgres-verify` and `applications-verify` for the
  surrounding snapshots; the schema step output, which `cutover.sh` did not
  save (a failing step aborts and restores, and the privilege report that
  follows it passed); the independent public checks (CSP, no `<script>`, www
  redirect, sibling sites); and a `rollback.sh --check` against these two
  checkpoints. No pre-release snapshot is distinguishable for `aef964e`
  beyond `320f76e`, a data and inventory snapshot 78 seconds before cutover.

## Portfolio refresh (November 20, 2026)

Content-only change; routes, schema, deployment and the stylesheet are
unchanged. The portfolio grows from eight to fifteen cards in five groups
(games, websites, apps in development, infrastructure, bots/tools/teaching),
generated from the typed inventory in `src/lib/projects.ts`; the home page
shows six featured cards. Home, About, Projects, Blog, footer and metadata copy
now describe the actual stack (SvelteKit/TypeScript/PostgreSQL, plus Go,
Python and Swift where projects use them). Evidence:
[docs/portfolio.md](docs/portfolio.md#november-20-2026-review). All existing
anchors are kept; new ones are `#rivermind-poker`,
`#vincent-sawyer`, `#field-cadence`, `#day-by-word`,
`#c-from-the-ground-up`, `#group-games` and `#group-in-development`.

- [x] Local: `npm run check`, `npm run db:check`, `npm test`, production
  `npm run build`, `bash deploy/rehearse.sh` (135 populated / 132 outage HTTP
  checks), `git diff --check`; mobile light and desktop dark layouts reviewed,
  no horizontal overflow at 375px.
- [x] Released to production (owner-authorized), November 20, 2026 at about
  9:20 a.m. Eastern: `064bca5` → `4fbdc4f`.
  - Source: `4fbdc4f` pushed to GitHub and Codeberg; VM checkout
    fast-forwarded; `deploy/prepare.sh` candidate passed svelte-check, unit,
    build, shellcheck and the PG 18 rehearsal (135 / 132 / 135 HTTP).
  - Pre-release: full `bin/backup --push` passed (`postgres-verify` 9
    databases, `applications-verify` 10 artifacts); `restore check` 108 files,
    0 failures.
  - Cutover under `with-deploy-lock`, checkpoint
    `/root/dunamismax-astro-20261120T142031Z`. Schema step no-op
    (`adopted: false`, 1 migration, 0 rows); production roles verified;
    full Caddy config valid and reloaded; public production 129 HTTP checks
    (empty blog). No shared service restarted.
  - Independent checks: current → `4fbdc4f`; dunamismax active,
    ExecMainStatus 0, 0 restarts, user dunamismax-web; 4311 and 5432
    loopback-only; no failed units; no error lines in the unit log. Public
    HTTPS: /, /projects (15 cards), /about, /feed.xml, /healthz 200; CSP and
    no-store present; no `<script>`; www 301 preserves path and query; the
    seven other public sites 200.
  - Rollback: `rollback.sh CHECKPOINT --check` passed under the lock; not
    performed.
  - Post-release: `bin/backup --push` passed, and `applications-verify`
    served `4fbdc4f` with HTTP 200 from restored data.

## Phase 1 — SvelteKit stack migration (November 20, 2026)

Owner's direction, November 20, 2026: change the planned and implemented stack to
**SvelteKit 3 · Svelte 5 · TypeScript · Tailwind CSS 4 · PostgreSQL 18 + Drizzle
ORM · Node (adapter-node) · Caddy**. This replaces Astro as the web framework.
PostgreSQL, Drizzle, the schema/migrations, roles, publishing CLI, systemd
deployment and Caddy are retained unchanged.

Status: implemented, verified locally and released to production at `064bca5`
(owner-authorized, November 20, 2026). See the local record and the
[production release record](#production-release-record-november-20-2026-eastern).

### 1.1 Framework port

- [x] Pin SvelteKit 3.4.0, Svelte 5.58.1, Vite 8.3.8, @sveltejs/vite-plugin-svelte
  7.3.1, @sveltejs/adapter-node 6.0.5, svelte-check 4.7.8, Tailwind CSS 4.3.5 and
  @tailwindcss/vite 4.3.5 exactly; remove astro, @astrojs/node, @astrojs/check.
  Keep Node 24.22.3 / npm 11.19.1, TypeScript 6.0.3 strict, Drizzle and pg pins.
  Current SvelteKit 3 docs fetched with Context7 (config in `vite.config.ts`,
  `#lib` subpath import, hook types in `@sveltejs/kit/hooks`, `$app/tsconfig`).
- [x] Port pages to `src/routes/`: Home (`+page.server.ts`, honest 200 on outage),
  Blog index/pagination and post detail (`error(404|503)` → `+error.svelte`),
  prerendered About/Contact/Projects (`+page.ts`), `+server.ts` endpoints for
  feed.xml, healthz, robots.txt, manifest.webmanifest and css/site.css.
- [x] Root `+layout.svelte` reproduces head metadata, canonical/OG/Twitter tags,
  noindex rules, skip link, both navs with aria-current and the footer.
  `+layout.ts` sets `csr = false` (zero browser JavaScript); `app.html` has no
  inline style wrapper so the CSP stays unchanged.
- [x] `src/hooks.server.ts` replaces Astro middleware (same headers, 405,
  noindex, Retry-After) and adds a sanitized `handleError`. `bin/server.ts` now
  wraps `dist/web/handler.js`; the allowlist, CSP and cache policy are unchanged,
  so `/_app` and prerendered `__data.json` paths stay 404.
- [x] Tailwind CSS 4: `src/app.css` imports theme and utilities (no preflight)
  and the preserved stylesheet (`src/styles/site.css`) as the components layer;
  utilities are scanned only from `.svelte` files. The compiled stylesheet is a
  prerendered endpoint at the preserved `/css/site.css` URL with a content hash.
- [x] Keep `dist/cli/bin/*.js` entry points so `deploy/*.sh`, the systemd unit
  and the publishing wrapper work unchanged, and rollback to the retained Astro
  release stays valid (no schema change). Host contract names (`astro-*`) kept.
- [x] Update only this site's stack card and footer colophon to the new stack.
  Profile copy and other projects' Astro claims are unchanged (they describe
  other deployments and Stephen's experience; change only with evidence).

### 1.2 Release

- [x] Commit and push main; GitHub Actions Verify passed on Ubuntu for `10ee7d4`
  (check, db:check, unit, build, PG 18 rehearsal, audit).
- [x] On the VM: `deploy/prepare.sh`, backup/restore verification, then locked
  cutover. Evidence below. The shared backup inventory was then fixed for Grace's
  SvelteKit build and a full verified host snapshot taken (see the record).

### Local verification record (November 20, 2026 Eastern)

Local implementation only; not a release record. macOS, Node 24.22.3 /
npm 11.19.1 (mise), Homebrew PostgreSQL 18.6.

- `npm ci` from the regenerated lockfile; `npm audit` 0 vulnerabilities.
- `npm run check`: svelte-kit sync, svelte-check 0 errors / 0 warnings, tsc clean.
- `npm run db:check`: drizzle-kit check passes, no schema changes.
- `npm test`: 6 unit tests pass. `APP_ENV=production npm run build` passes;
  prerendered pages contain no `<script>`, inline style or event handler.
- `bash deploy/rehearse.sh` on PostgreSQL 18.6: database suite passes; HTTP
  130 populated / 127 outage / 130 recovered (two new private paths:
  `/src/app.css`, `/_app/version.json`; `/dist/web/handler.js` replaces the
  Astro entry path).
- Browser comparison against live production (Astro `e1c292c` or later) using
  computed styles and box sizes of every body element: Home at 1280 px dark is
  identical except the intentionally changed dunamismax.com stack chips and
  footer colophon; About, Contact, Blog and 404 at 375 px light are identical.
- `bash -n` and `shellcheck -x deploy/*.sh` pass; `git diff --check` clean.

### Production release record (November 20, 2026 Eastern)

Owner-authorized. Separate from the local record above and from Phase 0.

- Source: `10ee7d4` (port), `62dbde1` (keep ignoring the retired `.astro/`
  cache so the VM checkout stays clean for prepare) and `064bca5` (log only
  unexpected server errors; SvelteKit 3 passes routine 404s to `handleError`).
  GitHub and Codeberg tips verified after each push; VM checkout fast-forwarded.
- Restore-drill compatibility: the host's `applications-verify` reinstalls with
  `npm ci --omit=dev --ignore-scripts` and runs `dist/cli/bin/server.js`
  (inventory entry unchanged). A local copy of the build with only production
  dependencies served /, /blog, /about, /feed.xml, /healthz and /css/site.css 200.
- Pre-release backup: the full `bin/backup --push` **failed** in application
  archiving because graceandfootnotes.com had just been redeployed by another
  session as SvelteKit (`build/`), while `config/applications.json` still
  expects its `dist/server/entry.mjs`. Not caused or changed here. In its place:
  `dunamismax-backup.service` (fresh dunamismax dump, isolated postgres-verify
  PASS) before each cutover, `restore check` 108 files / 0 failures, and
  `restore postgres-verify` 9 databases PASS.
- `deploy/prepare.sh` on the VM for both candidates: svelte-check 0/0, unit,
  build, PG 18 rehearsal 130 / 127 / 130 HTTP.
- Cutover 1 under `with-deploy-lock` at about 8:45 a.m. Eastern: `e1c292c` →
  `62dbde1`, checkpoint `/root/dunamismax-astro-20261120T134522Z`. Schema step
  no-op (`adopted: false`, 1 migration, 0 rows, empty-content digest);
  privilege report passed; candidate and public production 124 HTTP checks
  each (empty blog); Caddy validated and reloaded; no shared service restarted.
- Cutover 2 at about 8:48 a.m. Eastern: `62dbde1` → `064bca5`, checkpoint
  `/root/dunamismax-astro-20261120T134852Z`; same schema/privilege/124-check
  results. No `Request failed` lines after it, versus 20 from 404 checks before.
- Independent checks: current → `064bca5`; dunamismax active,
  ExecMainStatus 0, user dunamismax-web, only web.env; 127.0.0.1:4311 and
  PG 127.0.0.1:5432 loopback-only; no failed units; `dunamismax-posts list`
  works. Public HTTPS: CSP/nosniff/referrer headers, no-store, no `<script>`,
  /healthz ok, /css/site.css cached 300 s, www 301 preserves path/query,
  Let's Encrypt certificate valid to 2027-01-04, all five host sites 200.
- Rollback: `rollback.sh CHECKPOINT --check` passed under the lock for both
  checkpoints; Astro `e1c292c` remains retained and schema-compatible. No
  rollback was performed.
- Post-release: `dunamismax-backup.service` archive verified (postgres-verify
  PASS). ubuntu-vm-backup `8124335` pointed Grace's inventory entry at
  `build/index.js` (sites may declare a build `output`; archives skip
  `.svelte-kit`). Full `bin/backup --push` then passed: snapshot `989fde9` on
  both backup remotes, `restore check` 108 / 0 failures, `postgres-verify` 9
  databases, and `applications-verify` 10 artifacts with dunamismax.com
  `064bca5` and graceandfootnotes.com `1a17b1e` HTTP 200 from restored data.

## Phase 0 — Astro/PostgreSQL stack alignment (first)

Historical: superseded as the framework direction by Phase 1. The Drizzle
adoption below remains current and in production.

Owner's final direction, November 2, 2026 Eastern: retain Astro and PostgreSQL.
This replaces the Next.js rewrite and the subsequently withdrawn SQLite plan.
Python and Swift are used only when this project actually needs them or the
owner requests them.

Status: Drizzle adoption is implemented, verified locally and released to
production at `e1c292c` (owner-authorized, November 2, 2026). See the
[local verification record](#local-verification-record-november-2-2026-eastern)
and [production release record](#production-release-record-november-2-2026-eastern).
The former open item (a Caddy Cloudflare DNS-challenge assumption) was closed by
the owner's clarification on November 2, 2026: no such setup is part of the stack.

### 0.1 Preserve the working application and establish the baseline

- [x] Read AGENTS, README and docs/architecture.md, docs/content.md,
  docs/production.md, docs/migration.md and docs/portfolio.md. Inspect status,
  branch, identity and remotes; work on main only and pull --ff-only when clean.
- [x] Run the current gates below and capture actual source/runtime evidence.
  Do not assume production has no posts from the October zero-row import.
- [x] Retain Astro 7.4.2, @astrojs/node 11.1.9 standalone, strict TypeScript
  6.0.3, Node 24.22.3/npm 11.19.1, existing pages/components/CSS and systemd
  deployment unless a verified compatibility issue requires a coordinated update.
  Pin exact dependencies and use npm ci. Fetch current Context7 documentation
  before selecting compatible Drizzle ORM/Kit versions and migration APIs.
- [x] Keep the current split: About/Contact/Projects prerender, while Home,
  blog/detail and RSS query PostgreSQL on demand. This database-backed blog
  needs SSR; converting it to static output would break live publication.
  Purely static future projects can be served directly by Caddy.
- [x] Preserve all routes, eight project cards/order/anchors, approved copy,
  metadata, RSS, canonical origin, contact links, skip links, aria-current,
  dark/light CSS and mobile layout. Keep zero browser scripts/inline styles and
  the existing CSP. No React island, Tailwind or shadcn/ui is needed for this
  migration; use them only for a future UI requirement. No nonce/rendering
  changes from the cancelled Next.js plan should be implemented.

### 0.2 Adopt Drizzle with the existing PostgreSQL database

The retained part of the common stack still calls for a TypeScript schema and
reviewed migrations. The current app uses pg directly and database/schema.sql;
Drizzle adoption is the remaining implementation work, not a framework rewrite.

- [x] Add src/db/schema.ts, server/operator connection modules, drizzle.config.ts
  and committed drizzle/ SQL migrations/snapshots. Use Drizzle's node-postgres
  driver with the existing lazy bounded pool, timeouts and sanitized errors.
  No hosted database, new production database or SQLite/libSQL driver is needed.
- [x] Model app.posts and app.public_posts from database/schema.sql. Preserve
  bigint identity/sequence, C-collated unique slug, constraints, publication
  index, title/excerpt Unicode limits, body byte limit, statuses and timestamptz
  instants. Preserve full timestamp precision and avoid unsafe bigint coercion.
- [x] Preserve the owner-controlled security_barrier publication view, filtered
  by published status and PostgreSQL CURRENT_TIMESTAMP. Web queries the view
  only, never app.posts with an application-only visibility filter. Maintain
  schema privileges, sequence permissions and role-escalation denials using
  reviewed custom SQL where the schema generator cannot express them.
- [x] Retain database dunamismax, schema app, NOLOGIN owner dunamismax_owner,
  read-only dunamismax_web, bounded dunamismax_publishing and operator-only
  dunamismax_migration. Web cannot SELECT the private table or write/DDL;
  publisher has SELECT/INSERT/UPDATE and required sequence use, not DELETE/DDL.
  Keep the migration journal inaccessible to web and publishing identities.
- [x] Rehearse fresh installation and baseline adoption on nonempty disposable
  PostgreSQL restores. Compare schema, ACLs, every stored field, row counts,
  IDs/sequence and ordered full-content SHA256 before recording a baseline as
  applied. Scope introspection to this app, review the SQL and prove repeated
  migrations are no-ops. No blind push/reset/drop, replay of CREATE against
  existing data, reimport of MySQL or generation from guessed production state.
- [x] Make generated migrations the authoritative schema evolution path;
  adapt bin/schema.ts and database/schema.sql so there are not two divergent
  schema sources. Migration credentials remain operator-only, outside builds
  and web startup. Keep reviewed raw SQL for PostgreSQL-specific constraints,
  grants and views when necessary; ORM adoption must not weaken boundaries.

### 0.3 Adapt data access, publishing and verification in place

| Existing file / surface | Required work |
| --- | --- |
| src/lib/posts.ts | Use Drizzle view queries; preserve ordering by published_at/id descending, limits, offsets, lazy pool and deadlines |
| src/lib/publisher.ts | Port transactions/row locks to Drizzle; preserve create/edit/validate/publish/schedule/unpublish semantics |
| bin/posts.ts, src/lib/credentials.ts | Keep the TypeScript CLI/interface and independent protected config; no Python rewrite is needed |
| bin/schema.ts, bin/verify-database.ts | Apply reviewed Drizzle migrations separately; retain actual PG permission-denial tests |
| bin/migrate-data.ts | Historical MySQL import is not the new migration; retain/remove only after checking recovery needs |
| tests/database.ts, deploy/rehearse.sh | Exercise fresh/adopted schemas, real role denials, SQL binding, publishing lifecycle and populated/outage/recovery HTTP |
| package.json, tsconfig.cli.json, Makefile, CI | Include schema/migration modules, exact pins, explicit checks and isolated migration rehearsals |
| deploy/prepare.sh, cutover.sh, lib.sh, rollback.sh, posts-wrapper.sh | Adapt schema/tool artifact paths only as required; retain locks, expected-current guard, independent credentials and rollback |

- [x] Keep draft-by-default creation, immutable slugs and edit preserving
  status/date. Validate writes nothing; publish uses database time; scheduling
  requires explicit offset and future database time; unpublish retains date.
  Keep plain text escaping and both RSS encoding layers, Unicode/byte limits,
  protected body-file/stdin handling and private list/show output.
- [x] Preserve database-clock scheduling without rebuild, restart, timer or
  cache invalidation. Do not bake or persistently cache post data. Test due-time
  publication and immediate unpublish on list/count/detail/RSS.
- [x] Keep bin/server.ts as the uniform method/header/path boundary before
  Astro static/SSR handling. Preserve GET/HEAD-only/405, private-path 404/noindex,
  honest home 200 fallback and blog/post/feed 503 with Retry-After: 60/no-store.
- [x] Keep content and credentials out of build artifacts/logs. No production
  database credentials during build; build and DB-independent pages/health
  must work with the database unavailable. Missing production config fails
  clearly; only explicit local/test configuration allows empty preview.
- [x] Run current check/unit/build and isolated PG rehearsal after application
  changes. Expand tests for Drizzle baseline replay and unchanged privileges.
  Review browser at 320/375/768/1440 in both schemes if presentation changes.
  Run bash syntax/ShellCheck for edited shell and always git diff --check.

### 0.4 Keep the existing self-hosted deployment and backup model

- [x] Keep the site-scoped systemd Node service on 127.0.0.1:4311, native PG
  loopback-only, existing Caddy fragment/custom binary and protected per-role
  env files. Containerization/Compose is optional, not required work. If ever
  chosen, document loopback-only port publishing and safe native-PG connectivity
  before changing it; never expose PG to make a container connection work.
- [x] Build/test isolated candidates before taking the existing shared deployment
  lock. Hold descriptor 9 for the full privileged cutover/rollback. Exclude
  publishing while migrating; apply only additive, rollback-compatible schema
  changes. Keep immutable commit releases and atomic current pointers. Do not
  restart shared PostgreSQL/Caddy or modify sibling apps.
- [x] Verify DNS and TLS. *(Owner, November 2, 2026: domains are on Cloudflare
  with DNS-only records the owner manages himself, pointing at the server's
  public IP; Caddy is the reverse proxy and obtains its own Let's Encrypt
  certificates. No Cloudflare DNS challenge, Caddy DNS plugin, token or proxy
  mode is part of the stack.)* Verified November 2: dunamismax.com/www resolve
  directly to the origin, and origin TLS is a valid Let's Encrypt certificate
  (expires 2027-01-04). Caddy was not modified here.
- [x] Retain nightly pg_dump backups, encrypted off-server copies and isolated
  restore checks including data, roles, ACLs, Drizzle journal and app release.
  Confirm actual backup/restore evidence before a release. Litestream/R2 SQLite
  replication, WAL/busy_timeout settings and SQLite files are out of scope.
- [x] Rehearse code rollback against newer PG writes. Do not restore old database
  dumps or divergent MySQL over authoritative data; stop for reconciliation if
  an old release is incompatible. Retain existing backup timers/recovery sources.

### 0.5 Conditional technologies and completion

- [x] Add no Python or Swift code/toolchain here unless a concrete project need
  or explicit request exists. Existing TypeScript publishing/maintenance tools
  remain TypeScript. Preserve factual portfolio references to other projects'
  Python work; these are not dependencies of this site.
- [x] If a future native Apple app is needed/requested, use Swift/SwiftUI and
  HTTPS Astro endpoints, with SwiftData or GRDB only for actual local storage
  needs. Record Swift version, minimum OS targets, observation conventions and
  a verified xcodebuild/test command then. Do not scaffold a native app now.
- [x] If a future Python utility is needed/requested, use uv and Ruff, with
  Typer/httpx/Pydantic only as useful and systemd timers for recurring jobs.
  It must use project-authorized PG credentials or an API, not an SQLite file.
- [x] Astro Actions/forms, API endpoints for clients, React islands, Tailwind/
  shadcn, Better Auth and AI SDK remain available when a real feature needs
  them. Current portfolio has no public writes, accounts, payments, AI or native
  client. Do not install these speculatively or weaken the read-only surface.
- [x] Update README/architecture/content/production and AGENTS to the delivered
  Drizzle paths/commands; public stack claims change only with verified evidence.
  No changes to sibling stack claims based on a shared prompt. Keep old migration
  acceptance dated and separate from new local checks/live release acceptance.
- [x] Mark local completion only after actual checks. Production deployment
  requires release authorization; this docs assignment does not deploy. For a
  release record commit, verified remote tips, service/listener, data/privileges,
  public HTTP/privacy/TLS, backup/restore and rollback evidence separately.

### Local verification record (November 2, 2026 Eastern)

Local implementation only; not a release record. Toolchain Node 24.22.1 /
npm 11.19.1 (mise), Homebrew PostgreSQL 18.6 and 17.11 on macOS.

- Baseline before changes: check 0 errors, 6 unit tests, production build, and
  rehearsal (database suite; HTTP 115 populated / 112 outage / 115 recovered).
- Production, read-only over authorized root SSH: active release `cfade65`,
  `app.posts` 0 rows, sequence unused, no `drizzle` schema, PostgreSQL 18.6.
  Owner default privileges in app grant publishing SELECT/INSERT/UPDATE on new
  relations (including the existing view) — hence the separate journal schema.
  The normalized catalog of schema app was captured as
  `database/baseline-catalog.json` (read-only transaction).
- Selected stable drizzle-orm 0.45.4 / drizzle-kit 0.31.11 (1.0 still RC) after
  Context7 docs. npm override pins drizzle-kit's nested esbuild; audit clean.
- Generated `drizzle/0000_baseline.sql`; removed CREATE SCHEMA (host bootstrap)
  and appended the reviewed grants. `drizzle-kit check` passes and generate
  reports no drift (`npm run db:check`); an injected schema change fails it.
- Rehearsal on PostgreSQL 18 and 17, with a fixture mirroring production roles,
  database/schema ACLs and default privileges: fresh install equals the
  production catalog; repeated runs are no-ops; a populated pre-Drizzle database
  (MySQL-import fixture, microsecond instants, advanced sequence) and its
  pg_dump/pg_restore copy were adopted with identical catalog, rows, IDs,
  sequence and full-content SHA256; a drifted ACL is refused with no journal
  created. Web/publisher journal access and all prior role denials fail as
  expected. Drizzle web reads, publisher lifecycle, SQL binding, due-time
  publication and immediate unpublish (count/detail/latest), timestamp
  preservation on edit/unpublish and parameter-free CLI errors pass. HTTP
  124 populated / 121 outage / 124 recovered (new private-path checks).
- No presentation change, so browser review was not repeated. Shell scripts:
  only rehearse.sh exports PGBIN; bash -n and ShellCheck pass.

### Production release record (November 2, 2026 Eastern)

Owner-authorized release of `e1c292c7c999f3dc96f54384fd9350e008339a18`,
replacing `cfade65`. Separate from the local record above and from the October
migration acceptance.

- Source: main pushed; GitHub and Codeberg tips both verified at `e1c292c`.
  VM checkout fast-forwarded; `deploy/prepare.sh` built the isolated candidate
  (check 0 errors, 6 unit tests, build, PG 18 rehearsal 124/121/124 HTTP);
  `db:check` and `npm audit` clean in the candidate.
- Pre-release host backup `f650974` (pushed, both backup remotes verified),
  `restore check` 95 files / 0 failures, `restore postgres-verify` 7 databases.
- Cutover under `with-deploy-lock` (exclusive; publishing excluded) at about
  3:18 p.m. Eastern, checkpoint `/root/dunamismax-astro-20261102T201802Z`.
  Schema step: `adopted: true`, 1 migration, 0 rows, digest unchanged.
  Privilege report passed, including web/publisher denial on the journal.
  Candidate service and public production each passed 118 HTTP checks; the
  www redirect check passed. No shared service was restarted (Caddy reload).
- Independent checks: current → `e1c292c`; dunamismax active, ExecMainStatus
  0, user dunamismax-web, only web.env; 127.0.0.1:4311 and PG
  127.0.0.1:5432 loopback-only; no failed units. Journal holds one row whose hash
  equals SHA256 of `drizzle/0000_baseline.sql`; `drizzle` schema owner-only;
  app catalog still equals `database/baseline-catalog.json`. The installed
  `dunamismax-posts list` works through Drizzle. HTTPS: CSP and no-store
  present, /healthz ok, www 301 preserves path/query, all five host sites 200.
- Rollback: `rollback.sh CHECKPOINT --check` passed under the lock. The retained
  `cfade65` release, run temporarily on 127.0.0.1:4323 with only web.env against
  the adopted live database, passed its own 109-check suite; locally it passed
  115 populated checks against a database migrated and written by `e1c292c`.
  No production rollback was performed.
- Post-release host backup `44a3cac` pushed; `restore check` 95 / 0 failures,
  `postgres-verify` 7 databases (dunamismax including the journal schema), and
  `applications-verify` served `e1c292c` from restored PostgreSQL with HTTP 200.
  A later unrelated snapshot `3d1d352` is the tip of both backup remotes.

### References for implementation

Recheck current, version-compatible docs with Context7; avoid stale CLI examples
or introspection instructions for another SQL dialect.

- [Migrating to SvelteKit 3](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [SvelteKit adapter-node](https://svelte.dev/docs/kit/adapter-node)
- [Tailwind CSS: disabling preflight](https://tailwindcss.com/docs/preflight)
- [Astro Node adapter](https://docs.astro.build/en/guides/integrations-guide/node/) (historical)
- [Drizzle with existing PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-existing)
- [Drizzle schema introspection](https://orm.drizzle.team/docs/drizzle-kit-pull)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)

## Existing Astro/PostgreSQL verification (historical acceptance)

Astro/strict TypeScript/PostgreSQL replaces this repository’s PHP implementation.
Preserved: approved portfolio, routes, CSS/icon, metadata, RSS/plain text,
pagination, zero browser scripts, draft privacy and database outage behavior.
About/Contact/Projects prerender; PostgreSQL remains authoritative for posts.

Production was verified at release `c93aaec` on October 22, 2026 Eastern. The public
109-check HTTP suite, live database privileges, guarded rollback check and
post-cutover encrypted backup/restore verification passed. Backup snapshot
`12e8d86` was verified on both backup remotes. See the acceptance record below.

The acceptance record is [docs/migration.md](docs/migration.md), which also
holds the 249-check baseline of the PHP implementation it replaced.
