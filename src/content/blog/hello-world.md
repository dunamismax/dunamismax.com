---
title: "Building this site"
description: "Why I built dunamismax.com with Astro and hand-written CSS, and what to expect from this blog."
date: 2026-03-23
tags: ["astro", "self-hosting", "meta"]
draft: false
---

This site exists because I needed a home for the work.

I've been building self-hostable systems software for a while now — file transfer relays, network observability tools, crypto toolkits, incident command systems, repo health daemons. The code lives on GitHub. The ideas live in my head. Neither of those is a great place for someone else to understand what I'm actually doing or why.

So: dunamismax.com. A portfolio, a blog, and a contact page. Nothing more until something earns its spot.

## The stack

The site is built with **Astro**, rendered to static HTML at build time. No server process at runtime. No database. No CMS. Blog posts are Markdown files in the repo. The styling is hand-written CSS with design tokens — no Tailwind, no utility framework, no CSS-in-JS.

Fonts are self-hosted. There are no third-party scripts, no analytics, no tracking pixels, no cookie banner (because there are no cookies). The entire home page transfers under 100KB.

This is the same stack I use for the browser-facing surfaces of my other products: **Bun** for tooling, **TypeScript** in strict mode, **Astro** for rendering, **Alpine.js** for light interaction. The site is the proof that the stack works.

## Why static

Every page on this site works with JavaScript disabled. The HTML is the product. Alpine.js enhances where needed — a mobile nav toggle, maybe a filter control later — but nothing gates on it.

Static output means the deployment target is just "anything that serves files." Cloudflare Pages, a VPS with Caddy, an S3 bucket — the choice is reversible because the output is just files. That's the kind of decision I want to make: ones where the cost of being wrong is low.

## What to expect

The blog will cover what I'm building and how I think about it:

- **Build logs** — honest accounts of shipping a product or feature. What worked, what broke, what I learned.
- **Systems thinking** — architecture decisions, storage tradeoffs, operational discipline.
- **Craft** — Go patterns, Zig idioms, SQLite tricks. Short, specific, useful.
- **Stack philosophy** — why boring infrastructure wins, why self-hosting matters, why the data layer is the truth layer.

No listicles. No engagement bait. No "10 things I learned" titles. I'll write like I'm explaining a decision to a colleague who will call me on it if the reasoning doesn't hold up.

Cadence target: one post every week or two. Quality over quantity.

The code for this site is open: [github.com/dunamismax/dunamismax.com](https://github.com/dunamismax/dunamismax.com).
