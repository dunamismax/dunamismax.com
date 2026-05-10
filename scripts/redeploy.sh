#!/usr/bin/env bash
# scripts/redeploy.sh — single-command deploy for dunamismax.com on the VM.
#
# Pulls the repo, rebuilds dist/, and reloads Caddy. There is no app
# server, no database, and no asset pipeline.

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_ROOT"

export PATH="/home/sawyer/.local/share/mise/installs/node/24.13.1/bin:$PATH"

echo "==> [1/3] git pull --ff-only"
git pull --ff-only

echo "==> [2/3] python3 scripts/build.py build"
python3 scripts/build.py build

echo "==> [3/3] caddy reload"
if [ -n "${SUDO_PASS:-}" ]; then
  echo "$SUDO_PASS" | sudo -S -p '' systemctl reload caddy
else
  sudo systemctl reload caddy
fi

echo "==> redeploy complete"
