# Production runbook

## Layout

| Item | Location or setting |
| --- | --- |
| Git checkout | `/home/sawyer/github/dunamismax.com` |
| Releases | `/srv/www/dunamismax.com/releases/<full-commit>` (root-owned, read-only to PHP) |
| Active release | `/srv/www/dunamismax.com/current` symlink |
| Only document root | `/srv/www/dunamismax.com/current/public` |
| Shared storage | `/srv/www/dunamismax.com/shared/storage` (root:sawyer 0750; `drafts/` sawyer 0700) |
| Website configuration | `/etc/dunamismax/site.env`, root:dunamismax 0640, linked as each release's `.env` |
| Publishing configuration | `/etc/dunamismax/publishing.env`, sawyer:sawyer 0600, CLI only |
| System user | `dunamismax` (reused from the Rust service; nologin, home `/nonexistent` after 05) |
| FPM pool | `/etc/dunamismax/php-fpm.conf`, linked as `/etc/php/8.5/fpm/pool.d/dunamismax.conf` |
| FPM socket | `/run/php/dunamismax.sock`, caddy:caddy 0600, `clear_env` |
| MySQL | database `dunamismax` on 127.0.0.1 |
| MySQL accounts | `dunamismax_web` (SELECT), `dunamismax_publish` (SELECT/INSERT/UPDATE on `posts`) |
| Caddy site | `/etc/caddy/sites/dunamismax.com.caddy` (apex and `www` redirect) |
| Access log | `/var/log/caddy/dunamismax-access.log`, 10 MiB × 7, seven days |
| Backups | `/usr/local/sbin/dunamismax-backup`, `dunamismax-backup.timer` daily 06:30 UTC, `/var/backups/dunamismax` (30 days) |

## Migration from the Rust service

Run in order from the checkout, as root, checking each script's printed
verification before continuing. Every script is idempotent. Each one backs up
the files it changes to `/root/dunamismax-backup-<timestamp>/` and prints its
rollback.

| Script | What it does |
| --- | --- |
| `deploy/01-provision.sh` | Reuses the `dunamismax` user and creates directories. Creates the MySQL database and both accounts, generating passwords into the env files without printing them. Installs the FPM pool, runs `php-fpm8.5 -t`, reloads, and checks the socket. |
| `deploy/02-migrate-data.sh` | Inventories PostgreSQL and aborts on any table other than `page_view` or `_sqlx_migrations`. Applies `database/schema.sql` and grants the publisher. No rows are copied: `page_view` is dropped by decision, and there were no posts. |
| `deploy/03-deploy.sh` | Archives HEAD of a clean checkout into a new release and runs the checks as `dunamismax`. Smoke-tests the route checklist with production config, switches `current`, reloads PHP-FPM, and installs the backup timer. |
| `deploy/04-cutover.sh` | Compares old and new status and content type on every route. Moves only the dunamismax blocks from `/etc/caddy/Caddyfile` into the site file, validates as `caddy`, and reloads. Verifies over HTTPS and restores automatically on any failure. |
| `deploy/05-decommission.sh` | Runs last, only after the cutover is confirmed publicly. Writes a `pg_dump` to `/var/backups/dunamismax`. Archives and removes `dunamismax-site.service`, `/opt/dunamismax-site` (binary, `.jar` files, env), and `/etc/sudoers.d/dunamismax-site`. Drops the PostgreSQL `dunamismax` database and role and moves the user's home to `/nonexistent`. |

```sh
cd /home/sawyer/github/dunamismax.com
sudo bash deploy/01-provision.sh
sudo bash deploy/02-migrate-data.sh
sudo bash deploy/03-deploy.sh
sudo bash deploy/04-cutover.sh
# watch the site for a while, then:
sudo bash deploy/05-decommission.sh
```

After 05, status.dunamismax still expects `dunamismax-site.service`; update
that project separately.

## Releasing

Commit, then on the server:

```sh
cd ~/github/dunamismax.com && git pull --ff-only
sudo bash deploy/03-deploy.sh
```

03 refuses a dirty checkout, never overwrites an existing release, and
verifies publicly through Caddy once the site file exists.

## Rollback

Code:

```sh
previous=$(sudo cat /root/dunamismax-previous-release)
sudo test -d "$previous/public"
sudo ln -sfn "$previous" /srv/www/dunamismax.com/current.rollback
sudo mv -Tf /srv/www/dunamismax.com/current.rollback /srv/www/dunamismax.com/current
sudo systemctl reload php8.5-fpm
```

Do not restore the database to undo a code release. The Caddy and
decommission rollbacks are printed by 04 and 05, with the exact backup paths.

## Backups and restore

`dunamismax-backup` writes `dunamismax-<stamp>.tar.gz` with a SHA-256
checksum. Each archive holds:

- A transactional MySQL dump.
- Both env files, the pool, the Caddy site file, and the backup units.
- The release path, the application tree, and shared storage.

Archives contain credentials. To test a restore, extract into a private
temporary directory and load `database.sql.gz` into a new
`dunamismax_restore_test` database. A dump does not recreate MySQL accounts;
recreate them with the passwords from the saved env files.

```sh
sudo systemctl start dunamismax-backup.service
systemctl list-timers dunamismax-backup.timer
journalctl -u dunamismax-backup.service -n 20 --no-pager
```
