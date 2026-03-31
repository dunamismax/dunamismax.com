---
title: Shipping dunamismax.com to production
description: "How this site went from repo to production on an Ubuntu VM with Docker, Caddy, Cloudflare, and a Cloudflare Origin CA certificate."
date: 2026-03-31
tags:
  - self-hosting
  - deployment
  - cloudflare
  - caddy
  - docker
draft: false
---
Today this site stopped being a local build and became a production deployment.

The end state is intentionally boring:

- Astro builds the static site
- a Docker container serves the built output
- host-level Caddy terminates TLS and reverse proxies to a loopback-only origin
- Cloudflare proxies the public domain
- the origin now uses a Cloudflare Origin CA certificate in **Full (strict)** mode

That is the whole stack. No platform layer, no managed frontend host, no
control plane I have to click through every time I want to ship a content
change.

## The shape that won

The site itself is a static Astro frontend, so the production question was not
"how do I scale this?" It was "how do I deploy it in a way that stays obvious
six months from now?"

The answer was:

1. build the site in Docker
2. publish the container only on `127.0.0.1:8080`
3. let host Caddy own `80/443`
4. keep Cloudflare at the edge

Publishing the container on loopback only matters. It keeps the origin private
to the host and makes Caddy the only public HTTP entrypoint on the VM.

## The actual cutover

The server already had Caddy and Docker available, but it was still serving the
default Caddy page on `:80`. The repo had the right broad deployment idea, but
it still needed production tightening:

- the Docker publish had to be locked to `127.0.0.1`
- `www` needed a permanent redirect to the apex domain
- the host Caddyfile needed to be installed and reloaded from the repo
- the deployment path needed one script instead of a pile of remembered commands

So the repo now carries an actual deployment path:

- `deploy/deploy-prod.sh` for the production rollout
- a host Caddyfile that proxies to the loopback origin
- a Cloudflare Origin CA workflow for long-term proxied operation

That last part matters because I want Cloudflare proxying on permanently.

## Cloudflare changed the last mile

The site worked first with direct public HTTPS from Caddy, but that is not the
best long-term model when Cloudflare is always in front.

Once Cloudflare proxying was enabled, the better origin posture was a
Cloudflare-origin certificate instead of relying on the public-certificate path.
So the deployment now uses:

- a locally generated private key
- a CSR created on the host
- a Cloudflare Origin CA certificate installed into Caddy
- Cloudflare SSL/TLS mode set to **Full (strict)**

That means the browser trusts Cloudflare's edge certificate, while Cloudflare
trusts the origin certificate presented by Caddy. The origin certificate is not
for browsers. It is for the Cloudflare-to-origin hop only. That is exactly what
I want here.

## One small edge case

After the proxy switch, the public site was healthy but the Python smoke script
started failing with a Cloudflare `1010` block. The site was not broken. The
edge was rejecting the default `Python-urllib` fingerprint.

The fix was simple: make the smoke script use a normal browser-like request
profile instead of the default Python user agent. Same checks, same routes, less
needless friction with the edge.

That is a good example of the difference between "the app is broken" and "the
operating environment has a policy now."

## Where it landed

The site is now live at:

- `https://dunamismax.com`
- `https://www.dunamismax.com` → redirected to the apex domain

The live smoke suite passes against the public site, including:

- `/`
- `/projects`
- `/blog`
- `/about`
- `/contact`
- `/feed.xml`
- `/sitemap.xml`
- `/robots.txt`
- `/health`

That is enough surface area for me to trust the deploy.

## Why this matters

This site is not supposed to be impressive because it uses a lot of technology.
It is supposed to be good because the stack fits the job.

Static Astro frontend. Docker container. Caddy on the host. Cloudflare at the
edge. One VM. One domain. One repo. One deployment path I can explain without a
slide deck.

That is the standard I want for the rest of the public work too.
