#!/bin/bash
# 03 — Deploy the checkout's HEAD commit as a new release and make it current.
# Safe to re-run: an existing release directory is reused, never overwritten.
# Also installs the daily backup script and timer.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_root
trap smoke_stop EXIT

[ -f "$ETC/site.env" ] || { echo "$ETC/site.env is missing; run 01-provision.sh first." >&2; exit 1; }
[ -S "$SOCKET" ] || { echo "$SOCKET is missing; run 01-provision.sh first." >&2; exit 1; }

commit=$(runuser -u "$OWNER" -- git -C "$REPO" rev-parse HEAD)
if [ -n "$(runuser -u "$OWNER" -- git -C "$REPO" status --porcelain)" ]; then
    echo "$REPO has uncommitted changes. Commit or stash them; releases come from reviewed commits only." >&2
    exit 1
fi
release="$BASE/releases/$commit"

if [ -d "$release" ]; then
    log "Release $commit already exists; reusing it."
else
    log "Building release $commit"
    incoming="$BASE/releases/.incoming-$commit"
    rm -rf -- "$incoming"
    install -d -m 0755 "$incoming"
    runuser -u "$OWNER" -- git -C "$REPO" archive "$commit" | tar -x -C "$incoming"
    chown -R root:root "$incoming"
    find "$incoming" -type d -exec chmod 0755 {} +
    find "$incoming" -type f -exec chmod 0644 {} +
    ln -s "$ETC/site.env" "$incoming/.env"
    mv "$incoming/storage" "$incoming/storage.baseline"
    ln -s "$BASE/shared/storage" "$incoming/storage"
    log "Checks inside the release, as $SITE_USER"
    (cd "$incoming" && runuser -u "$SITE_USER" -- php bin/check.php && runuser -u "$SITE_USER" -- php tests/run.php) \
        || { rm -rf -- "$incoming"; echo "Release checks failed; nothing was switched." >&2; exit 1; }
    mv "$incoming" "$release"
fi

log "Smoke test of the release with production configuration (PHP built-in server)"
smoke_start "$release"
check_routes "$SMOKE_URL"
smoke_stop

if [ -x /usr/local/sbin/dunamismax-backup ] && [ -e "$BASE/current" ]; then
    log "Backup before switching"
    /usr/local/sbin/dunamismax-backup
fi

previous=
if [ -e "$BASE/current" ]; then
    previous=$(readlink -f "$BASE/current")
fi
if [ "$previous" = "$release" ]; then
    log "Release $commit is already current."
else
    if [ -n "$previous" ]; then
        backup "$PREVIOUS_RELEASE_FILE"
        printf '%s\n' "$previous" > "$PREVIOUS_RELEASE_FILE"
    fi
    log "Switching current to $commit"
    ln -sfn "$release" "$BASE/current.next"
    mv -Tf "$BASE/current.next" "$BASE/current"
    if ! php_fpm_reload; then
        echo "PHP-FPM reload failed; switching back." >&2
        if [ -n "$previous" ]; then
            ln -sfn "$previous" "$BASE/current.next" && mv -Tf "$BASE/current.next" "$BASE/current"
        else
            rm -f "$BASE/current"
        fi
        exit 1
    fi
fi

log "Backup script and daily timer"
backup /usr/local/sbin/dunamismax-backup /etc/systemd/system/dunamismax-backup.service /etc/systemd/system/dunamismax-backup.timer
install -o root -g root -m 0750 "$release/deploy/backup.sh" /usr/local/sbin/dunamismax-backup
install -o root -g root -m 0644 "$release/deploy/dunamismax-backup.service" "$release/deploy/dunamismax-backup.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now dunamismax-backup.timer
systemctl start dunamismax-backup.service

if [ -f "$CADDY_SITE" ]; then
    log "Public verification through Caddy and PHP-FPM"
    check_routes "https://$DOMAIN" --resolve "$DOMAIN:443:127.0.0.1"
else
    log "Caddy still points at the old service. Next: sudo bash $DEPLOY_DIR/04-cutover.sh"
fi

cat <<EOF

Deployed $commit.
Verify:
  readlink -f $BASE/current
  ls -la $BACKUPS
  systemctl list-timers dunamismax-backup.timer
  curl -fsS --resolve $DOMAIN:443:127.0.0.1 https://$DOMAIN/healthz   # after cutover
Rollback to the previous release${previous:+ ($previous)}:
  previous=\$(cat $PREVIOUS_RELEASE_FILE) && test -d "\$previous/public" && ln -sfn "\$previous" $BASE/current.rollback && mv -Tf $BASE/current.rollback $BASE/current && systemctl reload php8.5-fpm
EOF
