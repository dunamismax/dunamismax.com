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
[[ -s $previous/dist/cli/bin/server.js ]] || { echo 'Use isolated recovery for retired PHP releases.' >&2; exit 1; }
if [[ ${2:-} == --check ]]; then echo 'Compatible Astro rollback prerequisites verified; no state changed.'; exit 0; fi
restore_release "$saved"
printf 'Restored %s. PostgreSQL data and all retained backups remain available.\n' "$previous"
