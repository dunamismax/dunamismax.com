# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer.

dunamismax.com is the public home for Stephen's projects, writing, and contact
surface. The repo ships a static Astro site from `frontend/`, with Docker and
Caddy handling the deployment path.

## Stack

- **Bun**
- **TypeScript**
- **Astro**
- **Vue** for small client islands where needed
- **Caddy** serving the built static output in Docker
- **Biome** for linting and formatting
- **`astro check`** for type and route validation
- **`bun test`** for frontend utilities
- **Python 3.11+** for the smoke test in `scripts/smoke.py`

The site is intentionally simple: no CMS, no database, and no third-party
analytics.

## Repository Layout

```text
dunamismax.com/
  deploy/
    static-site.Caddyfile
  frontend/
    public/
    src/
      components/
      config/
      content/
        blog/
        projects/
      layouts/
      pages/
      styles/
    tests/
    package.json
  docs/
    frontend-contract-inventory.md
  scripts/
    smoke.py
    verify.sh
  Dockerfile
  Caddyfile
  docker-compose.yml
  package.json
  README.md
```

## Local Development

### Prerequisites

- Bun
- Python 3.11+
- Docker for the containerized deploy path

Install dependencies:

```bash
bun --cwd frontend install
```

Start local development:

```bash
bun run dev
```

Build and preview:

```bash
bun run build
bun run preview
```

Run the containerized path locally:

```bash
docker compose up -d --build
```

Deploy on the production host:

```bash
./deploy/deploy-prod.sh
```

If `8080` is busy, publish on another port:

```bash
DUNAMISMAX_HOST_PORT=18080 docker compose up -d --build
python3 scripts/smoke.py --base-url http://127.0.0.1:18080
```

## Verification

Run the full repo checks:

```bash
bun run verify
```

Equivalent manual checks:

```bash
bun --cwd frontend install --frozen-lockfile
bun --cwd frontend run lint
bun --cwd frontend run check
bun --cwd frontend run test
bun --cwd frontend run build
python3 scripts/smoke.py
```

## Deployment Notes

Cloudflare Origin CA setup:

```bash
./deploy/generate-cloudflare-origin-csr.sh
./deploy/switch-to-cloudflare-origin.sh
```

- The container is intended to publish only on `127.0.0.1:8080`, with host Caddy handling ports `80/443`.
- `www.dunamismax.com` should redirect permanently to `https://dunamismax.com`.
- For permanent Cloudflare proxying, prefer a Cloudflare Origin CA certificate installed at the host Caddy layer.

## License

GPL-3.0. See [LICENSE](LICENSE).
