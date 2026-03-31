#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
ORIGIN_DIR="$ROOT_DIR/deploy/origin-ca"
CERT_SOURCE="$ORIGIN_DIR/dunamismax-origin.crt"
KEY_SOURCE="$ORIGIN_DIR/dunamismax-origin.key"
CERT_TARGET_DIR="/etc/caddy/certs"
CERT_TARGET="$CERT_TARGET_DIR/dunamismax-origin.crt"
KEY_TARGET="$CERT_TARGET_DIR/dunamismax-origin.key"
CADDYFILE_SOURCE="$ROOT_DIR/deploy/Caddyfile.cloudflare-origin"
CADDYFILE_TARGET="/etc/caddy/Caddyfile"

require_file() {
  local path=$1
  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    exit 1
  fi
}

require_file "$CERT_SOURCE"
require_file "$KEY_SOURCE"

sudo install -d -m 0750 -o root -g caddy "$CERT_TARGET_DIR"
sudo install -m 0640 -o root -g caddy "$KEY_SOURCE" "$KEY_TARGET"
sudo install -m 0644 -o root -g root "$CERT_SOURCE" "$CERT_TARGET"
sudo install -m 0644 "$CADDYFILE_SOURCE" "$CADDYFILE_TARGET"
sudo caddy validate --config "$CADDYFILE_TARGET" --adapter caddyfile
sudo systemctl reload caddy

cat <<EOF
Cloudflare Origin CA config installed.

Installed files:
- $CERT_TARGET
- $KEY_TARGET
- $CADDYFILE_TARGET

Next:
- Keep Cloudflare SSL/TLS mode on Full (strict)
- Verify: curl -I https://dunamismax.com
EOF
