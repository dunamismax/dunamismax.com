---
title: Building this site
description: "Why I built dunamismax.com with a static-first Astro stack and hand-written CSS, and what to expect from this blog."
date: 2026-03-23
tags:
  - self-hosting
  - meta
draft: false
---
This site exists because I needed a home for the work.

I've been building self-hostable systems software for a while now -- file
transfer relays, network observability tools, crypto toolkits, incident command
systems, repo health daemons. The code lives on GitHub. The ideas live in my
head. Neither of those is a great place for someone else to understand what I'm
actually doing or why.

So: dunamismax.com. A portfolio, a blog, and a contact page. Nothing more until
something earns its spot.

## The stack

The site is built with **Astro** on **Bun**. The current launch surface is
static HTML with hand-written CSS and design tokens, keeping the dark, minimal
aesthetic that feels like a terminal that learned typography.

Fonts are self-hosted. There are no third-party scripts, no analytics, no
tracking pixels, no cookie banner (because there are no cookies). The entire
home page transfers under 100KB.

The broader product stack uses **Python** for backends and automation,
**Go** for services and CLIs, and **Rust** for systems-level work.

## Why static-first

Every URL on this site returns complete HTML on the first response. No
JavaScript framework, no client-side routing, no hydration step. The browser
gets exactly what it needs and nothing more.

The build is simple. Astro renders the site ahead of time. Bun handles the
tooling. Deployment is a Docker container with Caddy in front. There is a build
step now, but it stays boring and fully local.

Blog posts and project data live in the repo as Markdown and typed content
files. No database. No CMS. Just code.

## What to expect

The blog will cover what I'm building and how I think about it:

- **Build logs** -- honest accounts of shipping a product or feature. What
  worked, what broke, what I learned.
- **Systems thinking** -- architecture decisions, storage tradeoffs, operational
  discipline.
- **Craft** -- Go patterns, Rust systems work, SQLite tricks. Short, specific,
  useful.
- **Stack philosophy** -- why boring infrastructure wins, why self-hosting
  matters, why the data layer is the truth layer.

No listicles. No engagement bait. No "10 things I learned" titles. I'll write
like I'm explaining a decision to a colleague who will call me on it if the
reasoning doesn't hold up.

Cadence target: one post every week or two. Quality over quantity.

The code for this site is open:
[github.com/dunamismax/dunamismax.com](https://github.com/dunamismax/dunamismax.com).
