#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
OUT_DIR="$ROOT_DIR/deploy/origin-ca"
KEY_FILE="$OUT_DIR/dunamismax-origin.key"
CSR_FILE="$OUT_DIR/dunamismax-origin.csr"

mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR"

if [[ -e "$KEY_FILE" || -e "$CSR_FILE" ]]; then
  echo "Refusing to overwrite existing Origin CA key or CSR in $OUT_DIR" >&2
  exit 1
fi

openssl genpkey \
  -algorithm EC \
  -pkeyopt ec_paramgen_curve:P-256 \
  -out "$KEY_FILE"
chmod 600 "$KEY_FILE"

openssl req \
  -new \
  -key "$KEY_FILE" \
  -out "$CSR_FILE" \
  -subj "/CN=dunamismax.com" \
  -addext "subjectAltName=DNS:dunamismax.com,DNS:*.dunamismax.com"

cat <<EOF
Generated:
- Private key: $KEY_FILE
- CSR: $CSR_FILE

Next in Cloudflare:
1. SSL/TLS -> Origin Server -> Create Certificate
2. Choose "Use my private key and CSR"
3. Paste the CSR from:
   $CSR_FILE
4. Use hostnames:
   dunamismax.com, *.dunamismax.com
5. Download/copy the PEM certificate into:
   $OUT_DIR/dunamismax-origin.crt
EOF
