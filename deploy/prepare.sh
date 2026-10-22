#!/usr/bin/env bash
# Unprivileged, isolated candidate. Does not mutate the live checkout or service.
set -euo pipefail
cd "$(dirname "$0")/.."
[[ -z $(git status --porcelain) ]] || { echo 'Commit all changes first.' >&2; exit 1; }
commit=$(git rev-parse HEAD)
candidate="/home/sawyer/astro-candidates/dunamismax/$commit"
[[ ! -e $candidate ]] || { echo 'Candidate already exists; inspect rather than overwrite.' >&2; exit 1; }
mkdir -p "$candidate"
git archive "$commit" | tar -x -C "$candidate"
cd "$candidate"
astro-runtime npm ci --no-audit
astro-runtime npm run check
astro-runtime npm test
APP_ENV=production APP_URL=https://dunamismax.com astro-runtime npm run build
astro-runtime bash deploy/rehearse.sh
for file in deploy/*.sh; do bash -n "$file"; done
shellcheck -x deploy/*.sh
printf '%s\n' "$commit" > .release-commit
manifest=$(mktemp)
find . -type f -print0 | sort -z | xargs -0 sha256sum > "$manifest"
mv "$manifest" .candidate-sha256
printf 'Candidate verified: %s\n' "$candidate"
