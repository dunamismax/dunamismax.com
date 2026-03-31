# Stage 1: Build the Astro site
FROM oven/bun:1.3.10-alpine AS build

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ ./
RUN bun run build

# Stage 2: Serve the static build with Caddy
FROM caddy:2.10-alpine

COPY deploy/static-site.Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/frontend/dist /srv

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/health | grep -q '{"status":"ok"}' || exit 1

EXPOSE 80
