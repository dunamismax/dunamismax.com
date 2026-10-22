# Astro migration acceptance

Production verified October 22, 2026 Eastern. The active Astro release is
`c93aaec9fba731f2a1df38f011dd0c62e6d40aa3`. The retained PHP predecessor is
`e3f991fdc6d5c05c9ba6f14715ae65e7156794ea`.

## Completed before cutover

- Legacy baseline: 249 application checks passed before removing PHP source.
- Rendered visible text compared for Home/About/Contact/Projects: unchanged
  except this application’s stack card now accurately names Astro/TypeScript/
  PostgreSQL. CSS/icon URLs, branding, contact links and project order preserved.
- Strict Astro/TypeScript checks, six unit suites and production build passed
  locally and on Ubuntu using Node 24.22.1 / npm 11.19.1.
- Disposable PostgreSQL 17 (Mac) and 18 (VM): schema reapplied; role boundaries,
  private base-table denial, visibility, scheduling without a build, SQL binding,
  CLI lifecycle/input/config validation passed.
- Nonempty migration fixtures cover Unicode, CRLF text, draft/public records,
  stable IDs/timestamps, identity sequence, repeat import and differing-target
  refusal. HTTP checks passed: 115 populated, 112 during the disposable database
  outage, 115 after recovery.
- Actual MySQL source exported through the operator’s authorized publishing
  credential into a private snapshot: **0 rows**. Isolated PostgreSQL 18 import,
  repeat import and full reconciliation all matched SHA256
  `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945`.
  No production PostgreSQL schema/data was changed by this rehearsal.
- Chromium inspected five pages at 320/375/768/1440 pixels in light/dark schemes:
  forty layouts without horizontal page overflow, duplicate IDs, missing h1,
  scripts or unnamed links. Desktop/mobile screenshots reviewed. Keyboard skip
  link, minimum touch targets and long-post wrapping retained/improved.
- Bash syntax and ShellCheck pass. No PHP implementation files remain in Git.

## Observed production cutover

The owner performed the privileged cutover. A subsequent independent inspection
confirmed the active release symlink above, `astro-dunamismax.service` active and
running with ExecMainStatus 0, and the service configured as
`astro-dunamismax-web` with only the designated web.env EnvironmentFile.

- All 109 empty-blog HTTP checks passed against public production from the
  verified candidate, including content, metadata, HEAD, method restrictions,
  private-path 404/noindex behavior and content types.
- `/healthz` returns the expected JSON. RSS parses as RSS 2.0 with zero items;
  the production blog returns 200/no-store. The www hostname redirects 301 to
  the apex. Public output shows this application's migrated stack card.
- The root-only `last-astro-rollback` pointer exists, written at approximately
  6:19 a.m. Eastern. The cutover script writes it after candidate checks,
  production checks and redirect validation succeed. Its protected contents
  and individual root-only cutover reports have not been independently read.
- Caddy, PHP-FPM, MySQL and PostgreSQL remain active; systemd reports no failed
  units. Legacy services and data remain retained for rollback.
- The latest observed host backup commit is `0a3be35`, captured at 6:18 a.m.
  Eastern before cutover. The PostgreSQL encrypted dump has a corresponding
  timestamp. This establishes a pre-cutover snapshot, not a post-cutover backup.
- Application implementation commits `7f5d48b` and `c93aaec` were pushed to both
  configured remotes; both main tips were independently checked at `c93aaec`
  before the owner performed cutover.

## Remaining privileged verification

The SSH account still requires interactive sudo authentication. The guarded
rollback `--check`, post-cutover host backup and encrypted `restore check` /
`postgres-verify` need confirmation. Read the protected cutover reports to record
the final migration digest, live role checks and exact rollback checkpoint.
Production is serving Astro; these remaining acceptance checks are not claimed
complete from the public HTTP results.
