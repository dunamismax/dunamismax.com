#!/usr/bin/env bash
# Installed root-owned at /usr/local/sbin/dunamismax-posts. Invoke through sudo.
set -euo pipefail
[[ $EUID == 0 ]] || { echo 'Run through sudo.' >&2; exit 1; }
exec 9</run/astro-deploy/lock
flock --shared --timeout 900 9
# Generated PostgreSQL env has literal hexadecimal passwords; never trace this.
set -a
# shellcheck source=/dev/null
source /etc/astro-apps/dunamismax/publishing.env
set +a
cd /srv/www/dunamismax.com/current
exec runuser -u sawyer -- env -i     PATH=/opt/astro-runtime/bin:/usr/bin:/bin POSTS_TRUSTED_WRAPPER=1     PGHOST="$PGHOST" PGPORT="$PGPORT" PGDATABASE="$PGDATABASE" PGUSER="$PGUSER" PGPASSWORD="$PGPASSWORD"     /opt/astro-runtime/bin/node dist/cli/bin/posts.js "$@"
