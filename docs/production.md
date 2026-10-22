# Production

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
