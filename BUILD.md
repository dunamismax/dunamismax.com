# Verification and migration status

Astro/strict TypeScript/PostgreSQL replaces this repository’s PHP implementation.
Preserved: approved portfolio, routes, CSS/icon, metadata, RSS/plain text,
pagination, zero browser scripts, draft privacy and database outage behavior.
About/Contact/Projects prerender; PostgreSQL remains authoritative for posts.

## Gates

```sh
npm ci
npm run check
npm test
APP_ENV=production npm run build
bash deploy/rehearse.sh
for f in deploy/*.sh; do bash -n "$f"; done
shellcheck -x deploy/*.sh
git diff --check
```

On macOS set PGBIN to the installed PostgreSQL bin directory for rehearsal.
Unit tests port meaningful legacy escaping, Unicode, dates, credential and RSS
cases. PostgreSQL tests cover schema reapplication, real role restrictions,
SQL binding, draft/future visibility, scheduling without builds, transactional
CLI create/edit/validate/publish/schedule/unpublish and failed input/config.
HTTP checks cover preserved content/project counts, landmarks, metadata, methods,
HEAD, private paths, pagination, RSS limits and outages/recovery against the
compiled server. Browser QA covers widths 320/375/768/1440 in light/dark mode.
The previous implementation passed its 249 checks before replacement.

Real source migration, production cutover, remote tips, backup/restore and
rollback verification results belong in [migration acceptance](docs/migration.md).
Do not claim those deployment gates complete based on local fixtures.
