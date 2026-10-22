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
MYSQL_CONFIG=/etc/dunamismax/publishing.env astro-runtime bash /absolute/candidate/deploy/rehearse-data.sh
# Alternatively run this rehearsal as root under with-deploy-lock.
sudo with-deploy-lock bash /absolute/candidate/deploy/cutover.sh /absolute/candidate /expected/current/release
```

Prepare archives only committed source into an isolated directory, installs with
npm ci, checks types/tests/build, exercises disposable PostgreSQL 18 fixtures
and HTTP populated/outage/recovery, then hashes the candidate. Production
builds do not receive any database credentials or post exports.

The real-source rehearsal reads a consistent MySQL snapshot and imports it twice
into a disposable PostgreSQL 18 cluster with a private Unix socket and no TCP
listener. It reconciles every field and destroys its temporary data on exit.
At first cutover, the transaction freezes legacy publishing and waits for
in-flight publisher connections to finish before exporting the final snapshot.
The schema is additive and explicitly SET ROLEs to the owner. Import/reconcile
compare count and SHA256 over IDs, slugs, titles, excerpts, bodies, statuses and
all UTC timestamps, then reset the identity sequence. Differences abort.
Releases after first cutover keep PostgreSQL authoritative and never re-import
MySQL. Before any such release, run a fresh verified host backup.

Cutover checks the expected active release under the mandatory shared lock,
saves root-only rollback files, installs owning identities and immutable release,
tests a separate hardened candidate service with read-only credentials, validates
the full Caddy config/unit, switches current atomically, starts only the new Node
unit, reloads Caddy and checks public HTTPS behavior/redirects. An error restores
the old release/fragment/unit/wrapper and publishing configuration within the
same lock. Candidate services stop before activation and on failure.

## Verification and rollback

```sh
systemctl is-active astro-dunamismax caddy mysql php8.5-fpm
curl -fsS https://dunamismax.com/healthz
curl -fsSI https://dunamismax.com/about
curl -fsS https://dunamismax.com/feed.xml
sudo with-deploy-lock bash /srv/www/dunamismax.com/current/deploy/rollback.sh /root/CHECKPOINT --check
# If rollback is necessary, same command without --check.
```

Rollback checkpoints hold prior current link, Caddy fragment, Node unit/state,
writer wrapper and original legacy publishing permissions, plus the final data
snapshot and reconciliation reports. Rollback verifies current has not changed.
Before restoring PHP/MySQL it takes the deployment lock (excluding new writers)
and requires PostgreSQL data to match the cutover snapshot. If later writes
exist, it refuses: reconcile those writes with a reviewed reverse migration
before switching writers. Restoring an old dump would discard those writes.

Retain PHP-FPM pool, MySQL database, old releases and `/etc/dunamismax` settings.
The installed legacy `dunamismax-backup` executable/timer remain running as
required by the shared plan; obsolete PHP deployment sources are removed here.
The host backup additionally dumps/encrypts PostgreSQL data, roles and role
credentials and verifies a full isolated PostgreSQL 18 restore on every backup.
After cutover run it again, then encrypted `restore check` and `postgres-verify`.
Verify both configured backup remote tips when the backup is pushed. No database,
credential, shared service or legacy backup cleanup belongs to this migration.
