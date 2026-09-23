#!/bin/bash
# 05 — Decommission the Rust site after a verified cutover. Run last.
# Removes dunamismax-site.service, /opt/dunamismax-site (binary, old .jar
# files, site.env), /etc/sudoers.d/dunamismax-site, and the PostgreSQL
# dunamismax database and role. Takes a pg_dump to /var/backups/dunamismax and
# archives everything it removes to /root/dunamismax-backup-<timestamp>/ first.
# Safe to re-run: every step skips what is already gone.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_root
cd /   # postgres must be able to read the working directory

UNIT=dunamismax-site.service
OLD_DIR=/opt/dunamismax-site
SUDOERS=/etc/sudoers.d/dunamismax-site
resolve=(--resolve "$DOMAIN:443:127.0.0.1")

log "Confirming the cutover before removing anything"
[ -f "$CADDY_SITE" ] || { echo "$CADDY_SITE is missing; run 04-cutover.sh first." >&2; exit 1; }
if grep -E '^(www\.)?dunamismax\.com[[:space:]]*\{' "$CADDYFILE" >/dev/null; then
    echo "$CADDYFILE still has a dunamismax block; run 04-cutover.sh first." >&2
    exit 1
fi
expect_status "https://$DOMAIN/healthz" 200 "${resolve[@]}"
expect_status "https://$DOMAIN/js/theme.js" 404 "${resolve[@]}"   # the Rust app served this; PHP does not
curl -sS "${resolve[@]}" "https://$DOMAIN/" | grep -F 'PHP-first web work' >/dev/null \
    || { echo "The public home page is not the PHP site; aborting." >&2; exit 1; }

log "PostgreSQL backup"
pg_database_exists() {
    runuser -u postgres -- psql -lqtA | cut -d'|' -f1 | grep -x "$DB_NAME" >/dev/null
}
pg_role_exists() {
    [ "$(runuser -u postgres -- psql -tAc "SELECT COUNT(*) FROM pg_roles WHERE rolname = '$DB_NAME'")" = 1 ]
}
install -d -o root -g "$OWNER" -m 0750 "$BACKUPS"
install -d -m 0700 "$BACKUP_DIR"
if pg_database_exists; then
    unexpected=$(pg_unexpected_tables)
    if [ -n "$unexpected" ]; then
        echo "Unexpected PostgreSQL tables ($unexpected); they were never migrated. Aborting." >&2
        exit 1
    fi
    dump="$BACKUPS/postgres-$DB_NAME-$STAMP.dump"
    runuser -u postgres -- pg_dump --format=custom "$DB_NAME" > "$dump"
    runuser -u postgres -- pg_restore --list < "$dump" >/dev/null
    chown root:"$OWNER" "$dump"
    chmod 0640 "$dump"
    (cd "$BACKUPS" && sha256sum "$(basename "$dump")" > "$dump.sha256")
    chown root:"$OWNER" "$dump.sha256"
    chmod 0640 "$dump.sha256"
    log "PostgreSQL dump verified: $dump"
fi
if pg_role_exists; then
    # Only this role's definition (it includes the password hash); root-only.
    runuser -u postgres -- pg_dumpall --roles-only \
        | grep -E "^(CREATE|ALTER) ROLE $DB_NAME( |;)" > "$BACKUP_DIR/postgres-role-$DB_NAME.sql" || true
fi

log "Stopping and removing $UNIT"
if systemctl cat "$UNIT" >/dev/null 2>&1; then
    fragment=$(systemctl show -p FragmentPath --value "$UNIT")
    dropins=$(systemctl show -p DropInPaths --value "$UNIT")
    # shellcheck disable=SC2086 # drop-in paths are space separated
    backup $fragment $dropins
    systemctl disable --now "$UNIT"
    # shellcheck disable=SC2086
    rm -f $fragment $dropins
    rmdir --ignore-fail-on-non-empty "/etc/systemd/system/$UNIT.d" 2>/dev/null || true
    systemctl daemon-reload
    systemctl reset-failed "$UNIT" 2>/dev/null || true
fi

