"""Tests for content data modules."""

from __future__ import annotations

from app.content.blog import get_post_by_slug, get_published_posts, get_reading_time
from app.content.projects import (
    CATEGORY_LABELS,
    CATEGORY_ORDER,
    PROJECTS,
    get_projects_grouped,
)


class TestProjects:
    def test_has_projects(self) -> None:
        assert len(PROJECTS) > 0

    def test_every_project_has_required_fields(self) -> None:
        for p in PROJECTS:
            assert p.name
            assert p.tagline
            assert p.category
            assert p.status
            assert p.repo.startswith("https://github.com/")
            assert len(p.stack) > 0

    def test_every_category_has_label(self) -> None:
        for cat in CATEGORY_ORDER:
            assert cat in CATEGORY_LABELS

    def test_grouped_projects_not_empty(self) -> None:
        groups = get_projects_grouped()
        assert len(groups) > 0
        for group in groups:
            assert group.label
            assert len(group.projects) > 0


class TestBlog:
    def test_has_published_posts(self) -> None:
        assert len(get_published_posts()) > 0

    def test_get_post_by_slug(self) -> None:
        post = get_post_by_slug("hello-world")
        assert post is not None
        assert post.title == "Building this site"

    def test_unknown_slug_returns_none(self) -> None:
        assert get_post_by_slug("nonexistent") is None


class TestReadingTime:
    def test_short_content(self) -> None:
        assert get_reading_time("Hello world") == "1 min read"

    def test_longer_content(self) -> None:
        long_text = "word " * 460
        assert get_reading_time(long_text) == "2 min read"
