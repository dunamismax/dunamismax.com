#!/usr/bin/env bash
set -euo pipefail
require_lock() {
    [[ $EUID == 0 ]] || { echo 'Root required.' >&2; exit 1; }
    [[ -e /proc/$$/fd/9 && $(readlink /proc/$$/fd/9) == /run/astro-deploy/lock ]] || { echo 'Use with-deploy-lock around this entire transaction.' >&2; exit 1; }
    flock -n 9 || exit 75
}
export node=/opt/astro-runtime/bin/node
base=/srv/www/dunamismax.com
fragment=/etc/caddy/sites/dunamismax.com.caddy
unit=/etc/systemd/system/astro-dunamismax.service
caddy=/usr/local/lib/caddy/caddy
switch_release() { ln -s "$1" "$base/current.next"; mv -Tf "$base/current.next" "$base/current"; }
wait_health() {
    local address=$1
    for _ in {1..60}; do if curl -fsS "$address/healthz" | /usr/bin/grep -q '"status":"ok"'; then return 0; fi; sleep 0.25; done
    return 1
}
restore_release() {
    local saved=$1
    systemctl stop astro-dunamismax-candidate.service 2>/dev/null || true
    cp -a "$saved/site.caddy" "$fragment"
    "$caddy" validate --config /etc/caddy/Caddyfile
    switch_release "$(cat "$saved/previous-release")"
    if [[ -f $saved/previous.service ]]; then cp -a "$saved/previous.service" "$unit"; else rm -f "$unit"; fi
    systemctl daemon-reload
    if [[ $(cat "$saved/previous-active") == active ]]; then systemctl restart astro-dunamismax.service; else systemctl disable --now astro-dunamismax.service || true; fi
    if [[ -f $saved/previous-wrapper ]]; then cp -a "$saved/previous-wrapper" /usr/local/sbin/dunamismax-posts; else rm -f /usr/local/sbin/dunamismax-posts; fi
    systemctl reload caddy
    curl -fsS https://dunamismax.com/healthz
}
