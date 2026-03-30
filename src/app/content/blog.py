"""Blog post data loaded from frontend-owned markdown files."""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import markdown
import yaml


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
FRONTEND_BLOG_DIR = Path(__file__).resolve().parents[3] / "frontend" / "src" / "content" / "blog"


def get_reading_time(text: str) -> str:
    """Estimate reading time for a block of text."""
    words = len(text.split())
    minutes = max(1, math.ceil(words / WORDS_PER_MINUTE))
    return f"{minutes} min read"


def render_markdown(text: str) -> str:
    """Render markdown content to HTML."""
    return markdown.markdown(text, extensions=["fenced_code", "codehilite", "tables"])


def _split_frontmatter(raw_markdown: str) -> tuple[dict[str, Any], str]:
    if not raw_markdown.startswith("---\n"):
        raise ValueError("Markdown file is missing YAML frontmatter")

    try:
        frontmatter_block, content = raw_markdown[4:].split("\n---\n", 1)
    except ValueError as exc:
        raise ValueError("Markdown file has an unterminated YAML frontmatter block") from exc

    metadata = yaml.safe_load(frontmatter_block)
    if not isinstance(metadata, dict):
        raise ValueError("Markdown frontmatter must decode to a mapping")

    return metadata, content.lstrip("\n")


def _coerce_date(value: Any) -> str:
    if isinstance(value, str):
        return value

    isoformat = getattr(value, "isoformat", None)
    if callable(isoformat):
        return str(isoformat())

    raise TypeError(f"Unsupported date value: {value!r}")


def _load_posts() -> list[BlogPost]:
    posts: list[BlogPost] = []

    for path in sorted(FRONTEND_BLOG_DIR.glob("*.md")):
        metadata, content = _split_frontmatter(path.read_text(encoding="utf-8"))
        tags = metadata.get("tags", [])
        if not isinstance(tags, list):
            raise TypeError(f"Blog tags must be a list in {path}")

        posts.append(
            BlogPost(
                slug=path.stem,
                title=str(metadata["title"]),
                description=str(metadata["description"]),
                date=_coerce_date(metadata["date"]),
                tags=[str(tag) for tag in tags],
                draft=bool(metadata.get("draft", False)),
                content=content,
            )
        )

    return posts


def get_published_posts() -> list[BlogPost]:
    """Return published posts sorted newest-first."""
    return sorted(
        [p for p in _load_posts() if not p.draft],
        key=lambda p: p.date,
        reverse=True,
    )


def get_post_by_slug(slug: str) -> BlogPost | None:
    """Find a published post by slug."""
    for post in _load_posts():
        if post.slug == slug and not post.draft:
            return post
    return None
