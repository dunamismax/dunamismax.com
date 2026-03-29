"""Launch-readiness tests for machine-readable surfaces and metadata."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_feed_returns_rss() -> None:
    response = client.get("/feed.xml")

    assert response.status_code == 200
    assert "application/rss+xml" in response.headers["content-type"]
    assert "<rss" in response.text
    assert "<title>Building this site</title>" in response.text
    assert "https://dunamismax.com/blog/hello-world" in response.text
    assert "<category>self-hosting</category>" in response.text


def test_sitemap_lists_public_pages() -> None:
    response = client.get("/sitemap.xml")

    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    assert "https://dunamismax.com/" in response.text
    assert "https://dunamismax.com/projects" in response.text
    assert "https://dunamismax.com/blog/hello-world" in response.text
    assert "<lastmod>2026-03-23</lastmod>" in response.text


def test_robots_points_to_sitemap() -> None:
    response = client.get("/robots.txt")

    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "User-agent: *" in response.text
    assert "Sitemap: https://dunamismax.com/sitemap.xml" in response.text


def test_healthcheck_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["cache-control"] == "no-store"


def test_home_uses_production_canonical_metadata() -> None:
    response = client.get("/")

    assert '<link rel="canonical" href="https://dunamismax.com/">' in response.text
    assert '<meta property="og:url" content="https://dunamismax.com/">' in response.text
    assert 'href="https://dunamismax.com/feed.xml"' in response.text
    assert "unpkg.com/htmx.org" not in response.text


def test_blog_post_has_article_metadata() -> None:
    response = client.get("/blog/hello-world")

    assert '<meta property="og:type" content="article">' in response.text
    assert 'content="2026-03-23T00:00:00+00:00"' in response.text
    assert '<meta property="article:tag" content="self-hosting">' in response.text
    assert '<meta property="article:tag" content="meta">' in response.text