log "Removing $OLD_DIR"
if [ -d "$OLD_DIR" ]; then
    tar -czf "$BACKUP_DIR/opt-dunamismax-site.tar.gz" -C /opt dunamismax-site
    tar -tzf "$BACKUP_DIR/opt-dunamismax-site.tar.gz" >/dev/null
    rm -rf -- "$OLD_DIR"
fi

log "Removing $SUDOERS"
if [ -e "$SUDOERS" ]; then
    backup "$SUDOERS"
    rm -f "$SUDOERS"
    if ! visudo -c >/dev/null; then
        echo "sudoers no longer validates; restoring $SUDOERS." >&2
        cp -a "$BACKUP_DIR$SUDOERS" "$SUDOERS"
        exit 1
    fi
fi

log "Dropping the PostgreSQL database and role"
if pg_database_exists; then
    runuser -u postgres -- psql -v ON_ERROR_STOP=1 -c "DROP DATABASE $DB_NAME"
fi
if pg_role_exists; then
    runuser -u postgres -- psql -v ON_ERROR_STOP=1 -c "DROP ROLE $DB_NAME"
fi

log "Moving the $SITE_USER user's home off the removed /opt directory"
if [ "$(getent passwd "$SITE_USER" | cut -d: -f6)" = "$OLD_DIR" ]; then
    # usermod refuses while any process runs as the user, and the PHP-FPM pool
    # does whenever the site had a request in the last 10 seconds (ondemand
    # idle timeout). Retry for a minute; the home of a nologin system user is
    # cosmetic, so a still-busy user is a warning, not a failure.
    moved=no
    for _ in $(seq 1 30); do
        if usermod --home /nonexistent "$SITE_USER" 2>/dev/null; then
            moved=yes
            break
        fi
        sleep 2
    done
    if [ "$moved" = no ]; then
        echo "WARNING: $SITE_USER stayed busy (PHP-FPM workers); its home is still $OLD_DIR. Rerun this script later." >&2
    fi
fi

log "Verification"
# Timestamped names sort chronologically; the last match is the newest.
archives=(/root/dunamismax-backup-*/opt-dunamismax-site.tar.gz)
archive_dir=$(dirname "${archives[-1]}")
dumps=("$BACKUPS"/postgres-"$DB_NAME"-*.dump)
latest_dump=${dumps[-1]}
systemctl cat "$UNIT" >/dev/null 2>&1 && { echo "FAIL: $UNIT still exists" >&2; exit 1; }
[ ! -e "$OLD_DIR" ] && [ ! -e "$SUDOERS" ] || { echo "FAIL: old files remain" >&2; exit 1; }
pg_database_exists && { echo "FAIL: PostgreSQL database remains" >&2; exit 1; }
pg_role_exists && { echo "FAIL: PostgreSQL role remains" >&2; exit 1; }
check_routes "https://$DOMAIN" "${resolve[@]}"

cat <<EOF

Decommission complete. The Rust service, its files, sudoers rule, and
PostgreSQL database/role are gone; the site runs on Caddy + PHP-FPM + MySQL.
Removed files are archived in $archive_dir; the PostgreSQL dump is $latest_dump.
Note: status.dunamismax still lists $UNIT as a monitored unit until that
project is updated.
Verify:
  systemctl status $UNIT          # "could not be found"
  ls $OLD_DIR $SUDOERS            # no such file
  sudo -u postgres psql -lqt | cut -d'|' -f1 | grep -x $DB_NAME   # no output
  curl -fsS https://$DOMAIN/healthz
Rollback (restores the Rust service; then reverse 04 to send traffic back):
  tar -xzf $archive_dir/opt-dunamismax-site.tar.gz -C /opt
  cp -a $archive_dir/etc/systemd/system/$UNIT /etc/systemd/system/ && cp -a $archive_dir$SUDOERS $SUDOERS
  sudo -u postgres psql < $archive_dir/postgres-role-$DB_NAME.sql
  sudo -u postgres createdb -O $DB_NAME $DB_NAME && sudo -u postgres pg_restore -d $DB_NAME < $latest_dump
  usermod --home $OLD_DIR $SITE_USER && systemctl daemon-reload && systemctl enable --now $UNIT
EOF
