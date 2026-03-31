#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)

cd "$ROOT_DIR/frontend"
bun install --frozen-lockfile
bun run lint
bun run check
bun run test
bun run build

cd "$ROOT_DIR"
python3 scripts/smoke.py
