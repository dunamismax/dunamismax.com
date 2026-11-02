# Production

The runbook below describes the current Astro/PostgreSQL/Drizzle workflow;
historical acceptance is in docs/migration.md, not a fresh host inspection. The
deployment model is unchanged by Drizzle; no Next.js, SQLite or mandatory Compose
cutover is planned. The first Drizzle release (`e1c292c`) adopted production on
November 2, 2026; evidence is in BUILD Phase 0.

Follow the shared contract at
`/home/sawyer/github/ubuntu-vm-backup/docs/astro-migration.md`. Root access is
required for deployment. Pushing does not deploy. Never modify other sites.

Authorized root access is `ssh root@ubuntu-vm`; sawyer's `sudo -n` may require
interactive authentication even though root SSH is available. Run privileged
commands in that root session, or use sudo from an authenticated operator shell.
Deployed shell helpers are mode 0644; invoke them with `bash`.

| Item | Setting |
| --- | --- |
| Checkout | `/home/sawyer/github/dunamismax.com` |
| Isolated candidates | `/home/sawyer/astro-candidates/dunamismax/<commit>` |
| Immutable releases | `/srv/www/dunamismax.com/releases/<commit>` |
| Active link | `/srv/www/dunamismax.com/current` |
| Node unit/user | `astro-dunamismax.service` / `astro-dunamismax-web` |
| Listener | `127.0.0.1:4311` (temporary candidate 4323) |
| Runtime | `/opt/astro-runtime/bin/node` 24.22.1 |
| Website credentials | `/etc/astro-apps/dunamismax/web.env` (root-only; systemd loads) |
| Writer credentials | `/etc/astro-apps/dunamismax/publishing.env` (root-only wrapper) |
| Migration credentials | `/etc/astro-apps/dunamismax/migration.env` (operator only) |
| PostgreSQL | `dunamismax`, owner `dunamismax_owner`, schema `app` |
| Caddy fragment | `/etc/caddy/sites/dunamismax.com.caddy` |
| Rollback pointer | `/srv/www/dunamismax.com/last-astro-rollback` |

## Release

On the VM, from a clean committed checkout, with the supported runtime:

```sh
git pull --ff-only origin main
bash deploy/prepare.sh
# Before privileged cutover: fresh host backup; helper takes its own lock.
sudo /home/sawyer/github/ubuntu-vm-backup/bin/backup
sudo /home/sawyer/github/ubuntu-vm-backup/bin/restore check
sudo /home/sawyer/github/ubuntu-vm-backup/bin/restore postgres-verify
# Use the concrete candidate path printed by prepare; do not nest the lock.
sudo with-deploy-lock bash /absolute/candidate/deploy/cutover.sh /absolute/candidate /expected/current/release
```

Prepare archives only committed source into an isolated directory, installs with
npm ci, checks types/tests/build, exercises disposable PostgreSQL 18 fixtures
and HTTP populated/outage/recovery, then hashes the candidate. Production
builds do not receive any database credentials or post exports.

PostgreSQL is authoritative. Ordinary deployment supports Astro-to-Astro release
changes only; it does not read/import MySQL. The original migration evidence is
in docs/migration.md and protected host archives. Obtain a fresh verified host
backup before a release. Cutover runs `dist/cli/bin/schema.js` (Drizzle
migrations as dunamismax_owner); migrations stay additive and rollback-compatible,
and a code rollback never replaces live PostgreSQL data.

Cutover checks the expected active release under the mandatory shared lock,
saves root-only rollback files, installs owning identities and immutable release,
tests a separate hardened candidate service with read-only credentials, validates
the full Caddy config/unit, switches current atomically, starts only the new Node
unit, reloads Caddy and checks public HTTPS behavior/redirects. An error restores
the old release/fragment/unit/wrapper and publishing configuration within the
same lock. Candidate services stop before activation and on failure.

## Verification and rollback

```sh
systemctl is-active astro-dunamismax caddy postgresql@18-main
curl -fsS https://dunamismax.com/healthz
curl -fsSI https://dunamismax.com/about
curl -fsS https://dunamismax.com/feed.xml
sudo with-deploy-lock bash /srv/www/dunamismax.com/current/deploy/rollback.sh /root/CHECKPOINT --check
# If rollback is necessary, same command without --check.
```

Rollback checkpoints hold the previous current link, Caddy fragment, Node
unit/state and independent publishing wrapper. Rollback refuses a stale current
link or a previous release without the Astro server. Historical PHP checkpoints
are for isolated legacy recovery after the server-wide retirement.

PHP/MySQL packages and active pools/settings are retired by final host integration.
Original MySQL files, old releases and protected encrypted archives are retained.
The daily dunamismax-backup timer uses the host's shared PostgreSQL site-backup
helper with isolated restore verification. The host backup captures all databases,
roles, credentials and exact emitted application releases; run encrypted
`restore check`, `postgres-verify` and `applications-verify` after changes.

The root-owned `dunamismax-posts` wrapper uses `/usr/sbin/runuser` explicitly
before dropping privileges. Its restricted PATH deliberately omits sbin. Verify
`dunamismax-posts list` with the normal operator workflow after installation;
never place credentials on command arguments or give them to the website.

## Drizzle schema migrations

`deploy/cutover.sh` already runs `dist/cli/bin/schema.js` from the candidate,
under the exclusive deployment lock (publishing excluded), before the candidate
service starts. On the first Drizzle release it adopts the existing database:
it creates the owner-only `drizzle` journal schema, requires app's catalog to
equal `database/baseline-catalog.json`, records the baseline without executing
it, and proves posts/IDs/sequence/full-content SHA256 unchanged. It refuses and
records nothing if the catalog differs; stop and reconcile rather than editing
the baseline file. Later releases apply only new reviewed migrations. Output is
one JSON line with counts and the content digest, never post text.

The previous Astro release remains compatible: it ignores the journal schema.
Keep later migrations additive so code rollback stays valid. Never run
drizzle-kit push/pull/migrate against production. `verify-database.js` also
checks that web and publishing cannot read or modify the journal.

Before an authorized release, confirm the nightly pg_dump and isolated restore
include the `drizzle` schema with its owner and ACLs alongside data, roles and
the matching application release. A successful timer exit alone does not
establish restore correctness. Keep existing host/site timers; adapt owning
backup tooling only within authorized scope.

Verify Cloudflare DNS plugin support in the existing custom Caddy and use only
zone-scoped Caddy credentials. For proxied DNS, retain Full (strict) with a valid
origin certificate. Missing shared-host prerequisites must be coordinated in
that workflow rather than replacing shared Caddy here. Keep current www/apex
routing and validate complete config before a permitted reload.

Containers remain an optional future packaging choice. They must not require
a second proxy or public PostgreSQL; native host-loopback connectivity needs an
explicit tested network design. Python/Swift tooling is not part of deployment
unless an actual project requirement or explicit request adds it.
