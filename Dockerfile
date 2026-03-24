# Stage 1: Build the static site
FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 2: Serve with Caddy
FROM caddy:alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /tmp/dist

RUN cp -R /tmp/dist/. /usr/share/caddy/ \
	&& find /usr/share/caddy -type d -exec chmod 755 {} \; \
	&& find /usr/share/caddy -type f -exec chmod 644 {} \; \
	&& rm -rf /tmp/dist

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

EXPOSE 80
