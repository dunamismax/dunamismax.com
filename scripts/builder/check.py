"""Build-time validation: frontmatter, internal links, generated output."""

from __future__ import annotations

import re
from pathlib import Path

from .content import Post, Project, PROJECT_CATEGORIES, PROJECT_STATUSES


HREF_RE = re.compile(r'href="([^"]+)"')

INTERNAL_PATH_RE = re.compile(r"^/")

ALLOWED_INTERNAL_PATHS_STATIC: set[str] = {
    "/",
    "/about",
    "/contact",
    "/projects",
    "/blog",
    "/feed.xml",
    "/robots.txt",
    "/manifest.webmanifest",
    "/icon.svg",
    "/styles/site.css",
    "/scripts/main.js",
    "/scripts/theme.js",
    "#main-content",
}


class CheckError(Exception):
    pass


def validate_projects(projects: list[Project]) -> list[str]:
    errors: list[str] = []
    for project in projects:
        if project.category not in PROJECT_CATEGORIES:
            errors.append(f"project {project.slug}: bad category {project.category!r}")
        if project.status not in PROJECT_STATUSES:
            errors.append(f"project {project.slug}: bad status {project.status!r}")
        if not project.tagline.strip():
            errors.append(f"project {project.slug}: empty tagline")
    return errors


def validate_posts(posts: list[Post]) -> list[str]:
    errors: list[str] = []
    for post in posts:
        if not post.title.strip():
            errors.append(f"post {post.slug}: empty title")
        if not post.description.strip():
            errors.append(f"post {post.slug}: empty description")
        if not post.body_markdown.strip():
            errors.append(f"post {post.slug}: empty body")
    return errors


def validate_internal_links(dist: Path, posts: list[Post]) -> list[str]:
    errors: list[str] = []
    allowed = set(ALLOWED_INTERNAL_PATHS_STATIC)
    for post in posts:
        allowed.add(f"/blog/{post.slug}")

    for html_path in dist.rglob("*.html"):
        text = html_path.read_text(encoding="utf-8")
        for href in HREF_RE.findall(text):
            if not INTERNAL_PATH_RE.match(href):
                continue
            target = href.split("#", 1)[0]
            target = target.split("?", 1)[0]
            if not target:
                continue
            if target.endswith("/") and target != "/":
                target = target.rstrip("/")
            if target in allowed:
                continue
            disk_candidates = [
                dist / target.lstrip("/"),
                dist / target.lstrip("/") / "index.html",
            ]
            if any(p.exists() for p in disk_candidates):
                continue
            errors.append(f"{html_path.relative_to(dist)}: dead internal link {href}")
    return errors
