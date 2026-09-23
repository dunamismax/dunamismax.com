# shellcheck shell=bash disable=SC2034
# Shared settings and helpers for the numbered root scripts in this directory.
# Sourced, never run directly. Each script sets `set -euo pipefail` itself.

SITE=dunamismax
DOMAIN=dunamismax.com
SITE_USER=dunamismax
REPO=/home/sawyer/github/dunamismax.com
OWNER=sawyer
BASE=/srv/www/dunamismax.com
ETC=/etc/dunamismax
POOL_LINK=/etc/php/8.5/fpm/pool.d/dunamismax.conf
SOCKET=/run/php/dunamismax.sock
DB_NAME=dunamismax
DB_WEB_USER=dunamismax_web
DB_PUBLISH_USER=dunamismax_publish
CADDY=/usr/local/lib/caddy/caddy
CADDYFILE=/etc/caddy/Caddyfile
CADDY_SITE=/etc/caddy/sites/dunamismax.com.caddy
BACKUPS=/var/backups/dunamismax
PREVIOUS_RELEASE_FILE=/root/dunamismax-previous-release
DEPLOY_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_DIR=/root/dunamismax-backup-$STAMP

require_root() {
    if [ "$(id -u)" -ne 0 ]; then
        echo "Run as root: sudo bash $0" >&2
        exit 1
    fi
}

log() {
    printf '==> %s\n' "$*"
}

# Copy each existing path (file, symlink, or directory) into this run's
# backup directory, preserving its absolute path underneath it.
backup() {
    local path
    for path in "$@"; do
        if [ -e "$path" ] || [ -L "$path" ]; then
            install -d -m 0700 "$BACKUP_DIR"
            cp -a --parents "$path" "$BACKUP_DIR/"
            log "Backed up $path to $BACKUP_DIR$path"
        fi
    done
}

mysql_root() {
    mysql --protocol=socket --batch --skip-column-names "$@"
}

mysql_user_exists() {
    [ "$(mysql_root -e "SELECT COUNT(*) FROM mysql.user WHERE user = '$1' AND host = '127.0.0.1'")" = "1" ]
}

caddy_validate() {
    runuser -u caddy -- env HOME=/var/lib/caddy "$CADDY" validate --config "$CADDYFILE" --adapter caddyfile
}

# Never reload a configuration that fails the test (callers use `||`, where
# bash suspends `set -e`). Reload, never restart: other sites share it.
php_fpm_reload() {
    php-fpm8.5 -t || return 1
    systemctl reload php8.5-fpm
}

# Start PHP's built-in server on a free loopback port for a release, as the
# site user so it reads the protected .env exactly like PHP-FPM does.
# Sets SMOKE_PID and SMOKE_URL; call smoke_stop when done.
smoke_start() {
    local release=$1 port
    # shellcheck disable=SC2016 # PHP code, not shell
    port=$(php -r '$s = stream_socket_server("tcp://127.0.0.1:0"); echo explode(":", stream_socket_get_name($s, false))[1];')
    runuser -u "$SITE_USER" -- php -S "127.0.0.1:$port" -t "$release/public" "$release/dev/router.php" >/dev/null 2>&1 &
    SMOKE_PID=$!
    SMOKE_URL="http://127.0.0.1:$port"
    for _ in $(seq 1 50); do
        if curl -fsS -o /dev/null "$SMOKE_URL/healthz" 2>/dev/null; then
            return 0
        fi
        sleep 0.1
    done
    echo "Smoke server for $release did not start." >&2
    smoke_stop
    return 1
}

smoke_stop() {
    if [ -n "${SMOKE_PID:-}" ]; then
        kill "$SMOKE_PID" 2>/dev/null || true
        wait "$SMOKE_PID" 2>/dev/null || true
        SMOKE_PID=
    fi
}

# expect_status URL CODE [extra curl args...]
expect_status() {
    local url=$1 want=$2 got
    shift 2
    got=$(curl -sS -o /dev/null -w '%{http_code}' "$@" "$url" || true)
    if [ "$got" != "$want" ]; then
        echo "FAIL: $url returned $got, expected $want" >&2
        return 1
    fi
    printf '    %s %s\n' "$got" "$url"
}

# The public route checklist, used before and after cutover. Counts failures
# explicitly: callers use it inside `||`, where bash suspends `set -e`.
# check_routes BASE [extra curl args...]
check_routes() {
    local base=$1 path failures=0
    shift
    for path in / /about /contact /projects /blog /feed.xml /robots.txt /manifest.webmanifest /healthz; do
        expect_status "$base$path" 200 "$@" || failures=$((failures + 1))
    done
    for path in /blog/does-not-exist /missing /js/theme.js /.env /index.php; do
        expect_status "$base$path" 404 "$@" || failures=$((failures + 1))
    done
    expect_status "$base/" 405 -X POST "$@" || failures=$((failures + 1))
    [ "$failures" -eq 0 ]
}

# Legacy PostgreSQL base tables (views such as pg_stat_statements hold no data).
pg_base_tables() {
    runuser -u postgres -- psql -d "$DB_NAME" -tAc \
        "SELECT table_schema || '.' || table_name FROM information_schema.tables
         WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY 1"
}

# Tables that hold no site content: the page_view analytics (dropped by
# decision) and migration bookkeeping from the Rust (sqlx) and earlier Java
# (Flyway) versions. Anything else was never migrated and must stop the run.
pg_unexpected_tables() {
    pg_base_tables | grep -vx -e '' -e public.page_view -e public._sqlx_migrations -e public.flyway_schema_history || true
}
