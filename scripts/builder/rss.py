"""RSS 2.0 feed generation."""

from __future__ import annotations

from email.utils import format_datetime
from xml.sax.saxutils import escape as xml_escape

from .content import Post
from .render import SITE_HOST


CHANNEL_TITLE = "dunamismax · Blog"
CHANNEL_DESCRIPTION = (
    "Notes on building, shipping, and self-hosting software in C, Zig, "
    "PostgreSQL, Python, and vanilla TypeScript."
)


def _xe(text: str) -> str:
    return xml_escape(text, {'"': "&quot;", "'": "&apos;"})


def _rfc822(date) -> str:
    import datetime as dt

    moment = dt.datetime.combine(date, dt.time(12, 0, tzinfo=dt.timezone.utc))
    return format_datetime(moment)


def render_feed(posts: list[Post]) -> str:
    base = f"https://{SITE_HOST}"
    self_url = f"{base}/feed.xml"
    last_build = _rfc822(posts[0].published_on) if posts else _rfc822(__import__("datetime").date.today())
    items = []
    for post in posts:
        link = f"{base}/blog/{post.slug}"
        items.append(
            "    <item>\n"
            f"      <title>{_xe(post.title)}</title>\n"
            f"      <link>{_xe(link)}</link>\n"
            f'      <guid isPermaLink="true">{_xe(link)}</guid>\n'
            f"      <pubDate>{_xe(_rfc822(post.published_on))}</pubDate>\n"
            f"      <description>{_xe(post.description)}</description>\n"
            "    </item>\n"
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        f"    <title>{_xe(CHANNEL_TITLE)}</title>\n"
        f"    <description>{_xe(CHANNEL_DESCRIPTION)}</description>\n"
        f"    <link>{_xe(base)}</link>\n"
        "    <language>en</language>\n"
        f"    <lastBuildDate>{_xe(last_build)}</lastBuildDate>\n"
        f'    <atom:link href="{_xe(self_url)}" rel="self" type="application/rss+xml"/>\n'
        f"{''.join(items)}"
        "  </channel>\n"
        "</rss>\n"
    )
