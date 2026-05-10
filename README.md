# dunamismax.com

Personal site, portfolio, and blog for Stephen Sawyer: systems-leaning
engineer, open source advocate, and privacy/security-minded builder.

`dunamismax.com` is the public home for Stephen's work, writing, and contact
surface.

## Target stack

The site is being rewritten to a deliberately narrow stack that matches the
rest of Stephen's work:

- **Vanilla HTML, CSS, and TypeScript** for the site itself. No frameworks,
  no SPA, no client-side router. Server-rendered pages and small, hand-written
  TypeScript where it actually helps.
- **Python** as the backend where one is needed (RSS feed generation, build
  tooling, content pipelines, deployment scripts).
- **Caddy** in front for TLS.
- **Cloudflare** at the edge.

Content (posts, projects) lives as plain files in the repository so the site
stays inspectable, diffable, and easy to host anywhere.

## Status

The site is currently mid-migration. The previous implementation is being
replaced with the vanilla HTML/CSS/TypeScript + Python target stack described
above. Source for the in-progress rewrite lives in this repository.

## Routes

```text
GET  /             home
GET  /about        about
GET  /contact      contact
GET  /projects     project index
GET  /blog         post index
GET  /blog/:slug   post detail
GET  /feed.xml     RSS 2.0 feed
GET  /robots.txt   robots
```

## Production shape

`dunamismax.com` is self-hosted on a single Ubuntu box behind Caddy, with
Cloudflare at the edge. The deployment is intentionally boring: one box, one
service, one redeploy script.

For the production runbook, see [BUILD.md](BUILD.md).

## License

GPL-3.0. See [LICENSE](LICENSE).
