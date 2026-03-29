"""Blog post data."""

from __future__ import annotations

import math
from dataclasses import dataclass

import markdown


@dataclass(frozen=True)
class BlogPost:
    slug: str
    title: str
    description: str
    date: str
    tags: list[str]
    draft: bool
    content: str


WORDS_PER_MINUTE = 230


def get_reading_time(text: str) -> str:
    """Estimate reading time for a block of text."""
    words = len(text.split())
    minutes = max(1, math.ceil(words / WORDS_PER_MINUTE))
    return f"{minutes} min read"


def render_markdown(text: str) -> str:
    """Render markdown content to HTML."""
    return markdown.markdown(text, extensions=["fenced_code", "codehilite", "tables"])


POSTS: list[BlogPost] = [
    BlogPost(
        slug="hello-world",
        title="Building this site",
        description=(
            "Why I built dunamismax.com with a server-rendered approach and"
            " hand-written CSS, and what to expect from this blog."
        ),
        date="2026-03-23",
        tags=["self-hosting", "meta"],
        draft=False,
        content="""\
This site exists because I needed a home for the work.

I've been building self-hostable systems software for a while now -- file
transfer relays, network observability tools, crypto toolkits, incident command
systems, repo health daemons. The code lives on GitHub. The ideas live in my
head. Neither of those is a great place for someone else to understand what I'm
actually doing or why.

So: dunamismax.com. A portfolio, a blog, and a contact page. Nothing more until
something earns its spot.

## The stack

The site is built with **FastAPI** and **Jinja2**. The current launch surface is
fully server-rendered HTML with hand-written CSS and design tokens, keeping the
dark, minimal aesthetic that feels like a terminal that learned typography.

Fonts are self-hosted. There are no third-party scripts, no analytics, no
tracking pixels, no cookie banner (because there are no cookies). The entire
home page transfers under 100KB.

The broader product stack uses **Python** for web surfaces and automation,
**Go** for services and CLIs, and **Rust** for systems-level work.

## Why server-rendered

Every URL on this site returns complete HTML on the first response. No
JavaScript framework, no client-side routing, no hydration step. The browser
gets exactly what it needs and nothing more.

The build is simple. FastAPI serves templates with Jinja2. Uvicorn runs the
server. Deployment is a Docker container with Caddy in front. No build step, no
bundler, no transpiler.

Blog posts and project data live in the repo as Python data files. No database.
No CMS. Just code.

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
[github.com/dunamismax/dunamismax.com](https://github.com/dunamismax/dunamismax.com).""",
    ),
]


def get_published_posts() -> list[BlogPost]:
    """Return published posts sorted newest-first."""
    return sorted(
        [p for p in POSTS if not p.draft],
        key=lambda p: p.date,
        reverse=True,
    )


def get_post_by_slug(slug: str) -> BlogPost | None:
    """Find a published post by slug."""
    for post in POSTS:
        if post.slug == slug and not post.draft:
            return post
    return None
