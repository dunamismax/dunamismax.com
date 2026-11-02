# Production

## Existing Astro runbook

The settings and commands in this section describe the checked-in Astro release
workflow, with dated acceptance in `docs/migration.md`; they are not a fresh
inspection of the host. [BUILD Phase 0](../BUILD.md#phase-0--unified-stack-rewrite-first-not-started)
plans the Next.js/Compose replacement below. Existing cutover/rollback helpers
support Astro only: do not use them unchanged for a Next candidate. This planning
change does not authorize or perform a production deployment.

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

## Next.js/Compose target — not installed

The rewrite keeps this site's Caddy upstream, native PostgreSQL database and
secret locations. Do not migrate the shared database service or other sites.
Before any authorized release, read the shared host contract above and its
successor, if present; verify the actual inventory, port availability, backup
coverage and current release. The old Astro paths/names below are compatibility
choices to avoid unrelated host changes, not claims that Compose is installed.

| Item | Planned convention |
| --- | --- |
| Repo deployment inputs | Root `Dockerfile`, `.dockerignore`, `compose.yaml`; site template `deploy/Caddyfile` |
| Compose identity | Explicit project `dunamismax`; default service `web`; manual tools `publisher` and `migrate` |
| Web artifact | Exact commit-tagged image plus recorded digest; generated Next standalone `server.js`, `.next/static`, `public` |
| Operator artifact | Separate tools image/target with compiled CLI and reviewed Drizzle migrations; never served as web files |
| Network | Ubuntu Linux host networking, application `HOSTNAME=127.0.0.1`, `PORT=4311`; candidate 4323 after availability check |
| Database | Native `dunamismax` on `127.0.0.1:5432`, schema `app`, existing per-role credentials |
| Secret inputs | Existing root-only `/etc/astro-apps/dunamismax/{web,publishing,migration}.env`; only matching file loaded for each service |
| Caddy ownership | Existing `/etc/caddy/Caddyfile` and `/etc/caddy/sites/dunamismax.com.caddy`; `/usr/local/lib/caddy/caddy` |
| Release records | `/srv/www/dunamismax.com/releases/<commit>` plus atomic `current`, image digests and root-only rollback checkpoint |
| Coordination | Existing `with-deploy-lock` / `/run/astro-deploy/lock`, descriptor 9; publisher uses shared lock, release uses exclusive lock |

### Network choice

Use `network_mode: host` for the Ubuntu production web and operator containers.
The app explicitly binds `127.0.0.1:4311` (candidate 4323), and PostgreSQL remains
on host loopback. Host networking shares the host namespace and does not use
Compose `ports` mappings; retain the loopback bind instead of the Docker example's
`0.0.0.0`. This trades network namespace isolation for compatibility with the
existing loopback-only native database, avoiding a shared PG configuration change.
[Docker host networking](https://docs.docker.com/engine/network/drivers/host/).

A bridge container's `127.0.0.1` refers to that container. Adding
`host.docker.internal:host-gateway` does not make a PostgreSQL listener bound
only to host loopback listen on the bridge gateway. Do not solve connection
errors by publishing PG publicly, changing shared `listen_addresses` or widening
`pg_hba.conf`. Do not bind the standalone server to all host interfaces in host
network mode. Confirm listeners and denied remote access in acceptance tests.

Local development may use npm dev with an isolated native local DB. If a Mac
Compose setup is useful, keep it in a development-only override with a private
web/PG network, `PGHOST` set to the database service, and a loopback-published web
port (for example `127.0.0.1:8000:3000`, container `HOSTNAME=0.0.0.0`). Production
must not inherit that override or start a second database/proxy. Disposable
integration databases retain the `_test` suffix guard.

### Images, credentials and operator tooling

Use a pinned multi-stage Node image, exact package versions and `npm ci`. Build
without any DB connection, runtime env files, private snapshots or build secrets.
Copy standalone output, `.next/static` and `public` into a non-root runtime;
those last two directories need explicit copies. Disable telemetry and verify
the runtime has all assets using the actual production image.
[Next standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).

The privileged release operator loads only `web.env` for web, `publishing.env`
for publisher, and `migration.env` for migrate, through separate Compose service
configuration. Retain existing protected files and credential roles. Do not
merge env files, mount the Docker socket into a service, add credentials to
image layers/arguments, or print secret-expanded Compose configuration. Validate
configuration quietly. Operator profiles do not run during normal web startup;
the web image/process cannot invoke migrations or publish.

Rewrite the root-owned `dunamismax-posts` wrapper to hold its shared lock for the
entire one-off publisher invocation, preserving the existing command interface,
non-root execution and trusted-wrapper configuration boundary. Do not pass web
credentials as a fallback. Migrations run separately under the release lock with
the migration role; neither web nor publisher receives that role or journal DDL
privilege. Protect any tools/credential config from public static serving.

### Caddy and Cloudflare TLS

Keep the existing www-to-apex redirect, upstream and security/logging policy.
Inspect the custom Caddy binary for `dns.providers.cloudflare` and verify the
site's DNS challenge. Keep its scoped token only in Caddy's protected environment,
never in the application, Compose web env or committed Caddyfile. Scope token
permissions to Zone Read and DNS Edit for the intended zone, as documented by
the [Cloudflare DNS module](https://github.com/caddy-dns/cloudflare). If the
plugin is absent, a compatible custom build/install is a shared-host prerequisite
for the owner to coordinate; this site release must not replace shared Caddy.

For orange-cloud DNS, verify Cloudflare
[Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
and a valid, matching origin certificate. Preserve DNS and unrelated site routes;
validate the complete Caddy configuration before a permitted reload. Do not
restart Caddy or add Coolify/Dokploy and a competing proxy in this migration.
Test both public HTTPS and the site-local origin, including www path/query
redirects, TLS, framework assets, CSP and uncached writing responses.

### Transactional release, rollback and backup acceptance

Rewrite the existing candidate/cutover/rollback scripts before use. Build and
test on an isolated candidate port before the privileged transaction. Hold the
same existing exclusive lock through schema adoption/migration, publishing
exclusion, expected-current checks, active-service switch and any rollback.
Use additive schema changes readable by the old Astro code. Save its exact
release/unit/Caddy fragment/wrapper and the new Compose image digest/config.

After candidate acceptance, switch the release record atomically, stop only the
old site service and start only this project's web container on 4311. On failure,
stop that container before restoring the old site process, pointer, route and
publisher. Rehearse Astro-to-Next and Next-to-Next recovery without replacing
live database contents. Do not delete rollback images/releases or run global
Compose down/prune/volume deletion. Shared Caddy/PG and other apps stay running.

Before cutover, privately reconcile counts, full-field digests, identity sequence
and ACLs on nonempty restored data. Verify an actual nightly `pg_dump`, encrypted
off-server copy and isolated restore, not just a successful timer exit. Preserve
existing site/host backup timers and test that restore includes roles/ACLs,
Drizzle journal and active app configuration plus retrievable matching images.
Use existing host restore verification commands where supported; adapt them to
container artifacts in the owning backup project only when authorized. Do not
publish backup destinations, credentials, drafts or decrypted archives.

Record local/container tests separately from live acceptance in
`docs/migration.md`. A future release record needs the commit/digest, remote tips,
service/listener, true HTTP statuses, database privileges and reconciliation,
TLS/CSP checks, backup/restore and rollback evidence. No Next deployment or host
backup verification has been performed by this documentation change.
