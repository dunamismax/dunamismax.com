#!/usr/bin/env bash
# Read real MySQL data; import twice into an isolated PG18 cluster.
# Unprivileged: set MYSQL_CONFIG to the operator-owned legacy publishing.env.
set -euo pipefail
# shellcheck source=deploy/lib.sh
source "$(dirname "$0")/lib.sh"
if [[ $EUID == 0 ]]; then require_lock; fi
cd "$(dirname "$0")/.."
umask 077
work=$(mktemp -d /var/tmp/dunamismax-data-rehearsal.XXXXXX)
run_as=()
if [[ $EUID == 0 ]]; then chown postgres:postgres "$work"; run_as=(runuser -u postgres --); fi
pgbin=/usr/lib/postgresql/18/bin
cleanup() { "${run_as[@]}" "$pgbin/pg_ctl" -D "$work/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT
"${run_as[@]}" "$pgbin/initdb" -D "$work/data" -A trust --no-locale -E UTF8 >"$work/init.log"
"${run_as[@]}" "$pgbin/pg_ctl" -D "$work/data" -l "$work/postgres.log" -o "-h '' -p 55432 -k $work" start >/dev/null
"${run_as[@]}" "$pgbin/createdb" -h "$work" -p 55432 dunamismax_test
"${run_as[@]}" "$pgbin/psql" -h "$work" -p 55432 -d dunamismax_test -X -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE ROLE dunamismax_owner NOLOGIN;
CREATE ROLE dunamismax_migration LOGIN NOINHERIT;
CREATE ROLE dunamismax_web LOGIN;
CREATE ROLE dunamismax_publishing LOGIN;
GRANT dunamismax_owner TO dunamismax_migration;
CREATE SCHEMA app AUTHORIZATION dunamismax_owner;
GRANT USAGE ON SCHEMA app TO dunamismax_web,dunamismax_publishing;
SQL
printf 'PGHOST=%s\nPGPORT=55432\nPGDATABASE=dunamismax_test\nPGUSER=dunamismax_migration\nPGPASSWORD=unused-isolated-trust-cluster\n' "$work" > "$work/migration.env"
export MIGRATION_CONFIG="$work/migration.env"
"$node" dist/cli/bin/schema.js
"$node" dist/cli/bin/migrate-data.js export "$work/source.json"
"$node" dist/cli/bin/migrate-data.js import "$work/source.json"
"$node" dist/cli/bin/migrate-data.js import "$work/source.json"
"$node" dist/cli/bin/migrate-data.js reconcile "$work/source.json"
echo 'Real-source rehearsal passed; production PostgreSQL was not changed.'
