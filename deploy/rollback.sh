#!/usr/bin/env bash
# sudo with-deploy-lock /current/deploy/rollback.sh /root/CHECKPOINT [--check]
set -euo pipefail
# shellcheck source=deploy/lib.sh
source "$(dirname "$0")/lib.sh"
require_lock
saved=$(realpath "$1")
[[ $saved == /root/dunamismax-astro-* && -f $saved/previous-release ]]
[[ $(readlink -f "$base/current") == "$base/releases/$(cat "$saved/deployed-commit")" ]] || { echo 'Current release changed; refusing stale rollback.' >&2; exit 1; }
previous=$(cat "$saved/previous-release")
[[ -d $previous && -f $saved/site.caddy ]]
cd "$base/current"
if [[ -f $previous/public/index.php ]]; then
    # A code rollback cannot discard PostgreSQL writes. Refuse if data diverged.
    "$node" dist/cli/bin/migrate-data.js reconcile "$saved/mysql-final.json"
    [[ -f $saved/legacy-publishing.env && -f /etc/dunamismax/php-fpm.conf ]]
    systemctl is-active --quiet php8.5-fpm mysql
fi
if [[ ${2:-} == --check ]]; then echo 'Rollback prerequisites and data reconciliation verified; no state changed.'; exit 0; fi
restore_release "$saved"
printf 'Restored %s. PostgreSQL data and all retained backups remain available.\n' "$previous"
