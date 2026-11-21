# Production

The SvelteKit/PostgreSQL/Drizzle site (SvelteKit 3, adapter-node, Tailwind CSS
4, PostgreSQL 18, Caddy) runs as a systemd unit on Node 26.13.1. The first
SvelteKit releases went live on November 20, 2026 (BUILD Phase 1); the move to
pnpm, Node 26 and the fix-forward deploy is BUILD M.5.

The shared host contract,
`/home/sawyer/github/ubuntu-vm-backup/docs/web-platform.md`, is authoritative;
this page applies it to this site. Root access is required for deployment.
Pushing does not deploy. Never modify other sites.

Authorized root access is `ssh root@ubuntu-vm`; sawyer's `sudo -n` may require
interactive authentication even though root SSH is available.

| Item | Setting |
| --- | --- |
| Checkout | `/home/sawyer/github/dunamismax.com` |
| Build work | `/home/sawyer/web-work/dunamismax.com-<commit>/` (`src/`, `release/`, `rehearsal.log`) |
| Immutable releases | `/srv/www/dunamismax.com/releases/<commit>` (`REVISION`, `.node-version`, `package.json`, `dist/`, production `node_modules/`, `deploy/`, `drizzle/`, `database/`) |
| Active link | `/srv/www/dunamismax.com/current` |
| Node unit/user | `dunamismax.service` / `dunamismax-web` |
| Listener | `127.0.0.1:4311`; the candidate takes the first free port in 4400–4499 |
| Runtime | `/opt/node-26/bin/node` (26.13.1); builds use `node-26 pnpm ...` |
| Website credentials | `/etc/web-apps/dunamismax/web.env` (root-only; systemd loads) |
| Writer credentials | `/etc/web-apps/dunamismax/publishing.env` (root-only wrapper) |
| Migration credentials | `/etc/web-apps/dunamismax/migration.env` (the deploy's migration step only) |
| Pre-migration dumps | `/var/backups/dunamismax.com/pre-migrate-<commit>.dump` (root, 0600) |
| PostgreSQL | `dunamismax`, owner `dunamismax_owner`, schema `app` |
| Caddy fragment | `/etc/caddy/sites/dunamismax.com.caddy` (changed only through `caddy-apply`) |

## Release

Fix forward only. On the VM, after the commit is on `origin/main`:

```sh
# 1. Build and check, outside the lock, as sawyer:
cd /home/sawyer/github/dunamismax.com && git pull --ff-only origin main
bash deploy/build.sh                 # default: origin/main
# Owner's D-9: a fresh verified host backup before the deploy, when authorized.
# 2-8. As root, in ONE lock process (never hold the lock from another session):
with-deploy-lock bash /home/sawyer/web-work/dunamismax.com-COMMIT/src/deploy/deploy.sh COMMIT
```

`deploy/build.sh` refuses anything but `origin/main`, extracts it with
`git archive`, installs with `pnpm install --frozen-lockfile`, runs check,
db:check, the unit tests, the production build, the disposable PostgreSQL 18
rehearsal (kept as `rehearsal.log`) and the shell checks, then assembles
`release/`: production dependencies installed fresh from the lockfile
(`--prod`), the build output, `deploy/`, `drizzle/`, `database/` and `REVISION`. Builds
never receive database credentials or post exports.

`deploy/deploy.sh COMMIT`, as root under the lock:

1. **Stage**: copies the build to `releases/<commit>.staging`, root-owned and
   read-only to the service account, then renames it into place. An existing
   release directory must be identical to the build or the deploy stops.
2. **Migrate**: dumps the database to `/var/backups/dunamismax.com/`, runs
   `dist/cli/bin/schema.js` as `dunamismax-web` with only `migration.env`
   (`systemd-run`), checks that `drizzle.__drizzle_migrations` has as many rows
   as the release's journal has entries, and runs the privilege report
   (`verify-database.js`).
3. **Candidate**: starts the new release from its final directory as a
   transient copy of the *new* unit file on a free port in 4400–4499, waits for
   `/healthz` to answer `{"status":"ok","revision":"<commit>","database":"ok"}`,
   runs the HTTP smoke check (`dist/cli/tests/http.js`, the same script that
   checks production) as sawyer, and always stops and removes the candidate.
4. **Switch**: installs the unit (and the publishing wrapper) if changed,
   verifies it, switches `current` atomically and restarts `dunamismax`.
5. **Verify**: `/healthz` on 4311 reports the commit, the smoke check passes,
   and `bin/web-live dunamismax.service` reports the release directory, the
   revision, `/opt/node-v26.13.1-linux-x64/bin/node` and state `current`.
6. **Caddy**: only if `deploy/Caddyfile` differs from the installed fragment,
   `caddy-apply dunamismax.com <release>/deploy/Caddyfile`.
7. **Record**: `logger -t web-deploy`, then the smoke check against
   https://dunamismax.com and the www redirect check.

**When a step fails** the script stops and names the step. Before the switch
the previous release is still serving and nothing needs undoing beyond the
candidate unit, which the script removes. After the switch the new release is
live: read `journalctl -u dunamismax`, fix it in a new commit and deploy that.
Never point `current` at an older release, restore a unit or fragment, or keep
copies to go back. A pre-migration dump is restored over live data only by the
owner's decision, never as a deploy step.

## Verification

```sh
systemctl is-active dunamismax caddy postgresql@18-main
curl -fsS https://dunamismax.com/healthz     # revision is the live commit
sudo bash /home/sawyer/github/ubuntu-vm-backup/bin/web-live dunamismax.service
curl -fsSI https://dunamismax.com/about
curl -fsS https://dunamismax.com/feed.xml
journalctl -u dunamismax --since today
```

What is live is read from the running process (`web-live`) or `/healthz`,
never from the checkout.

The daily dunamismax-backup timer uses the host's shared PostgreSQL site-backup
helper with isolated restore verification. The host backup captures all
databases, roles, credentials and the active application release; run
encrypted `restore check`, `postgres-verify` and `applications-verify` after
changes.

The root-owned `dunamismax-posts` wrapper uses `/usr/sbin/runuser` explicitly
before dropping privileges and runs `/opt/node-26/bin/node`. Its restricted PATH
deliberately omits sbin. Verify `dunamismax-posts list` with the normal
operator workflow after installation; never place credentials on command
arguments or give them to the website.

## Drizzle schema migrations

`deploy/deploy.sh` runs `dist/cli/bin/schema.js` from the staged release as
the service account with `migration.env`, under the exclusive deployment lock
(publishing excluded), before the candidate service starts. On the first Drizzle release it adopts the existing database:
it creates the owner-only `drizzle` journal schema, requires app's catalog to
equal `database/baseline-catalog.json`, records the baseline without executing
it, and proves posts/IDs/sequence/full-content SHA256 unchanged. It refuses and
records nothing if the catalog differs; stop and reconcile rather than editing
the baseline file. Later releases apply only new reviewed migrations. Output is
one JSON line with counts and the content digest, never post text.

Migrations run before the candidate while the previous release is still
serving, and releases only move forward, so every migration must leave the
running release working: add tables, nullable or defaulted columns and indexes;
remove or rename only in a later release. Never run
drizzle-kit push/pull/migrate against production. `verify-database.js` also
checks that web and publishing cannot read or modify the journal.

Before an authorized release, confirm the nightly pg_dump and isolated restore
include the `drizzle` schema with its owner and ACLs alongside data, roles and
the matching application release. A successful timer exit alone does not
establish restore correctness. Keep existing host/site timers; adapt owning
backup tooling only within authorized scope.

DNS is owner-managed, DNS-only Cloudflare records pointing at the server's public
IP; the existing custom Caddy obtains its own Let's Encrypt certificates. There
is no Cloudflare DNS challenge, plugin or token. Shared-host changes must be
coordinated in that workflow rather than replacing shared Caddy here. Keep current www/apex
routing and validate complete config before a permitted reload.

Production runs as the systemd unit, never in a container (host contract,
owner decision of 2026-11-21); containers are fine for local development and
tests only. Python/Swift tooling is not part of deployment
unless an actual project requirement or explicit request adds it.
