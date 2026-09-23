# AGENTS.md

Repo-local operating manual for `dunamismax.com`. Reading this file plus
`README.md` and `BUILD.md` is sufficient context to begin work.

`README.md` explains the product, stack, and layout. `BUILD.md` covers
verification gates and active follow-ups. `docs/` holds the architecture,
content workflow, and production runbook. This file holds durable
engineering, content, deployment, and repo rules.

## Read Order

1. `AGENTS.md` (this file)
2. `README.md`
3. `BUILD.md`
4. Task-relevant code, tests, views, deploy files, and `docs/`

Do not create extra prompt, bootstrap, continuity, profile, scheduler, or
agent-instruction files. If durable repo behavior matters, put it here.

---

## Identity

You are working with Stephen Sawyer (`dunamismax`).

The site represents Stephen's public direction: PHP-first web development
with vanilla HTML, CSS, and JavaScript; MySQL for durable content; Python for
scripting and automation; and hands-on, security-minded systems
administration of self-hosted Ubuntu servers.

## Priority Stack

1. Reality first. If it was not observed in the repo, runtime, docs, or remote,
   it is not known.
2. Keep production healthy. The site shares its server with other sites.
3. Verify before claiming completion.
4. Keep docs and implementation synchronized.

Never fake completion, invent deployed behavior, overstate claims about
Stephen or his projects, hide uncertainty, or leave the repo in a
half-migrated state without documenting the exact boundary.

---

## Product Boundaries

- This is Stephen Sawyer's personal site, portfolio, and blog.
- The public surface must stay fast, readable, accessible, and inspectable.
- The site must remain self-hostable on a single Ubuntu server behind Caddy.
- The public site is read-only: no accounts, comments, admin pages, uploads,
  forms, analytics, or hosted third-party services unless Stephen asks.
- Do not break existing public URLs (see the route table in `README.md`).
- Project copy must be true: describe a project's stack only as it actually
  is. Rust, LoveWard, Callrift, Pod Tracker, FileFerry, and LangIndex are
  retired from the public copy; `tests/run.php` enforces that.

## Stack Rules

- PHP 8.5 in production, object-oriented and bespoke. `public/index.php` is
  the front controller; classes live in `app/` under the `Dunamismax`
  namespace, loaded by `bootstrap.php`; templates live in `views/`.
- Installed extensions only (no curl, mbstring, or intl). Use stream contexts
  for HTTPS if ever needed.
- MySQL 8 through PDO with prepared statements and
  `ATTR_EMULATE_PREPARES = false`.
- Semantic HTML and hand-written CSS. The site sends **zero JavaScript**; the
  theme follows `prefers-color-scheme`. Adding a script needs a concrete
  feature that cannot work without it, served locally and deferred.
- No framework, ORM, CMS, Composer, npm, build step, Markdown library,
  external font, or CDN.
- Only `public/` is a web root. Caddy serves `/css/site.css` and `/icon.svg`
  directly and sends everything else to PHP.
- Shell is acceptable only as deployment and sudo glue in `deploy/`.

## Content Rules

- Blog posts live in MySQL `posts` and are managed only through
  `php bin/posts.php` over an authorized shell. The publication rule
  (`status = 'published' AND published_at <= UTC_TIMESTAMP()`) lives in
  `PostRepository` and governs lists, counts, pages, and RSS.
- Post bodies are plain text rendered as escaped paragraphs. Do not add raw
  HTML or Markdown rendering without a defined trust boundary.
- Pages are hand-written semantic HTML in `views/`. Project cards live in
  `views/partials/projects/<category>.php`; when adding or removing a card,
  update the counts on the home and projects pages (tests check them).
- Keep slugs stable. Broken public links are regressions.

## Web UX Rules

- Build the actual site, not a decorative landing page.
- Preserve routes, canonical metadata, RSS, robots, manifest, icon, and error
  handling unless intentionally changed.
- The first viewport must clearly signal Stephen/dunamismax and the
  PHP/MySQL/Python/sysadmin direction.
- Text must fit cleanly on mobile and desktop.
- Use semantic HTML and accessible navigation. Color must not be the only
  state indicator (`aria-current` plus an underline marks the current page).
- No inline styles or scripts: the Content-Security-Policy is
  `default-src 'self'`.

## Database Rules

- One MySQL database, `dunamismax`, on 127.0.0.1.
- The website uses `dunamismax_web` (SELECT only). Publishing uses
  `dunamismax_publish` (SELECT/INSERT/UPDATE on `posts`) from
  `/etc/dunamismax/publishing.env`, never the website's credentials.
- `database/schema.sql` is the baseline and safe to reapply. Structural
  changes need a reviewed migration SQL file, a backup, and a rollback plan.
- Never log credentials or post bodies.

## Deployment Rules

- Production target is Ubuntu, Caddy (custom build at
  `/usr/local/lib/caddy/caddy`; never `/usr/bin/caddy`), and the shared
  `php8.5-fpm` service. Reload PHP-FPM, never restart it.
- Pushing to Git does not deploy. The owner runs `deploy/03-deploy.sh`, which
  builds `/srv/www/dunamismax.com/releases/<commit>` from a clean checkout and
  switches `current` atomically.
- You have no sudo. Anything needing root goes into a script in `deploy/`
  that uses `set -euo pipefail`, refuses to run unless root, is idempotent,
  backs up every changed file to `/root/dunamismax-backup-<timestamp>/`,
  validates before reloading, and prints verification and rollback steps.
- Only edit this site's pool, database, service, and Caddy file
  (`/etc/caddy/sites/dunamismax.com.caddy`). Never touch another site's.
- `/healthz` is the health probe.

## Verification

Docs-only changes:

```sh
git diff --check
```

Normal gate:

```sh
make check      # php -l on every PHP file + tests/run.php
```

Data access or schema changes also need `php tests/database.php` against a
dedicated `_test` database (see `README.md`). Deploy-script changes need
`bash -n` and `shellcheck -x deploy/*.sh`, and ideally a run in a disposable
container.

Local smoke:

```sh
make serve
curl -fsS http://127.0.0.1:8000/healthz
curl -fsS http://127.0.0.1:8000/ | head
curl -fsS http://127.0.0.1:8000/feed.xml | head
```

## Repository Hygiene

- Keep `README.md` focused on product, stack, layout, and local development.
- Keep `BUILD.md` focused on verification gates and active follow-ups.
- Keep durable runbooks under `docs/`.
- Update this file when a repo-specific gotcha would save future agents time.
- No other language stacks in the repo: no Cargo, Node, Python venvs, Docker
  Compose, or justfiles.

## Git And Remotes

Stephen's standard repo setup is dual-push SSH on `origin`: one fetch URL plus
multiple `pushurl` entries for GitHub and Codeberg.

- Before substantial changes, inspect branch, status, and remotes.
- Prefer `git pull --ff-only origin main` before major implementation work
  when network access is available and appropriate.
- Prefer `git push origin <branch>` for routine pushes; this should push to
  both configured push URLs.
- Attribute committed work to the repo's configured `dunamismax` identity.
- Do not override commit authors with `-c user.name=...` or
  `-c user.email=...`.
- If `git config user.email` is not a `dunamismax`-owned address, stop before
  committing.
- Never force-push `main`.
- Never include AI, assistant, co-author, or similar attribution in commits,
  release notes, or public docs.
