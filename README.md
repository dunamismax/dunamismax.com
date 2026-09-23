# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer: PHP-first web work,
Python scripting, and hands-on systems administration.

## Stack

| Layer | Choice | Responsibility |
| --- | --- | --- |
| DNS | Cloudflare | Domain routing |
| Server | Ubuntu | Hosts the application, database, and files |
| Web server | Caddy | HTTPS, the two static files, FastCGI to PHP-FPM |
| Application | PHP 8.5, object-oriented and bespoke | Routing, rendering, publishing |
| Database | MySQL 8 | Blog posts and drafts |
| Documents | Semantic HTML | Server-rendered pages |
| Styling | Vanilla CSS | Responsive layout; light/dark via `prefers-color-scheme` |
| Enhancement | None | **The site sends zero JavaScript** |

There is no framework, ORM, CMS, Composer dependency, npm project, build
step, Markdown library, external font, analytics, or CDN. Add a dependency
only when a concrete need justifies its lifetime cost.

```text
Reader → Cloudflare DNS → Ubuntu → Caddy → PHP-FPM (dunamismax pool) → PHP → MySQL
                                        ↳ /css/site.css and /icon.svg as files
```

## Layout

```text
app/                  Application, Config, Database, View, RssFeed, helpers
  Http/               Response and default security headers
  Repositories/       Post queries and the publication visibility rule
  Publishing/         CLI publishing: command, validator, writer, config
bin/                  check.php (lint), database.php (schema), posts.php (publishing CLI)
database/schema.sql   MySQL schema (posts)
deploy/               Numbered root scripts, Caddy block, FPM pool, backups
dev/router.php        Router for PHP's development server
docs/                 Architecture, content, and production runbook
public/               The only web root: index.php, css/site.css, icon.svg
storage/              Private runtime files, ignored by Git
tests/                Dependency-free checks and an opt-in MySQL suite
views/                Layout, pages, and project-card partials
bootstrap.php         Autoloader for the Dunamismax namespace
```

## Routes

| Route | Response |
| --- | --- |
| `/` | Home: direction, stack, featured projects, latest post |
| `/about` | About Stephen |
| `/contact` | Email, Signal, GitHub, Codeberg, Reddit, site source |
| `/projects` | Projects grouped by category |
| `/blog`, `/blog?page=2` | Published posts, ten per page |
| `/blog/{slug}` | One published post |
| `/feed.xml` | RSS 2.0, latest 20 posts, `application/xml` |
| `/robots.txt` | `text/plain` |
| `/manifest.webmanifest` | `application/manifest+json` |
| `/icon.svg` | SVG icon, served by Caddy |
| `/css/site.css` | Stylesheet, served by Caddy |
| `/healthz` | `{"status":"ok"}`, independent of MySQL |

`www.dunamismax.com` redirects permanently to the apex. Unknown paths are
404, non-GET/HEAD methods are 405, and a database outage is an honest 503
on blog routes while the home page stays up.

## Content

- **Blog posts** live in MySQL and are managed with `php bin/posts.php`
  (create, edit, validate, publish, schedule, unpublish). Drafts and
  future-dated posts stay private. Bodies are plain text rendered as escaped
  paragraphs; HTML and Markdown stay literal. See [docs/content.md](docs/content.md).
- **Pages** (home, about, contact, projects) are hand-written semantic HTML in
  `views/`. Project cards live in `views/partials/projects/`, one file per
  category, shared by the home and projects pages.

## Local development

PHP 8.3+ with `pdo_mysql`, POSIX, and DOM. No package installation.

```sh
cp .env.example .env
make serve      # http://127.0.0.1:8000, php -S with dev/router.php
make check      # php -l on every file + tests/run.php
```

With `APP_ENV=local` and an empty `DB_NAME`, pages render with an empty
blog. To use MySQL, create a database and account, set `DB_*` in `.env`, and
run `make database` to apply `database/schema.sql`.

| Variable | Meaning |
| --- | --- |
| `APP_ENV` | `local`, `test`, or `production` (default) |
| `APP_URL` | Canonical origin, no path; HTTPS in production |
| `DB_HOST`, `DB_PORT` | MySQL, default `127.0.0.1:3306` |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Database and SELECT-only account |

The MySQL integration suite needs a dedicated, empty `_test` database and
separate setup, publisher, and read-only accounts:

```sh
APP_ENV=test DB_NAME=dunamismax_test DB_USER=... DB_PASSWORD=... \
TEST_PUBLISH_DB_USER=... TEST_PUBLISH_DB_PASSWORD=... \
TEST_WEB_DB_USER=... TEST_WEB_DB_PASSWORD=... php tests/database.php
```

## Production

Releases live in `/srv/www/dunamismax.com/releases/<commit>` behind a
`current` symlink, served by the `dunamismax` PHP-FPM pool as the
`dunamismax` system user, with the `dunamismax` MySQL database on localhost.
Pushing to Git does **not** deploy; the owner runs `deploy/03-deploy.sh`.
See [docs/production.md](docs/production.md) for the layout, the migration
scripts, releases, backups, and rollback.

## License

MIT. See [LICENSE](LICENSE).
