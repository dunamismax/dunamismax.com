#!/usr/bin/env bash
# Installed root-owned at /usr/local/sbin/dunamismax-posts. Invoke through sudo.
set -euo pipefail
[[ $EUID == 0 ]] || { echo 'Run through sudo.' >&2; exit 1; }
exec 9</run/web-deploy/lock
flock --shared --timeout 900 9
# Generated PostgreSQL env has literal hexadecimal passwords; never trace this.
set -a
# shellcheck source=/dev/null
source /etc/web-apps/dunamismax/publishing.env
set +a
cd /srv/www/dunamismax.com/current
# Preserve credentials in the inherited environment, never command arguments.
unset DATABASE_URL POSTS_CONFIG NODE_OPTIONS NODE_PATH PGOPTIONS PGSERVICE
export PATH=/opt/node-26/bin:/usr/bin:/bin POSTS_TRUSTED_WRAPPER=1
exec /usr/sbin/runuser -u sawyer -- /opt/node-26/bin/node dist/cli/bin/posts.js "$@"
