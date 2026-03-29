"""Site-level metadata and machine-readable document helpers."""

from __future__ import annotations

from datetime import UTC, datetime
from email.utils import format_datetime
from typing import TYPE_CHECKING, Final
from xml.sax.saxutils import escape

from app.config import get_settings

if TYPE_CHECKING:
    from app.content.blog import BlogPost

settings = get_settings()

STATIC_PAGE_PATHS: Final[tuple[str, ...]] = (
    "/",
    "/projects",
    "/blog",
    "/about",
    "/contact",
)


def absolute_url(path: str) -> str:
    """Build an absolute site URL for a path."""
    normalized_path = path if path.startswith("/") else f"/{path}"
    return f"{settings.site_url.rstrip('/')}{normalized_path}"


def date_to_rfc2822(date_str: str) -> str:
    """Convert an ISO date string to RFC 2822 for RSS."""
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=UTC)
    return format_datetime(dt)


def date_to_iso8601(date_str: str) -> str:
    """Convert an ISO date string to a full ISO 8601 timestamp."""
    return datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=UTC).isoformat()


def build_robots_txt() -> str:
    """Build the site's robots.txt content."""
    return "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "",
            f"Sitemap: {absolute_url('/sitemap.xml')}",
            "",
        ]
    )


def build_rss_feed(posts: list[BlogPost]) -> str:
    """Build an RSS 2.0 feed for published blog posts."""
    last_build_date = (
        date_to_rfc2822(posts[0].date) if posts else format_datetime(datetime.now(UTC))
    )

    items = []
    for post in posts:
        post_url = absolute_url(f"/blog/{post.slug}")
        categories = "\n".join(f"      <category>{escape(tag)}</category>" for tag in post.tags)
        items.append(
            "\n".join(
                [
                    "    <item>",
                    f"      <title>{escape(post.title)}</title>",
                    f"      <link>{post_url}</link>",
                    f'      <guid isPermaLink="true">{post_url}</guid>',
                    f"      <pubDate>{date_to_rfc2822(post.date)}</pubDate>",
                    f"      <description>{escape(post.description)}</description>",
                    categories,
                    "    </item>",
                ]
            )
        )

    items_xml = "\n".join(items)
    atom_self_link = absolute_url("/feed.xml")
    return "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
            "  <channel>",
            f"    <title>{escape(settings.site_name)}</title>",
            f"    <link>{absolute_url('/')}</link>",
            f"    <description>{escape(settings.site_description)}</description>",
            "    <language>en-us</language>",
            (f'    <atom:link href="{atom_self_link}" rel="self" type="application/rss+xml" />'),
            f"    <lastBuildDate>{last_build_date}</lastBuildDate>",
            items_xml,
            "  </channel>",
            "</rss>",
            "",
        ]
    )


def build_sitemap(posts: list[BlogPost]) -> str:
    """Build an XML sitemap for the site's public pages."""
    static_entries = [
        "\n".join(
            [
                "  <url>",
                f"    <loc>{absolute_url(path)}</loc>",
                "  </url>",
            ]
        )
        for path in STATIC_PAGE_PATHS
    ]
    blog_entries = [
        "\n".join(
            [
                "  <url>",
                f"    <loc>{absolute_url(f'/blog/{post.slug}')}</loc>",
                f"    <lastmod>{post.date}</lastmod>",
                "  </url>",
            ]
        )
        for post in posts
    ]

    return "\n".join(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            *static_entries,
            *blog_entries,
            "</urlset>",
            "",
        ]
    )


def build_page_context(
    *,
    title: str,
    description: str,
    path: str,
    og_type: str = "website",
    article_published_time: str | None = None,
    article_tags: list[str] | None = None,
) -> dict[str, object]:
    """Build common template context for page metadata."""
    canonical_url = absolute_url(path)
    return {
        "title": title,
        "description": description,
        "canonical_url": canonical_url,
        "og_url": canonical_url,
        "og_type": og_type,
        "og_image": absolute_url("/static/og/default.png"),
        "article_published_time": article_published_time,
        "article_tags": article_tags or [],
    }
