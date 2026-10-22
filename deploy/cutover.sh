#!/usr/bin/env bash
# sudo with-deploy-lock /absolute/candidate/deploy/cutover.sh CANDIDATE EXPECTED_CURRENT
set -euo pipefail
# shellcheck source=deploy/lib.sh
source "$(dirname "$0")/lib.sh"
require_lock
umask 077
candidate=$(realpath "$1")
expected=$2
[[ $(readlink -f "$base/current") == "$expected" ]] || { echo 'Unexpected current release; abort.' >&2; exit 1; }
commit=$(cat "$candidate/.release-commit")
[[ $commit =~ ^[0-9a-f]{40}$ && $candidate == /home/sawyer/astro-candidates/dunamismax/"$commit" ]] || exit 1
(cd "$candidate" && sha256sum --quiet -c .candidate-sha256)
saved="/root/dunamismax-astro-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 0700 "$saved"
printf '%s\n' "$expected" > "$saved/previous-release"
printf '%s\n' "$commit" > "$saved/deployed-commit"
cp -a "$fragment" "$saved/site.caddy"
(systemctl is-active astro-dunamismax.service || true) > "$saved/previous-active"
[[ ! -f $unit ]] || cp -a "$unit" "$saved/previous.service"
[[ ! -f /usr/local/sbin/dunamismax-posts ]] || cp -a /usr/local/sbin/dunamismax-posts "$saved/previous-wrapper"
failed() { local code=$?; trap - ERR; echo "Cutover failed; restoring $saved" >&2; restore_release "$saved"; exit "$code"; }
trap failed ERR
[[ -s $expected/dist/cli/bin/server.js ]] || { echo 'Only Astro-to-Astro deployment is supported; use isolated legacy recovery.' >&2; exit 1; }
cd "$candidate"
"$node" dist/cli/bin/schema.js
"$node" dist/cli/bin/verify-database.js | tee "$saved/privilege-report.log"
# Keep privileges and data isolated from other projects.
id astro-dunamismax-web >/dev/null 2>&1 || useradd --system --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin astro-dunamismax-web
release="$base/releases/$commit"
[[ ! -e $release ]]
install -d -m 0755 "$release"
cp -a "$candidate/." "$release/"
chown -R root:root "$release"
find "$release" -type d -exec chmod 0755 {} +
find "$release" -type f -exec chmod 0644 {} +
# A hardened, separate temporary systemd service uses ONLY website credentials.
systemd-run --quiet --unit=astro-dunamismax-candidate --property=User=astro-dunamismax-web     --property=Group=astro-dunamismax-web --property=WorkingDirectory="$release"     --property=EnvironmentFile=/etc/astro-apps/dunamismax/web.env     --property=ProtectSystem=strict --property=ProtectHome=true --property=PrivateTmp=true     --property=NoNewPrivileges=true --property=StateDirectory=astro-dunamismax-candidate     --setenv=APP_ENV=production --setenv=APP_URL=https://dunamismax.com --setenv=HOST=127.0.0.1 --setenv=PORT=4323     "$node" "$release/dist/cli/bin/server.js"
wait_health http://127.0.0.1:4323
TEST_BASE_URL=http://127.0.0.1:4323 "$node" --import tsx tests/http.ts > "$saved/candidate-http.log"
systemctl stop astro-dunamismax-candidate
install -m 0644 deploy/astro-dunamismax.service "$unit"
install -m 0644 deploy/Caddyfile "$fragment"
install -m 0755 deploy/posts-wrapper.sh /usr/local/sbin/dunamismax-posts
systemd-analyze verify "$unit"
"$caddy" validate --config /etc/caddy/Caddyfile
switch_release "$release"
systemctl daemon-reload
systemctl enable --now astro-dunamismax.service
systemctl restart astro-dunamismax.service
wait_health http://127.0.0.1:4311
systemctl reload caddy
TEST_BASE_URL=https://dunamismax.com "$node" --import tsx tests/http.ts | tee "$saved/production-http.log"
[[ $(curl -sSI https://www.dunamismax.com/path?query=1 | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}') == 'https://dunamismax.com/path?query=1' ]]
printf '%s\n' "$saved" > "$base/last-astro-rollback"
trap - ERR
printf 'Deployed %s. Rollback checkpoint: %s\n' "$commit" "$saved"
