#!/usr/bin/env bash
# Release steps 2-8, as root, inside ONE with-deploy-lock process:
#   with-deploy-lock bash /home/sawyer/web-work/dunamismax.com-COMMIT/src/deploy/deploy.sh COMMIT
# Fix forward only: a failure before "switch" leaves the previous release serving; a
# failure in "switch" or "verify" means the new release is live and unhealthy. Never
# point current at an older release; read the journal, fix it in a new commit, deploy that.
set -Eeuo pipefail
# shellcheck source=deploy/lib.sh
source "$(dirname "$0")/lib.sh"
require_lock
cd /
commit=${1:-}
[[ $commit =~ ^[0-9a-f]{40}$ ]] || die 'usage: deploy.sh COMMIT (the full 40-character SHA)'
built=$work_root/$site-$commit/release
release=$base/releases/$commit
candidate=/run/systemd/system/$unit-candidate.service
smoke=(runuser -u sawyer -- env TEST_REVISION="$commit")
step=start
trap 'echo "deploy: failed in step \"$step\"" >&2' ERR
stop_candidate() {
    systemctl stop "$unit-candidate.service" 2>/dev/null || true
    if [[ -e $candidate ]]; then rm -f "$candidate"; systemctl daemon-reload; fi
}
trap stop_candidate EXIT
[[ -f $built/REVISION && $(cat "$built/REVISION") == "$commit" ]] || die "no build for $commit; run deploy/build.sh first"
id "$service_user" >/dev/null

step=stage
if [[ -e $release ]]; then
    diff -r --no-dereference "$built" "$release" >/dev/null || die "$release exists and differs from the build"
else
    rm -rf "$release.staging"
    cp -a "$built" "$release.staging"
    chown -R root:root "$release.staging"
    chmod -R u=rwX,go=rX "$release.staging"
    mv -T "$release.staging" "$release"
fi
echo "Staged $release"

step=migrate
install -d -m 0700 "$dumps"
(umask 077; runuser -u postgres -- pg_dump --format=custom "$database" > "$dumps/pre-migrate-$commit.dump")
systemd-run --wait --collect --pipe --quiet --unit="$unit-migrate" \
    -p User="$service_user" -p Group="$service_user" \
    -p EnvironmentFile=/etc/web-apps/dunamismax/migration.env \
    -p WorkingDirectory="$release" -p NoNewPrivileges=true -p ProtectSystem=strict \
    -p ProtectHome=true -p PrivateTmp=true \
    "$node" "$release/dist/cli/bin/schema.js"
applied=$(runuser -u postgres -- psql -d "$database" -XAtc 'SELECT count(*) FROM drizzle.__drizzle_migrations')
expected=$("$node" -e 'console.log(JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).entries.length)' "$release/drizzle/meta/_journal.json")
[[ $applied == "$expected" ]] || die "migration journal has $applied rows; the release has $expected migrations"
(cd "$release" && "$node" dist/cli/bin/verify-database.js)

step=candidate
candidate_port=
for p in {4400..4499}; do
    if [[ -z $(ss -Htln "sport = :$p") ]]; then candidate_port=$p; break; fi
done
[[ -n $candidate_port ]] || die 'no free candidate port in 4400-4499'
sed -e "s|$base/current|$release|g" -e "s|PORT=$port\\b|PORT=$candidate_port|" "$release/deploy/$unit.service" > "$candidate"
grep -q "PORT=$candidate_port" "$candidate" || die 'candidate unit has no candidate port'
systemctl daemon-reload
systemctl start "$unit-candidate.service"
if ! wait_health "http://127.0.0.1:$candidate_port" "$commit"; then
    journalctl -u "$unit-candidate.service" -n 30 --no-pager >&2
    die "candidate on port $candidate_port did not report $commit with a working database"
fi
"${smoke[@]}" TEST_BASE_URL="http://127.0.0.1:$candidate_port" "$node" "$release/dist/cli/tests/http.js"
stop_candidate

step=switch
if ! cmp -s "$release/deploy/$unit.service" "/etc/systemd/system/$unit.service"; then
    install -m 0644 "$release/deploy/$unit.service" "/etc/systemd/system/$unit.service"
    systemd-analyze verify "/etc/systemd/system/$unit.service"
fi
cmp -s "$release/deploy/posts-wrapper.sh" /usr/local/sbin/dunamismax-posts ||
    install -m 0755 "$release/deploy/posts-wrapper.sh" /usr/local/sbin/dunamismax-posts
systemctl daemon-reload
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
systemctl restart "$unit.service"

step=verify
wait_health "http://127.0.0.1:$port" "$commit" || die "$unit.service does not report $commit with a working database"
"${smoke[@]}" TEST_BASE_URL="http://127.0.0.1:$port" "$node" "$release/dist/cli/tests/http.js"
live=$(bash /home/sawyer/github/ubuntu-vm-backup/bin/web-live "$unit.service")
[[ $live == "$unit.service"$'\t'"$node_dir/bin/node"$'\t'"$release"$'\t'"$commit"$'\t'current ]] || die "web-live reports: $live"
echo "Live: $live"

step=caddy
if ! cmp -s "$release/deploy/Caddyfile" "/etc/caddy/sites/$fragment.caddy"; then
    caddy-apply "$fragment" "$release/deploy/Caddyfile"
fi

step=record
logger -t web-deploy "$site $commit live"
"${smoke[@]}" TEST_BASE_URL="https://$site" "$node" "$release/dist/cli/tests/http.js"
[[ $(curl -sSI 'https://www.dunamismax.com/path?query=1' | tr -d '\r' | awk 'tolower($1)=="location:"{print $2}') == 'https://dunamismax.com/path?query=1' ]] ||
    die 'www redirect does not preserve path and query'
printf 'Deployed %s\n' "$commit"
