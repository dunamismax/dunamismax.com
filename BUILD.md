# dunamismax.com · Build & Deploy Runbook

This is the operational runbook for the Rails 8 version of `dunamismax.com`.
The site is self-hosted on a single Ubuntu box. Puma under systemd, SQLite on
disk, Caddy in front for TLS and HTTP/2, Cloudflare at the edge.

For the architectural rationale (why this site is Rails now), see the blog
post at `/blog/rewriting-dunamismax-in-rails`.

## 1. Toolchain

The repo pins Ruby `4.0.3` and Node `24.13.1` via `.mise.toml` and
`.ruby-version`. The expectation is that mise manages both.

System dependencies on Ubuntu (one-time, plus when bumping Ruby):

```sh
sudo apt-get update
sudo apt-get install -y build-essential autoconf bison \
  libssl-dev libreadline-dev zlib1g-dev libyaml-dev libffi-dev libgmp-dev \
  libsqlite3-dev libxml2-dev libxslt1-dev libcurl4-openssl-dev \
  libgdbm-dev libncurses-dev libdb-dev pkg-config rustc \
  curl git ca-certificates
```

mise install:

```sh
curl -fsSL https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
cd /path/to/dunamismax.com
mise trust
mise install        # builds Ruby 4.0.3, fetches Node 24.13.1
```

## 2. Gem install

Production gems are installed deployment-style under `vendor/bundle`:

```sh
gem install bundler -v 4.0.11 --no-document
bundle config set --local deployment true
bundle config set --local without 'development test'
bundle config set --local path vendor/bundle
bundle config set --local frozen true
bundle install
```

For development on the same box, run `bundle install` without the deployment
flags, or use a separate working directory.

## 3. Secrets and env

```sh
sudo install -d -m 0750 -o "$USER" -g "$USER" /etc/dunamismax-web
SECRET_KEY_BASE_DUMMY=1 RAILS_ENV=production bundle exec bin/rails secret
```

Put the result, plus the env vars listed in `README.md`, into
`/etc/dunamismax-web/env` (root:sawyer, mode 0640). Suggested baseline:

```ini
RAILS_ENV=production
SECRET_KEY_BASE=...
APP_HOST=dunamismax.com
RAILS_HOSTS=dunamismax.com,www.dunamismax.com
RAILS_FORCE_SSL=true
RAILS_SERVE_STATIC_FILES=1
RAILS_LOG_LEVEL=info
PORT=8082
WEB_CONCURRENCY=2
RAILS_MAX_THREADS=5
SOLID_QUEUE_IN_PUMA=true
```

## 4. Database and assets

```sh
set -a && . /etc/dunamismax-web/env && set +a
bundle exec bin/rails db:prepare
bundle exec bin/rails db:seed
bundle exec bin/rails assets:precompile
```

`db:prepare` is the right command: it creates the database if missing and runs
pending migrations otherwise. `db:seed` is idempotent — every record uses
`find_or_initialize_by(...).update!(...)` so re-seeding is safe.

## 5. systemd unit

`/etc/systemd/system/dunamismax-web.service`:

```ini
[Unit]
Description=dunamismax.com Rails Web (Puma)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=sawyer
Group=sawyer
WorkingDirectory=/home/sawyer/github/dunamismax.com
EnvironmentFile=/etc/dunamismax-web/env
Environment=HOME=/home/sawyer
Environment=PATH=/home/sawyer/.local/share/mise/installs/ruby/4.0.3/bin:/home/sawyer/.local/share/mise/installs/node/24.13.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=BUNDLE_GEMFILE=/home/sawyer/github/dunamismax.com/Gemfile
ExecStart=/home/sawyer/.local/share/mise/installs/ruby/4.0.3/bin/bundle exec puma -C config/puma.rb -b tcp://127.0.0.1:8082
Restart=on-failure
RestartSec=5
KillMode=mixed
TimeoutStopSec=20

NoNewPrivileges=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=/home/sawyer/github/dunamismax.com/storage
ReadWritePaths=/home/sawyer/github/dunamismax.com/tmp
ReadWritePaths=/home/sawyer/github/dunamismax.com/log
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now dunamismax-web.service
sudo systemctl status dunamismax-web.service
```

## 6. Caddy

The repo ships a `Caddyfile` block to drop into `/etc/caddy/Caddyfile`:

```caddyfile
www.dunamismax.com {
    redir https://dunamismax.com{uri} permanent
}

dunamismax.com {
    encode zstd gzip

    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        Referrer-Policy "strict-origin-when-cross-origin"
        X-XSS-Protection "0"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }

    reverse_proxy 127.0.0.1:8082 {
        header_up X-Forwarded-Proto https
        header_up X-Real-IP {remote_host}
    }
}
```

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

If the apex is proxied by Cloudflare with **Full (strict)**, install the
Cloudflare Origin CA cert at the host Caddy layer instead of relying on
public Let's Encrypt certificates. This was set up for the prior Astro
deployment and is unchanged.

## 7. Redeploy / update flow

```sh
cd /home/sawyer/github/dunamismax.com && git pull
eval "$(~/.local/bin/mise activate bash)"
bundle install
set -a && . /etc/dunamismax-web/env && set +a
bundle exec bin/rails db:prepare
bundle exec bin/rails db:seed
bundle exec bin/rails assets:precompile
sudo systemctl restart dunamismax-web
```

That is the whole production deploy path. No image registry, no CI deploy
job, no Capistrano. The box pulls its own code.

## 8. Health checks

```sh
curl -s http://127.0.0.1:8082/up                              # local Puma
curl -s --resolve dunamismax.com:443:127.0.0.1 \
     https://dunamismax.com/up                                # via Caddy
sudo journalctl -u dunamismax-web -f                          # tail logs
```

`/up` is the Rails-built health endpoint. It is exempt from the SSL redirect
and from host authorization so a loopback probe can hit it without ceremony.

## 9. Backups

The SQLite databases live in `storage/`. Until they are moved to PostgreSQL,
an off-host backup of that directory is the entire backup policy. Anything
important (this is a pre-production marketing site, so not very much)
should be snapshotted before migrations or schema changes.

```sh
sudo systemctl stop dunamismax-web
tar -czf "dunamismax-storage-$(date +%F).tgz" -C /home/sawyer/github/dunamismax.com storage
sudo systemctl start dunamismax-web
```

A live backup with `sqlite3 .backup` is also fine because SQLite supports
hot online backups; the stop/start above is the simplest version that does
not require remembering the right `.backup` invocation.

## 10. Active phase plan

Current focus, in order:

1. **Rails 8 site.** Done — this repo. Public pages, projects, blog,
   RSS feed, contact.
2. **Authoring quality.** Move blog post bodies from raw HTML files in
   `db/seeds/posts/` to a Markdown renderer with code highlighting.
3. **Tags and series.** Add a tags index page and per-tag pages backed by
   `Post#tag_list`.
4. **Now / Uses.** A small Rails-managed `/now` page that the site can
   update without a deploy.
5. **Observability.** Set up Cloudflare access logs to a sink, add a tiny
   `lib/tasks/health.rake` runbook task, and verify journalctl retention.
6. **Postgres path.** Only when a feature actually requires it. The schema
   is already written in a way that maps cleanly.

When a step ships, this list moves up.
