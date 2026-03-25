"""Smoke tests for every route."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


@pytest.mark.parametrize(
    "path",
    [
        "/",
        "/projects",
        "/blog",
        "/blog/hello-world",
        "/about",
        "/contact",
    ],
)
def test_page_returns_200(path: str) -> None:
    response = client.get(path)
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_blog_post_not_found() -> None:
    response = client.get("/blog/nonexistent-slug")
    assert response.status_code == 404


def test_home_has_title() -> None:
    response = client.get("/")
    assert "Stephen Sawyer" in response.text


def test_projects_has_content() -> None:
    response = client.get("/projects")
    assert "Scrybase" in response.text
    assert "bore" in response.text


def test_blog_index_has_post() -> None:
    response = client.get("/blog")
    assert "Building this site" in response.text


def test_blog_post_has_content() -> None:
    response = client.get("/blog/hello-world")
    assert "Building this site" in response.text
    assert "min read" in response.text


def test_about_has_content() -> None:
    response = client.get("/about")
    assert "Stephen Sawyer" in response.text


def test_contact_has_channels() -> None:
    response = client.get("/contact")
    assert "dunamismax@tutamail.com" in response.text
    assert "Signal" in response.text
