# Astro migration acceptance

Verified October 22, 2026 UTC (October 21 Eastern). The approved source and
currently active PHP release were both `e3f991fdc6d5c05c9ba6f14715ae65e7156794ea`.

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

## Pending privileged acceptance

Production cutover requires authenticated root execution; the current SSH account
reports sudo needs interactive authentication. Until it is available, production
continues serving PHP at the source release above. No production migration or
rollback execution is claimed.

Required remaining gates: fresh host backup and encrypted restore verification;
locked final writer freeze, data sync/reconciliation and candidate service test;
Caddy/systemd validation and atomic activation; production HTTP/redirect/header/
private-path checks; live PG role checks; guarded rollback check; post-cutover
backup/encrypted restore; shared-site/service checks. Record the concrete deployed
commit, rollback checkpoint and backup evidence here after observing them.
