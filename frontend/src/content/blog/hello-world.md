---
title: Building this site
description: "Why dunamismax.com exists, how it fits the actual stack I build with, and what this site is supposed to do."
date: 2026-03-23
tags:
  - self-hosting
  - meta
  - astro
draft: false
---
This site exists because the repos were no longer enough.

GitHub is where the code lives. It is not where the story lives. A pile of
repos can show activity, but it does not explain what I build, which stacks I
actually trust, or how the projects relate to each other.

So this site has a narrow job:

- show the real public project surface
- explain the stack choices clearly
- publish build logs and deployment notes
- stay fast, simple, and easy to host

Nothing here is meant to be ornamental. If a page does not help a reader
understand the work, it should not exist.

## The stack

The site is built with **Astro** on **Bun**. It is a static-first frontend with
hand-written CSS, self-hosted fonts, typed content files, and exactly enough
JavaScript to support the places where Astro benefits from it.

That matches the actual web lane I use elsewhere: **TypeScript + Bun + Astro**
for browser surfaces, with **Vue** only when the product has enough
statefulness to justify it. Browser code is not supposed to become a dumping
ground for every idea that could have been a server-rendered page.

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

No listicles. No engagement bait. No "10 things I learned" titles. I'll write
like I'm explaining a decision to a colleague who will call me on it if the
reasoning doesn't hold up.

The code for this site is open:
[github.com/dunamismax/dunamismax.com](https://github.com/dunamismax/dunamismax.com).
