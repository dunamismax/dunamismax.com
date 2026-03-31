#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
HOST_PORT=${DUNAMISMAX_HOST_PORT:-8080}
CADDYFILE_SOURCE="$ROOT_DIR/Caddyfile"
CADDYFILE_TARGET="/etc/caddy/Caddyfile"

require_bin() {
  local name=$1
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required command: $name" >&2
    exit 1
  fi
}

require_bin sudo
require_bin docker
require_bin caddy
require_bin python3
require_bin systemctl

cat <<EOF
Deploy target: dunamismax.com
Repo root: $ROOT_DIR
Published container port: 127.0.0.1:$HOST_PORT -> 80

Cloudflare note:
- If the DNS records for dunamismax.com and www.dunamismax.com are orange-cloud proxied,
  Caddy's default ACME flow will not be able to issue or renew certificates with this stock build.
- Use DNS-only records for this origin-facing setup, or replace the host Caddy package with a
  Cloudflare DNS-challenge capable build and API token before enabling the proxy again.
EOF

sudo install -m 0644 "$CADDYFILE_SOURCE" "$CADDYFILE_TARGET"
sudo caddy validate --config "$CADDYFILE_TARGET" --adapter caddyfile
sudo systemctl reload caddy
sudo docker compose -f "$ROOT_DIR/docker-compose.yml" up -d --build --force-recreate

python3 "$ROOT_DIR/scripts/smoke.py" --base-url "http://127.0.0.1:$HOST_PORT"

echo
echo "Local origin smoke passed at http://127.0.0.1:$HOST_PORT"
echo "Next: verify inbound 80/443 reachability and Cloudflare DNS mode."
