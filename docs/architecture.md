# Architecture

One PHP application, one MySQL table, and ordinary files. There is no
frontend application, background worker, or build step. The structure
mirrors Grace & Footnotes, the reference site on the same server.

## A request

1. Caddy serves `/css/site.css` or `/icon.svg` directly from
   `current/public/`. Every other path is rewritten to `public/index.php` and
   sent through the `dunamismax` PHP-FPM socket.
2. `bootstrap.php` registers the `Dunamismax` autoloader and view helpers.
3. `Environment` reads the literal `.env` file (linked to
   `/etc/dunamismax/site.env` in production); process variables take
   precedence. `Config` validates the environment, origin, and database settings.
4. `Application::handle()` rejects methods other than GET and HEAD with 405 and
   routes on the path alone. The canonical origin comes from `APP_URL`, never
   from Host or forwarding headers.
5. `PostRepository` runs the few prepared queries; `Database` connects lazily,
   so pages that need no posts never open a connection.
6. `View` renders a template inside `views/layout.php`. `Response` sends the
   status, headers (`no-store`, CSP `default-src 'self'`, nosniff,
   referrer and permissions policies), and the body, omitting it for HEAD.

## Routes and content

| Path | Source |
| --- | --- |
| `/`, `/about`, `/contact`, `/projects` | `views/*.php` (semantic HTML) |
| `/blog`, `/blog/{slug}`, `/feed.xml` | MySQL `posts` through `PostRepository` |
| `/robots.txt`, `/manifest.webmanifest`, `/healthz` | `Application` |
| `/css/site.css`, `/icon.svg` | Files in `public/`, served by Caddy |

The home page uses the latest post and the published count. If MySQL is
unreachable it still renders, logs the error, and shows a neutral blog link
instead of claiming the blog is empty. Blog routes and the feed return an
honest 503 with `Retry-After`. `/healthz` never touches MySQL.

Project cards are written once per category in `views/partials/projects/`
and included by both the home page (one list) and `/projects` (grouped).

## Visibility rule

A public post has `status = 'published'` and `published_at` at or before the
database's UTC time. One constant in `PostRepository` applies it to lists,
counts, single posts, the home card, and RSS, so scheduled posts appear
without cron.

## Frontend

The site sends zero JavaScript. The former theme toggle is replaced by
`prefers-color-scheme`: dark by default, with the light palette in a media
query. The stylesheet URL carries its modification time as `?v=`. There are no
inline styles or scripts, which keeps the CSP strict. Navigation marks the
current section with `aria-current="page"` and an underline, not color alone.

## What changed from the Rust app

- Same URLs, statuses, and content types. `/js/theme.js` is removed (404).
- Markdown and TOML content became semantic HTML views; there were no posts.
- The PostgreSQL `page_view` tracking is dropped, and its data was not migrated.
- Dynamic responses are `Cache-Control: no-store`; the feed is still
  `application/xml`.

## Verification

`make check` lints every PHP file and runs `tests/run.php` (about 250
checks). The checks cover:

- Every route, its status, headers, metadata, and copy.
- The absence of scripts and of retired stack and project names.
- Project counts against the cards, and exact contact links.
- Escaping, the database-outage behavior, and CLI and feed validation.
- The real front controller over HTTP.

`tests/database.php` exercises real MySQL:

- Schema reapplication, publication visibility, and SQL binding.
- Pagination and the CLI lifecycle.
- SELECT-only enforcement for the website account.
- Feed behavior over HTTP.
