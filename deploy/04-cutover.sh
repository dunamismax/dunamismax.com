#!/bin/bash
# 04 — Cut dunamismax.com over from the Rust service to Caddy + PHP-FPM.
# Moves only this site's blocks out of /etc/caddy/Caddyfile into
# /etc/caddy/sites/dunamismax.com.caddy, validates as the caddy user, reloads,
# and verifies publicly. Any failure restores the previous Caddy files.
# The old service keeps running until 05-decommission.sh.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
require_root
trap smoke_stop EXIT

[ -f "$BASE/current/public/index.php" ] || { echo "No current release; run 03-deploy.sh first." >&2; exit 1; }
[ -S "$SOCKET" ] || { echo "$SOCKET is missing; run 01-provision.sh first." >&2; exit 1; }

log "Route checklist: new release (built-in server, production config)"
smoke_start "$(readlink -f "$BASE/current")"
check_routes "$SMOKE_URL"

old=http://127.0.0.1:8080
if curl -fsS -o /dev/null "$old/healthz" 2>/dev/null; then
    log "Comparing status and content type with the running Rust service"
    mismatch=0
    for path in / /about /contact /projects /blog /blog/does-not-exist /feed.xml /robots.txt /manifest.webmanifest /healthz /missing; do
        before=$(curl -sS -o /dev/null -w '%{http_code} %{content_type}' "$old$path")
        after=$(curl -sS -o /dev/null -w '%{http_code} %{content_type}' "$SMOKE_URL$path")
        printf '    %-24s old: %-40s new: %s\n' "$path" "$before" "$after"
        [ "$before" = "$after" ] || mismatch=1
    done
    [ "$mismatch" = 0 ] || { echo "Old and new responses differ; not cutting over." >&2; exit 1; }
else
    log "The Rust service is not answering on $old; skipping the side-by-side comparison."
fi
smoke_stop

log "Preparing Caddy configuration"
site_existed=no
if [ -f "$CADDY_SITE" ]; then
    site_existed=yes
fi
backup "$CADDYFILE" "$CADDY_SITE"
stripped=$(mktemp)
trap 'smoke_stop; rm -f "$stripped"' EXIT
awk -f "$DEPLOY_DIR/strip-caddy-blocks.awk" "$CADDYFILE" > "$stripped"
if grep -E '^(www\.)?dunamismax\.com[[:space:]]*\{' "$stripped" >/dev/null \
    || ! grep -F 'import /etc/caddy/sites/*.caddy' "$stripped" >/dev/null; then
    echo "Unexpected Caddyfile shape after removing the dunamismax blocks; nothing changed." >&2
    exit 1
fi

restore_caddy() {
    echo "Restoring the previous Caddy configuration." >&2
    cat "$BACKUP_DIR$CADDYFILE" > "$CADDYFILE"
    if [ "$site_existed" = yes ]; then cp -a "$BACKUP_DIR$CADDY_SITE" "$CADDY_SITE"; else rm -f "$CADDY_SITE"; fi
    caddy_validate && systemctl reload caddy
    exit 1
}

install -o root -g root -m 0644 "$DEPLOY_DIR/Caddyfile" "$CADDY_SITE"
cat "$stripped" > "$CADDYFILE"   # keeps the file's owner and mode
if [ ! -e /var/log/caddy/dunamismax-access.log ]; then
    install -o caddy -g caddy -m 0640 /dev/null /var/log/caddy/dunamismax-access.log
fi

log "Validating as the caddy user"
caddy_validate || restore_caddy
log "Reloading Caddy"
systemctl reload caddy || restore_caddy

log "Public verification through Caddy and PHP-FPM"
sleep 1
resolve=(--resolve "$DOMAIN:443:127.0.0.1" --resolve "www.$DOMAIN:443:127.0.0.1")
verify() {
    check_routes "https://$DOMAIN" "${resolve[@]}" || return 1
    expect_status "https://$DOMAIN/css/site.css" 200 "${resolve[@]}" || return 1
    expect_status "https://$DOMAIN/icon.svg" 200 "${resolve[@]}" || return 1
    expect_status "https://www.$DOMAIN/about" 301 "${resolve[@]}" || return 1
    [ "$(curl -sS -o /dev/null -w '%{redirect_url}' "${resolve[@]}" "https://www.$DOMAIN/about")" = "https://$DOMAIN/about" ] || return 1
    curl -sS "${resolve[@]}" "https://$DOMAIN/" | grep -F 'PHP-first web work' >/dev/null || return 1
    curl -sSI "${resolve[@]}" "https://$DOMAIN/css/site.css" | grep -i '^content-type: text/css' >/dev/null || return 1
}
verify || restore_caddy

cat <<EOF

Cutover complete: https://$DOMAIN is served by Caddy + PHP-FPM from $(readlink -f "$BASE/current").
The Rust service is still running but no longer receives traffic.
Verify:
  curl -fsSI https://$DOMAIN/ | sed -n '1,20p'
  curl -fsS https://$DOMAIN/healthz
  curl -sSI https://www.$DOMAIN/ | grep -i '^location'
  tail -n 5 /var/log/caddy/dunamismax-access.log
Next, once you are satisfied: sudo bash $DEPLOY_DIR/05-decommission.sh
Rollback (the Rust service on 127.0.0.1:8080 is untouched):
  cp $BACKUP_DIR$CADDYFILE $CADDYFILE && $([ "$site_existed" = yes ] && echo "cp $BACKUP_DIR$CADDY_SITE $CADDY_SITE" || echo "rm -f $CADDY_SITE") && runuser -u caddy -- env HOME=/var/lib/caddy $CADDY validate --config $CADDYFILE --adapter caddyfile && systemctl reload caddy
EOF
