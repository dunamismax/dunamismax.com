---
title: Why this site exists
description: "Why dunamismax.com exists, how it fits the way I build software, and what I want this site to do well."
date: 2026-03-23
tags:
  - self-hosting
  - meta
  - astro
draft: false
---
This site exists because code repositories alone do not explain the work very well.

GitHub is where the code lives. It is not where the context lives. A list of
repositories can show activity, but it does not explain what I build, which
tools I trust, or how the projects fit together.

So this site has a narrow job:

- show the real public project surface
- explain the stack choices clearly
- publish build logs and deployment notes
- stay fast, simple, and easy to host

This site is meant to stay direct. If a page does not help a visitor understand
the work, it should not be here.

## The stack

The site is built with **Astro** on **Bun**. It is a static-first frontend with
hand-written CSS, self-hosted fonts, typed content files, and exactly enough
JavaScript to support the places where Astro benefits from it.

That matches the web stack I use elsewhere: **TypeScript + Bun + Astro** for
browser surfaces, with **Vue** only when the product has enough statefulness to
justify it. I prefer browser code that stays focused instead of turning into a
dumping ground for logic that should have stayed simpler.

Outside the browser lane, the current stack is simple:

- **Python** for automation, integrations, APIs, and backend glue
- **Go** for networking, daemons, observability, and operator-heavy runtimes
- **PostgreSQL** as the default system of record when a product is meant to grow
- **SQLite** when the tool is intentionally local-first or embedded
- **OpenTUI** when a terminal workflow deserves more than a plain CLI

## Why static-first

Every URL on this site returns complete HTML on the first response. No
client-side router, no SPA shell, no hydration theater on pages that do not need
it. The browser gets what it needs and stops there.

The build is boring on purpose. Astro renders the site ahead of time. Bun
handles tooling. Content lives in the repo. Deployment is a container behind
Caddy. There is no CMS, no analytics script, and no control plane hidden behind
a marketing sentence.

Blog posts and project data live in the repo as Markdown and typed content
files. No database. No CMS. Just code.

## What to expect

The blog will cover what I'm building and how I think about it:

- **Build logs**: honest accounts of shipping a product or feature
- **Deployment notes**: what happened on the actual host, not the clean-room story
- **Systems thinking**: architecture decisions, storage tradeoffs, and operating discipline
- **Craft**: Astro and Bun patterns, Go systems work, Python automation, and data modeling
- **Stack philosophy**: why boring infrastructure wins and why self-hosting still matters

No listicles. No engagement bait. I want the writing to read like an honest
explanation to another engineer who will notice if the reasoning does not hold
up.

The code for this site is open:
[github.com/dunamismax/dunamismax.com](https://github.com/dunamismax/dunamismax.com).
