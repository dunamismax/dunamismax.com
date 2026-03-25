"""Page routes for dunamismax.com."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.content.blog import (
    get_post_by_slug,
    get_published_posts,
    get_reading_time,
    render_markdown,
)
from app.content.projects import STATUS_LABELS, get_projects_grouped

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter()


def _format_date(date_str: str, fmt: str = "%b %d, %Y") -> str:
    """Format an ISO date string for display."""
    return datetime.strptime(date_str, "%Y-%m-%d").strftime(fmt)


def _format_date_long(date_str: str) -> str:
    """Format an ISO date string with full month name."""
    return datetime.strptime(date_str, "%Y-%m-%d").strftime("%B %d, %Y")


# Register template globals
templates.env.globals["site_name"] = "dunamismax.com"
templates.env.globals["site_url"] = "https://dunamismax.com"
templates.env.filters["format_date"] = _format_date
templates.env.filters["format_date_long"] = _format_date_long
templates.env.filters["reading_time"] = get_reading_time
templates.env.filters["render_markdown"] = render_markdown


@router.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        request,
        "home.html",
        {
            "title": "Stephen Sawyer -- dunamismax",
            "description": (
                "Building self-hostable systems software."
                " Python, Go, Rust, and the web."
                " Local-first, operator-friendly, relational data."
            ),
        },
    )


@router.get("/projects", response_class=HTMLResponse)
async def projects(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        request,
        "projects.html",
        {
            "title": "Projects -- Stephen Sawyer",
            "description": (
                "Active project roster. Self-hostable systems software"
                " in Python, Go, Rust, and the web."
            ),
            "groups": get_projects_grouped(),
            "status_labels": STATUS_LABELS,
        },
    )


@router.get("/blog", response_class=HTMLResponse)
async def blog_index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        request,
        "blog/index.html",
        {
            "title": "Blog -- Stephen Sawyer",
            "description": (
                "Technical writing on systems design, self-hosting,"
                " Go, Rust, and operational discipline."
            ),
            "posts": get_published_posts(),
        },
    )


@router.get("/blog/{slug}", response_class=HTMLResponse)
async def blog_post(request: Request, slug: str) -> HTMLResponse:
    post = get_post_by_slug(slug)
    if post is None:
        return templates.TemplateResponse(
            request,
            "404.html",
            {"title": "404 -- Not Found", "description": "Page not found."},
            status_code=404,
        )
    return templates.TemplateResponse(
        request,
        "blog/post.html",
        {
            "title": f"{post.title} -- Stephen Sawyer",
            "description": post.description,
            "post": post,
        },
    )


@router.get("/about", response_class=HTMLResponse)
async def about(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        request,
        "about.html",
        {
            "title": "About -- Stephen Sawyer",
            "description": (
                "Who I am, what I care about, and the stack philosophy behind everything I build."
            ),
        },
    )


@router.get("/contact", response_class=HTMLResponse)
async def contact(request: Request) -> HTMLResponse:
    channels = [
        {
            "label": "Email",
            "href": "mailto:dunamismax@tutamail.com",
            "display": "dunamismax@tutamail.com",
            "external": False,
        },
        {
            "label": "Signal",
            "href": (
                "https://signal.me/#eu/"
                "ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph"
            ),
            "display": "Signal",
            "external": True,
        },
        {
            "label": "GitHub",
            "href": "https://github.com/dunamismax",
            "display": "dunamismax",
            "external": True,
        },
        {
            "label": "Twitter",
            "href": "https://x.com/DunamisMax",
            "display": "@DunamisMax",
            "external": True,
        },
        {
            "label": "Reddit",
            "href": "https://www.reddit.com/user/DunamisMax/",
            "display": "u/DunamisMax",
            "external": True,
        },
    ]
    return templates.TemplateResponse(
        request,
        "contact.html",
        {
            "title": "Contact -- Stephen Sawyer",
            "description": (
                "How to reach Stephen Sawyer. Email, Signal, GitHub, Twitter, Reddit."
            ),
            "channels": channels,
        },
    )
