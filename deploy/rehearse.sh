#!/usr/bin/env bash
# Isolated PostgreSQL 18/17 fixture cluster, never the production cluster.
set -euo pipefail
cd "$(dirname "$0")/.."
pgbin=${PGBIN:-/usr/lib/postgresql/18/bin}
work=$(mktemp -d /tmp/dunamismax-rehearsal.XXXXXX)
port=${TEST_PGPORT:-55431}
webport=${TEST_WEB_PORT:-4322}
cleanup() { "$pgbin/pg_ctl" -D "$work/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT
"$pgbin/initdb" -D "$work/data" -A trust --no-locale -E UTF8 >"$work/init.log"
"$pgbin/pg_ctl" -D "$work/data" -l "$work/postgres.log" -o "-h 127.0.0.1 -p $port -k $work" start >/dev/null
PGUSER=$(id -un)
export PGHOST=127.0.0.1 PGPORT="$port" PGUSER PGDATABASE=dunamismax_test PGBIN="$pgbin"
"$pgbin/createdb" "$PGDATABASE"
npm run test:database
APP_ENV=production PORT="$webport" PGUSER=dunamismax_web PGPASSWORD=synthetic-test-password node dist/cli/bin/server.js >"$work/server.log" 2>&1 &
webpid=$!
trap 'kill "$webpid" 2>/dev/null || true; cleanup' EXIT
for _ in {1..50}; do if curl -fsS "http://127.0.0.1:$webport/healthz" >/dev/null 2>&1; then break; fi; sleep 0.1; done
# A dead process means the port was taken: never test whatever else answers on it.
if ! kill -0 "$webpid" 2>/dev/null || ! curl -fsS "http://127.0.0.1:$webport/healthz" >/dev/null 2>&1; then
    echo "Rehearsal web server did not start on 127.0.0.1:$webport (set TEST_WEB_PORT if it is taken):" >&2
    cat "$work/server.log" >&2
    exit 1
fi
TEST_BASE_URL="http://127.0.0.1:$webport" TEST_POPULATED=1 npm run test:http
# Stop only this disposable database, exercise live outage, then recover it.
"$pgbin/pg_ctl" -D "$work/data" -m fast stop >/dev/null
TEST_BASE_URL="http://127.0.0.1:$webport" TEST_OUTAGE=1 npm run test:http
"$pgbin/pg_ctl" -D "$work/data" -l "$work/postgres.log" -o "-h 127.0.0.1 -p $port -k $work" start >/dev/null
TEST_BASE_URL="http://127.0.0.1:$webport" TEST_POPULATED=1 npm run test:http
kill "$webpid"; wait "$webpid" || true
trap cleanup EXIT
