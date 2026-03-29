"""Page routes for dunamismax.com."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Request, Response
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
from fastapi.templating import Jinja2Templates

from app.config import get_settings
from app.content.blog import (
    get_post_by_slug,
    get_published_posts,
    get_reading_time,
    render_markdown,
)
from app.content.projects import STATUS_LABELS, get_projects_grouped
from app.site import (
    build_page_context,
    build_robots_txt,
    build_rss_feed,
    build_sitemap,
    date_to_iso8601,
)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

router = APIRouter()
settings = get_settings()


def _format_date(date_str: str, fmt: str = "%b %d, %Y") -> str:
    """Format an ISO date string for display."""
    return datetime.strptime(date_str, "%Y-%m-%d").strftime(fmt)


def _format_date_long(date_str: str) -> str:
    """Format an ISO date string with full month name."""
    return datetime.strptime(date_str, "%Y-%m-%d").strftime("%B %d, %Y")


# Register template globals
templates.env.globals["site_name"] = settings.site_name
templates.env.globals["site_url"] = settings.site_url
templates.env.filters["format_date"] = _format_date
templates.env.filters["format_date_long"] = _format_date_long
templates.env.filters["reading_time"] = get_reading_time
templates.env.filters["render_markdown"] = render_markdown


@router.get("/", response_class=HTMLResponse)
async def home(request: Request) -> HTMLResponse:
    context = build_page_context(
        title="Stephen Sawyer -- dunamismax",
        description=(
            "Building self-hostable systems software."
            " Python, Go, Rust, and the web."
            " Local-first, operator-friendly, relational data."
        ),
        path="/",
    )
    return templates.TemplateResponse(request, "home.html", context)


@router.get("/projects", response_class=HTMLResponse)
async def projects(request: Request) -> HTMLResponse:
    context = build_page_context(
        title="Projects -- Stephen Sawyer",
        description=(
            "Active project roster. Self-hostable systems software"
            " in Python, Go, Rust, and the web."
        ),
        path="/projects",
    )
    context.update(
        {
            "groups": get_projects_grouped(),
            "status_labels": STATUS_LABELS,
        }
    )
    return templates.TemplateResponse(request, "projects.html", context)


@router.get("/blog", response_class=HTMLResponse)
async def blog_index(request: Request) -> HTMLResponse:
    context = build_page_context(
        title="Blog -- Stephen Sawyer",
        description=(
            "Technical writing on systems design, self-hosting,"
            " Go, Rust, and operational discipline."
        ),
        path="/blog",
    )
    context["posts"] = get_published_posts()
    return templates.TemplateResponse(request, "blog/index.html", context)


@router.get("/blog/{slug}", response_class=HTMLResponse)
async def blog_post(request: Request, slug: str) -> HTMLResponse:
    post = get_post_by_slug(slug)
    if post is None:
        return templates.TemplateResponse(
            request,
            "404.html",
            build_page_context(
                title="404 -- Not Found",
                description="Page not found.",
                path=request.url.path,
            ),
            status_code=404,
        )

    context = build_page_context(
        title=f"{post.title} -- Stephen Sawyer",
        description=post.description,
        path=f"/blog/{post.slug}",
        og_type="article",
        article_published_time=date_to_iso8601(post.date),
        article_tags=post.tags,
    )
    context["post"] = post
    return templates.TemplateResponse(request, "blog/post.html", context)


@router.get("/about", response_class=HTMLResponse)
async def about(request: Request) -> HTMLResponse:
    context = build_page_context(
        title="About -- Stephen Sawyer",
        description="Who I am, what I care about, and how I build durable software.",
        path="/about",
    )
    return templates.TemplateResponse(request, "about.html", context)


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
    context = build_page_context(
        title="Contact -- Stephen Sawyer",
        description="How to reach Stephen Sawyer. Email, Signal, GitHub, Twitter, Reddit.",
        path="/contact",
    )
    context["channels"] = channels
    return templates.TemplateResponse(request, "contact.html", context)


@router.get("/feed.xml")
async def rss_feed() -> Response:
    return Response(build_rss_feed(get_published_posts()), media_type="application/rss+xml")


@router.get("/sitemap.xml")
async def sitemap() -> Response:
    return Response(build_sitemap(get_published_posts()), media_type="application/xml")


@router.get("/robots.txt")
async def robots_txt() -> PlainTextResponse:
    return PlainTextResponse(build_robots_txt())


@router.get("/health")
async def healthcheck() -> JSONResponse:
    return JSONResponse({"status": "ok"}, headers={"Cache-Control": "no-store"})
