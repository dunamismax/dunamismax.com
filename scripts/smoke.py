"""Cheap local smoke check for launch-critical site surfaces."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

HTML_PATHS = ["/", "/projects", "/blog", "/blog/hello-world", "/about", "/contact"]
TEXT_PATHS = ["/feed.xml", "/sitemap.xml", "/robots.txt"]


def _check_ok(path: str) -> None:
    response = client.get(path)
    assert response.status_code == 200, f"{path} returned {response.status_code}"


def main() -> None:
    for path in HTML_PATHS + TEXT_PATHS + ["/health"]:
        _check_ok(path)

    home = client.get("/")
    assert "Stephen Sawyer" in home.text
    assert "https://dunamismax.com/feed.xml" in home.text

    feed = client.get("/feed.xml")
    assert "https://dunamismax.com/blog/hello-world" in feed.text

    sitemap = client.get("/sitemap.xml")
    assert "https://dunamismax.com/projects" in sitemap.text

    health = client.get("/health")
    assert health.json() == {"status": "ok"}

    print("Smoke OK:")
    for path in HTML_PATHS + TEXT_PATHS + ["/health"]:
        print(f"- {path}")


if __name__ == "__main__":
    main()
