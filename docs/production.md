# Production

The runbook below describes the current Astro/PostgreSQL workflow; historical
acceptance is in docs/migration.md, not a fresh host inspection. The final target
retains this deployment model. BUILD Phase 0 adopts Drizzle in place; no Next.js,
SQLite or mandatory Compose cutover is planned. This docs session does not deploy.

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
backup before a release. The schema remains additive and explicitly SET ROLEs
to its owner; a code rollback never replaces live PostgreSQL data.

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

## Pending Drizzle release work

Keep the site-scoped systemd unit, loopback Node/native PostgreSQL, per-role env
files, Caddy fragment/custom binary, immutable releases and deployment lock.
Adapt prepare/cutover/schema/verification tooling only for the reviewed Drizzle
artifacts and migration entrypoint. Build without production credentials; do
not run migrations in web startup. Existing PostgreSQL credentials and ACLs
remain independent and unchanged in purpose. No new database is required.

Before an authorized release, rehearse fresh installation and nonempty schema
adoption, preserving exact data/IDs/timestamps/sequence and privilege denials.
Keep the previous Astro release schema-compatible for rollback; code rollback
must never overwrite newer authoritative PostgreSQL writes. Exclude publishing
and hold the shared exclusive lock through schema migration, switch and rollback.
Do not restart shared PostgreSQL/Caddy or alter other sites.

Verify nightly pg_dump, encrypted off-server copies and an isolated restore of
data, roles, ACLs, migration journal and the matching application release. Keep
existing host/site timers and adapt owning backup tooling only within authorized
scope. A successful timer exit alone does not establish restore correctness.

Verify Cloudflare DNS plugin support in the existing custom Caddy and use only
zone-scoped Caddy credentials. For proxied DNS, retain Full (strict) with a valid
origin certificate. Missing shared-host prerequisites must be coordinated in
that workflow rather than replacing shared Caddy here. Keep current www/apex
routing and validate complete config before a permitted reload.

Containers remain an optional future packaging choice. They must not require
a second proxy or public PostgreSQL; native host-loopback connectivity needs an
explicit tested network design. Python/Swift tooling is not part of deployment
unless an actual project requirement or explicit request adds it.
