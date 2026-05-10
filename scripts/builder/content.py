"""Loaders for the file-backed content tree.

Posts live in ``content/posts/<slug>.md`` with a TOML frontmatter block
delimited by ``+++``. Projects live in ``content/projects.toml``. Static
page bodies live as Markdown under ``content/pages/``.
"""

from __future__ import annotations

import datetime as dt
import tomllib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Project:
    slug: str
    name: str
    category: str
    status: str
    position: int
    featured: bool
    visibility: str
    tagline: str
    stack: tuple[str, ...]
    repo: str = ""
    url: str = ""

    @property
    def public_repo(self) -> bool:
        return self.visibility == "public" and bool(self.repo)


@dataclass(frozen=True)
class Post:
    slug: str
    title: str
    description: str
    published_on: dt.date
    tags: tuple[str, ...]
    body_markdown: str
    body_html: str
    draft: bool = False


PROJECT_CATEGORIES: tuple[str, ...] = (
    "apps",
    "infrastructure",
    "developer-tools",
    "reference",
)
PROJECT_STATUSES: tuple[str, ...] = ("active", "shipped", "phase-0", "legacy")


def load_projects(root: Path) -> list[Project]:
    path = root / "content" / "projects.toml"
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    raw_projects: list[dict[str, Any]] = data.get("projects", [])
    projects: list[Project] = []
    seen: set[str] = set()
    for raw in raw_projects:
        slug = raw["slug"]
        if slug in seen:
            raise ValueError(f"duplicate project slug: {slug}")
        seen.add(slug)
        category = raw["category"]
        status = raw["status"]
        if category not in PROJECT_CATEGORIES:
            raise ValueError(f"project {slug}: unknown category {category!r}")
        if status not in PROJECT_STATUSES:
            raise ValueError(f"project {slug}: unknown status {status!r}")
        stack_raw = raw.get("stack", "")
        if isinstance(stack_raw, str):
            stack = tuple(s.strip() for s in stack_raw.split(",") if s.strip())
        else:
            stack = tuple(stack_raw)
        projects.append(
            Project(
                slug=slug,
                name=raw["name"],
                category=category,
                status=status,
                position=int(raw.get("position", 999)),
                featured=bool(raw.get("featured", False)),
                visibility=raw.get("visibility", "public"),
                tagline=raw["tagline"],
                stack=stack,
                repo=raw.get("repo", ""),
                url=raw.get("url", ""),
            )
        )
    projects.sort(key=lambda p: (p.position, p.name))
    return projects


def projects_by_category(
    projects: list[Project],
) -> dict[str, list[Project]]:
    grouped: dict[str, list[Project]] = {c: [] for c in PROJECT_CATEGORIES}
    for project in projects:
        grouped[project.category].append(project)
    return grouped


def featured_projects(projects: list[Project]) -> list[Project]:
    return [p for p in projects if p.featured]


@dataclass(frozen=True)
class FrontmatterError(Exception):
    path: Path
    message: str

    def __str__(self) -> str:  # pragma: no cover - tiny helper
        return f"{self.path}: {self.message}"


def _split_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("+++"):
        return "", text
    end = text.find("\n+++", 3)
    if end == -1:
        raise ValueError("frontmatter opened with +++ but never closed")
    fm = text[3:end].strip()
    rest = text[end + len("\n+++") :]
    if rest.startswith("\n"):
        rest = rest[1:]
    return fm, rest


def _parse_date(value: object) -> dt.date:
    if isinstance(value, dt.datetime):
        return value.date()
    if isinstance(value, dt.date):
        return value
    if isinstance(value, str):
        return dt.date.fromisoformat(value)
    raise TypeError(f"unsupported date value: {value!r}")


def load_posts(root: Path, *, render_markdown) -> list[Post]:
    posts_dir = root / "content" / "posts"
    posts: list[Post] = []
    if not posts_dir.is_dir():
        return posts
    for path in sorted(posts_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        fm_text, body = _split_frontmatter(text)
        if not fm_text:
            raise ValueError(f"{path}: missing TOML frontmatter (delimit with +++)")
        try:
            meta = tomllib.loads(fm_text)
        except tomllib.TOMLDecodeError as exc:
            raise ValueError(f"{path}: invalid TOML frontmatter: {exc}") from exc
        slug = meta.get("slug") or path.stem
        for required in ("title", "description", "published_on"):
            if required not in meta:
                raise ValueError(f"{path}: missing required frontmatter key {required!r}")
        tags_raw = meta.get("tags", [])
        if isinstance(tags_raw, str):
            tags = tuple(t.strip() for t in tags_raw.split(",") if t.strip())
        else:
            tags = tuple(str(t) for t in tags_raw)
        post = Post(
            slug=slug,
            title=meta["title"],
            description=meta["description"],
            published_on=_parse_date(meta["published_on"]),
            tags=tags,
            body_markdown=body,
            body_html=render_markdown(body),
            draft=bool(meta.get("draft", False)),
        )
        posts.append(post)
    posts.sort(key=lambda p: p.published_on, reverse=True)
    return posts


def published_posts(posts: list[Post]) -> list[Post]:
    return [p for p in posts if not p.draft]


@dataclass(frozen=True)
class PageBody:
    slug: str
    title: str
    description: str
    body_html: str = ""
    body_markdown: str = ""
    extra: dict[str, Any] = field(default_factory=dict)


def load_page_markdown(root: Path, slug: str, *, render_markdown) -> str:
    path = root / "content" / "pages" / f"{slug}.md"
    if not path.is_file():
        return ""
    return render_markdown(path.read_text(encoding="utf-8"))
