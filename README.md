# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer.

`dunamismax.com` is the public home for Stephen's projects, writing, and
contact surface. The site is a **Ruby on Rails 8.1** application: server-rendered
HTML, Hotwire on top of import maps, Tailwind via `tailwindcss-rails`, and SQLite
on disk for storage.

The previous version of this site was an Astro static build; it was rewritten
in Rails so that the site uses the same stack as the products linked from it.
For the rationale, see [the rewrite blog post](app/views/posts) or read it on
the site at `/blog/rewriting-dunamismax-in-rails`.

## Stack

- Ruby 4.0.3
- Rails 8.1.3
- Hotwire (Turbo + Stimulus) over importmap-rails
- Propshaft asset pipeline
- Tailwind CSS via `tailwindcss-rails`
- SQLite for primary, cache, queue, and cable databases
- Solid Queue, Solid Cache, Solid Cable
- Puma cluster, Thruster, and Kamal scaffolding
- Caddy on the host as the public TLS terminator
- Cloudflare in front of the apex domain
- Minitest, RuboCop (Rails Omakase), Brakeman, and bundler-audit

The repo's `.mise.toml` pins Ruby `4.0.3` and Node `24.13.1`. Use
[mise](https://mise.jdx.dev) to match the toolchain.

## Repository layout

```text
dunamismax.com/
  app/
    assets/
      stylesheets/application.css   # Hand-written design tokens
      tailwind/application.css      # @import "tailwindcss";
    controllers/                    # PagesController, PostsController, ProjectsController, FeedsController
    helpers/
    javascript/                     # Stimulus controllers including theme_controller.js
    models/                         # Post, Project
    views/
      layouts/application.html.erb
      pages/                        # home, about, contact
      posts/                        # index, show
      projects/                     # index
      feeds/index.rss.builder
      shared/                       # _header, _footer
  bin/                              # setup, dev, ci, rails, rake, rubocop, brakeman, bundler-audit
  config/                           # routes.rb, application.rb, environments/, initializers/, *.yml
  db/
    migrate/                        # CreatePosts, CreateProjects
    seeds.rb
    seeds/posts/*.html              # Authored blog post bodies
  test/
  Gemfile
  Procfile.dev
  Rakefile
  config.ru
  Caddyfile                         # Production reverse-proxy vhost
  Dockerfile
  README.md
  BUILD.md
```

## Local development

### Prerequisites

- Ruby 4.0.3 (via mise: `mise install`)
- Node 24.13.1 (via mise, used by the Tailwind CLI)
- SQLite
- Foreman (auto-installed by `bin/dev` on first run)

### Quick start

```sh
bin/setup
bin/dev
```

Then open [http://localhost:3000](http://localhost:3000).

`bin/setup` runs `bundle install`, prepares the SQLite databases, clears stale
logs, and (unless `--skip-server` is passed) execs into `bin/dev`. `bin/dev`
starts the Rails server alongside the Tailwind watcher via `Procfile.dev`.

### Seeds

The blog posts and projects shown on the site come from `db/seeds.rb`. To
re-seed against your dev database:

```sh
bin/rails db:seed
```

To replant from scratch (drops all rows in seeded tables and reloads):

```sh
bin/rails db:seed:replant
```

## Routes

```text
GET  /             pages#home
GET  /about        pages#about
GET  /contact      pages#contact
GET  /projects     projects#index
GET  /blog         posts#index
GET  /blog/:slug   posts#show
GET  /feed.xml     feeds#index   (RSS 2.0)
GET  /robots.txt   feeds#robots
GET  /up           rails/health#show (excluded from SSL redirect and host auth)
```

## Checks

The canonical local and CI gate is:

```sh
bin/ci
```

It runs setup, RuboCop, bundler-audit, the importmap audit, Brakeman, the
Tailwind build, the Rails test suite, and the seed replant. The same script
runs in GitHub Actions, alongside a release-blocking Docker build.

Individual steps:

```sh
bin/rails test
bin/rubocop
bin/brakeman --no-pager
bin/bundler-audit
bin/rails tailwindcss:build
```

## Production

The production app is configured to be secure-by-default behind an
SSL-terminating proxy. It is HTTPS-only for browser traffic, with `/up`
exempted so a load balancer or uptime probe can hit the health endpoint over
plain HTTP.

| Variable                   | Default                                     | Notes |
| -------------------------- | ------------------------------------------- | ----- |
| `RAILS_ENV`                | `development`                               | Set to `production`. |
| `SECRET_KEY_BASE`          | (none)                                      | Required when `RAILS_MASTER_KEY` is not used. |
| `APP_HOST`                 | `dunamismax.com`                            | Canonical host for generated links. |
| `RAILS_HOSTS`              | `APP_HOST,www.dunamismax.com`               | Comma-separated allowed hosts. |
| `RAILS_FORCE_SSL`          | `true`                                      | Set to `false` only for non-browser smoke tests. |
| `RAILS_ASSUME_SSL`         | follows `RAILS_FORCE_SSL`                   |  |
| `RAILS_SERVE_STATIC_FILES` | (unset)                                     | Enable when no upstream is serving `public/`. |
| `RAILS_LOG_LEVEL`          | `info`                                      |  |
| `PORT`                     | `3000` (production: `8082`)                 | Port Puma binds to. |
| `RAILS_MAX_THREADS`        | `3`                                         |  |
| `WEB_CONCURRENCY`          | `1`                                         |  |
| `SOLID_QUEUE_IN_PUMA`      | `false`                                     | Single-server: set to `true`. |

### The deploy shape

`dunamismax.com` is self-hosted on a single Ubuntu box behind Caddy. Puma
under systemd, SQLite on disk, Caddy in front for TLS, Cloudflare at the edge.

- App code: `/home/sawyer/github/dunamismax.com` (deployed in place via `git pull`)
- Toolchain: Ruby 4.0.3 + Node 24.13.1 installed by mise under `/home/sawyer/.local/share/mise/installs/`
- Gems: `vendor/bundle` (`bundle config set --local deployment true`, `--local without development:test`)
- Databases: `storage/production.sqlite3` plus `_cache`, `_queue`, `_cable` siblings
- Env: `/etc/dunamismax-web/env` (root:sawyer, mode 0640)
- Service: `/etc/systemd/system/dunamismax-web.service` (User=sawyer, enabled at boot), Puma listens on `127.0.0.1:8082`
- Caddy: vhost block from `Caddyfile` reverse-proxies the apex to `127.0.0.1:8082` and 301-redirects `www`

For the full production runbook (system deps, mise install, gem install, env
setup, systemd unit, Caddy vhost, redeploy script), see [BUILD.md](BUILD.md).

## License

GPL-3.0. See [LICENSE](LICENSE).
