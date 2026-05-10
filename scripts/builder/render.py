"""HTML rendering for the static site.

Templates are plain Python functions that build HTML by string composition.
There is no template language, no inheritance machinery, and no runtime
escape pipeline beyond ``html.escape`` applied at the boundary where data
becomes markup.
"""

from __future__ import annotations

import datetime as dt
import html
from dataclasses import dataclass
from typing import Iterable

from .content import Post, Project, PROJECT_CATEGORIES


SITE_TITLE = "Stephen Sawyer · dunamismax"
SITE_DEFAULT_DESCRIPTION = (
    "Stephen Sawyer is a systems-leaning engineer working in C, Zig, Python, "
    "and vanilla TypeScript — open source advocate and privacy/security-minded "
    "builder with 15 years in IT."
)
SITE_OG_DESCRIPTION = (
    "Systems work in C and Zig, Python where it fits, vanilla web on top. "
    "Open source, self-hosting, privacy, and security."
)
SITE_HOST = "dunamismax.com"


@dataclass(frozen=True)
class PageMeta:
    path: str
    title: str
    description: str
    section: str = ""


PROJECT_STATUS_LABELS: dict[str, str] = {
    "active": "Active",
    "shipped": "Shipped",
    "phase-0": "Phase 0",
    "legacy": "Legacy",
}

PROJECT_CATEGORY_LABELS: dict[str, str] = {
    "apps": "Applications",
    "infrastructure": "Infrastructure",
    "developer-tools": "Developer tools",
    "reference": "Reference",
}

PROJECT_CATEGORY_DESCRIPTIONS: dict[str, str] = {
    "apps": "Products and services with clear data models and owned infrastructure.",
    "infrastructure": "Self-hosted services, networking, and operations work.",
    "developer-tools": "Tooling, automation, and operator-facing utilities.",
    "reference": "Profile, site, and source repos that explain the operating surface.",
}


def esc(value: object) -> str:
    return html.escape("" if value is None else str(value), quote=True)


def reading_time(text: str) -> str:
    words = sum(1 for _ in _word_iter(text))
    minutes = max(1, -(-words // 220))
    return f"{minutes} min read"


def _word_iter(text: str) -> Iterable[str]:
    word: list[str] = []
    for char in text:
        if char.isalnum() or char == "_":
            word.append(char)
        elif word:
            yield "".join(word)
            word = []
    if word:
        yield "".join(word)


def format_published(date: dt.date, *, long: bool = False) -> str:
    fmt = "%B %-d, %Y" if long else "%b %-d, %Y"
    return date.strftime(fmt)


def render_layout(
    *,
    page: PageMeta,
    body: str,
    head_extra: str = "",
    og_type: str = "website",
) -> str:
    title = esc(page.title)
    description = esc(page.description)
    og_description = description if page.description != SITE_DEFAULT_DESCRIPTION else esc(SITE_OG_DESCRIPTION)
    canonical = f"https://{SITE_HOST}{page.path}"
    return (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '  <head>\n'
        '    <meta charset="utf-8">\n'
        f'    <title>{title}</title>\n'
        '    <meta name="viewport" content="width=device-width,initial-scale=1">\n'
        f'    <meta name="description" content="{description}">\n'
        '    <meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)">\n'
        '    <meta name="theme-color" content="#f5f1e8" media="(prefers-color-scheme: light)">\n'
        '    <meta name="apple-mobile-web-app-capable" content="yes">\n'
        '    <meta name="application-name" content="dunamismax">\n'
        f'    <link rel="canonical" href="{esc(canonical)}">\n'
        '    <meta property="og:site_name" content="dunamismax">\n'
        f'    <meta property="og:type" content="{esc(og_type)}">\n'
        f'    <meta property="og:title" content="{title}">\n'
        f'    <meta property="og:description" content="{og_description}">\n'
        f'    <meta property="og:url" content="{esc(canonical)}">\n'
        '    <meta name="twitter:card" content="summary">\n'
        f'    <meta name="twitter:title" content="{title}">\n'
        f'    <meta name="twitter:description" content="{og_description}">\n'
        '    <link rel="icon" href="/icon.svg" type="image/svg+xml">\n'
        '    <link rel="manifest" href="/manifest.webmanifest">\n'
        '    <link rel="alternate" type="application/rss+xml" title="dunamismax · Blog" href="/feed.xml">\n'
        '    <link rel="stylesheet" href="/styles/site.css">\n'
        f'{head_extra}'
        '    <script>\n'
        '      (() => {\n'
        '        try {\n'
        '          var stored = localStorage.getItem("dunamismax-theme");\n'
        '          var theme = stored === "light" || stored === "dark" ? stored : "dark";\n'
        '          document.documentElement.dataset.theme = theme;\n'
        '          document.documentElement.style.colorScheme = theme;\n'
        '        } catch (_) {\n'
        '          document.documentElement.dataset.theme = "dark";\n'
        '          document.documentElement.style.colorScheme = "dark";\n'
        '        }\n'
        '      })();\n'
        '    </script>\n'
        '    <script type="module" src="/scripts/main.js" defer></script>\n'
        '  </head>\n'
        '  <body class="antialiased">\n'
        '    <a href="#main-content" class="skip-link">Skip to content</a>\n'
        f'{render_header(page)}'
        '    <main id="main-content">\n'
        f'{body}'
        '    </main>\n'
        f'{render_footer()}'
        '  </body>\n'
        '</html>\n'
    )


def _nav_link(label: str, href: str, current_section: str, section: str) -> str:
    cls = ' class="is-current"' if current_section == section else ""
    return f'<a href="{esc(href)}"{cls}>{esc(label)}</a>'


def render_header(page: PageMeta) -> str:
    section = page.section
    desktop = "\n        ".join(
        [
            _nav_link("Projects", "/projects", section, "projects"),
            _nav_link("Blog", "/blog", section, "blog"),
            _nav_link("About", "/about", section, "about"),
            _nav_link("Contact", "/contact", section, "contact"),
        ]
    )
    mobile = "\n        ".join(
        [
            _nav_link("Projects", "/projects", section, "projects"),
            _nav_link("Blog", "/blog", section, "blog"),
            _nav_link("About", "/about", section, "about"),
            _nav_link("Contact", "/contact", section, "contact"),
        ]
    )
    return (
        '    <header class="site-header">\n'
        '      <nav class="primary-nav" aria-label="Primary navigation">\n'
        '        <a href="/" class="brand-link" aria-label="dunamismax home">\n'
        '          <span class="brand-mark" aria-hidden="true">DM</span>\n'
        '          <span class="brand-word">dunamismax</span>\n'
        '        </a>\n'
        '        <div class="desktop-nav">\n'
        f'        {desktop}\n'
        '        </div>\n'
        '        <div class="nav-actions">\n'
        '          <button type="button" class="theme-toggle" aria-pressed="true" aria-label="Switch to light mode">\n'
        '            <span class="theme-toggle__track" aria-hidden="true">\n'
        '              <span class="theme-toggle__thumb"></span>\n'
        '            </span>\n'
        '            <span data-theme-target="label">Dark</span>\n'
        '          </button>\n'
        '        </div>\n'
        '      </nav>\n'
        '      <nav class="mobile-nav" aria-label="Section navigation">\n'
        f'        {mobile}\n'
        '      </nav>\n'
        '    </header>\n'
    )


def render_footer() -> str:
    year = dt.date.today().year
    return (
        '    <footer class="site-footer">\n'
        '      <div class="footer-inner">\n'
        '        <div class="footer-brand-block">\n'
        '          <a href="/" class="footer-brand-link">\n'
        '            <span class="brand-mark brand-mark--footer" aria-hidden="true">DM</span>\n'
        '            <span>dunamismax</span>\n'
        '          </a>\n'
        '          <p class="footer-copy">\n'
        '            Stephen Sawyer. Systems-leaning engineer working in C, Zig, Python,\n'
        '            and vanilla TypeScript. Open source, privacy, and security advocate.\n'
        '          </p>\n'
        '        </div>\n'
        '        <nav class="footer-columns" aria-label="Footer">\n'
        '          <div class="footer-column">\n'
        '            <p class="footer-column__title">Site</p>\n'
        '            <a href="/">Home</a>\n'
        '            <a href="/projects">Projects</a>\n'
        '            <a href="/blog">Blog</a>\n'
        '            <a href="/about">About</a>\n'
        '            <a href="/contact">Contact</a>\n'
        '          </div>\n'
        '          <div class="footer-column">\n'
        '            <p class="footer-column__title">Code</p>\n'
        '            <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a>\n'
        '            <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>\n'
        '            <a href="https://github.com/dunamismax/dunamismax.com" rel="noopener noreferrer me" target="_blank">Site source</a>\n'
        '            <a href="/feed.xml">RSS feed</a>\n'
        '          </div>\n'
        '          <div class="footer-column">\n'
        '            <p class="footer-column__title">Elsewhere</p>\n'
        '            <a href="mailto:dunamismax@tutamail.com" rel="me">Email</a>\n'
        '            <a href="https://www.reddit.com/user/DunamisMax/" rel="noopener noreferrer me" target="_blank">Reddit</a>\n'
        '          </div>\n'
        '        </nav>\n'
        '      </div>\n'
        '      <div class="footer-meta">\n'
        '        <div class="footer-meta__inner">\n'
        f'          <p>&copy; {year} Stephen Sawyer.</p>\n'
        '          <p class="footer-meta__claim">Vanilla HTML, CSS, and TypeScript · Served behind Caddy</p>\n'
        '        </div>\n'
        '      </div>\n'
        '    </footer>\n'
    )


def render_project_card(project: Project) -> str:
    status_label = PROJECT_STATUS_LABELS.get(project.status, project.status.title())
    chips = "".join(
        f'<span class="stack-chip">{esc(tech)}</span>' for tech in project.stack
    )
    links: list[str] = []
    if project.url:
        links.append(
            f'<a href="{esc(project.url)}" rel="noopener noreferrer" target="_blank">live ↗</a>'
        )
    if project.public_repo:
        links.append(
            f'<a href="{esc(project.repo)}" rel="noopener noreferrer" target="_blank">repo ↗</a>'
        )
    return (
        '<article class="project-card">\n'
        '  <div class="project-card__head">\n'
        f'    <h3 class="project-card__name">{esc(project.name)}</h3>\n'
        f'    <span class="project-status project-status--{esc(project.status)}">{esc(status_label)}</span>\n'
        '  </div>\n'
        f'  <p class="project-card__tagline">{esc(project.tagline)}</p>\n'
        '  <div class="project-card__foot">\n'
        f'    <div class="project-card__stack">{chips}</div>\n'
        f'    <div class="project-card__links">{"".join(links)}</div>\n'
        '  </div>\n'
        '</article>\n'
    )


def render_home(*, featured: list[Project], latest: Post | None) -> str:
    cards = "".join(
        f'<li>\n{render_project_card(p)}</li>\n' for p in featured
    )
    latest_block = ""
    if latest is not None:
        latest_block = (
            f'<a href="/blog/{esc(latest.slug)}" class="latest-card">\n'
            '  <span class="latest-card__kicker">Latest post</span>\n'
            f'  <span class="latest-card__title">{esc(latest.title)}</span>\n'
            f'  <span class="latest-card__meta">{esc(format_published(latest.published_on))} · {esc(reading_time(latest.body_markdown))}</span>\n'
            f'  <span class="latest-card__description">{esc(latest.description)}</span>\n'
            '</a>\n'
        )
    return (
        '<section class="hero-section">\n'
        '  <div class="hero-background" aria-hidden="true"></div>\n'
        '  <div class="section-inner hero-grid">\n'
        '    <div class="hero-copy">\n'
        '      <p class="eyebrow">C · Zig · Python · vanilla web</p>\n'
        '      <h1>Software you can read at 2 AM.</h1>\n'
        '      <p class="lede">\n'
        '        Systems-leaning engineer. Open source, privacy, and security advocate.\n'
        '        Fifteen years in IT, building software that has to keep working after\n'
        '        the demo is over.\n'
        '      </p>\n'
        '      <p class="lede">\n'
        '        <strong>Small languages, no frameworks.</strong>\n'
        '        C and Zig for systems work, Python for scripts and backends, vanilla\n'
        '        HTML, CSS, and TypeScript for the web. Explicit ownership, explicit\n'
        '        data, explicit failure modes.\n'
        '      </p>\n'
        '      <div class="hero-actions">\n'
        '        <a href="/projects" class="button button-primary">See projects</a>\n'
        '        <a href="/contact" class="button button-secondary">Get in touch</a>\n'
        '      </div>\n'
        '      <div class="stack-row" aria-label="Primary stack">\n'
        '        <span class="stack-chip stack-chip--strong">C</span>\n'
        '        <span class="stack-chip stack-chip--strong">Zig</span>\n'
        '        <span class="stack-chip">Python</span>\n'
        '        <span class="stack-chip">TypeScript</span>\n'
        '        <span class="stack-chip">HTML</span>\n'
        '        <span class="stack-chip">CSS</span>\n'
        '        <span class="stack-chip">Caddy</span>\n'
        '      </div>\n'
        '      <p class="fine-print">\n'
        '        Code lives on\n'
        '        <a href="https://github.com/dunamismax" rel="noopener noreferrer me" target="_blank">GitHub</a>\n'
        '        and mirrors to\n'
        '        <a href="https://codeberg.org/dunamismax" rel="noopener noreferrer me" target="_blank">Codeberg</a>.\n'
        '      </p>\n'
        '    </div>\n'
        '    <div>\n'
        f'      {latest_block}\n'
        '      <nav class="nav-card-grid" aria-label="Quick navigation">\n'
        '        <a href="/projects" class="nav-card">\n'
        '          <span class="nav-card__title">Projects</span>\n'
        '          <span class="nav-card__detail">Systems work in C and Zig, plus the smaller tools that earn their place.</span>\n'
        '        </a>\n'
        '        <a href="/blog" class="nav-card">\n'
        '          <span class="nav-card__title">Blog</span>\n'
        '          <span class="nav-card__detail">Build logs, design notes, and practical decisions from real systems.</span>\n'
        '        </a>\n'
        '        <a href="/about" class="nav-card">\n'
        '          <span class="nav-card__title">About</span>\n'
        '          <span class="nav-card__detail">Small-language, no-framework, privacy-minded engineering.</span>\n'
        '        </a>\n'
        '        <a href="/contact" class="nav-card">\n'
        '          <span class="nav-card__title">Contact</span>\n'
        '          <span class="nav-card__detail">Email, Signal, GitHub, Codeberg, and site source.</span>\n'
        '        </a>\n'
        '      </nav>\n'
        '    </div>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="signal-bar">\n'
        '  <div class="section-inner signal-grid">\n'
        '    <p><span></span>C and Zig first</p>\n'
        '    <p><span></span>Python for backends and scripts</p>\n'
        '    <p><span></span>Vanilla web, no frameworks</p>\n'
        '    <p><span></span>15 years in IT</p>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="page-section">\n'
        '  <div class="section-inner">\n'
        '    <div class="section-heading">\n'
        '      <p class="eyebrow">Featured projects</p>\n'
        '      <h2>Systems work with real operating shape.</h2>\n'
        '      <p>\n'
        '        A short list of current and representative work, led by the C and Zig\n'
        '        systems project that defines how everything else gets built.\n'
        '      </p>\n'
        '    </div>\n'
        f'    <ul class="post-list">\n{cards}</ul>\n'
        '    <p class="section-foot">\n'
        '      <a href="/projects" class="section-link">See every project</a>\n'
        '    </p>\n'
        '  </div>\n'
        '</section>\n'
    )


def render_about(body_html: str) -> str:
    return (
        '<section class="page-hero">\n'
        '  <div class="section-inner">\n'
        '    <p class="eyebrow">About</p>\n'
        '    <h1>Small languages. No frameworks.</h1>\n'
        '    <p class="lede">\n'
        "      I'm Stephen Sawyer, a systems-leaning engineer and an open source,\n"
        '      privacy, and security advocate. I have spent 15 years in IT building,\n'
        '      operating, fixing, and explaining systems that need to survive real\n'
        '      users.\n'
        '    </p>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="page-section">\n'
        '  <div class="section-inner">\n'
        f'    <div class="prose">\n{body_html}\n    </div>\n'
        '  </div>\n'
        '</section>\n'
    )


CONTACTS: list[dict[str, str | bool]] = [
    {
        "title": "Email",
        "value": "dunamismax@tutamail.com",
        "href": "mailto:dunamismax@tutamail.com",
        "external": False,
        "detail": "Best first stop. Project questions, work, or anything that does not need to be public.",
    },
    {
        "title": "Signal",
        "value": "Signal",
        "href": "https://signal.me/#eu/ohSycFRzUEPZzCEifM1UVelp9pdBfmOPoSHItfUsK1PqosRCQSBBEIsqRq2krmph",
        "external": True,
        "detail": "For direct, end-to-end-encrypted outreach when email is not the right shape.",
    },
    {
        "title": "GitHub",
        "value": "github.com/dunamismax",
        "href": "https://github.com/dunamismax",
        "external": True,
        "detail": "Public discussion around code, issues, and pull requests across the projects on this site.",
    },
    {
        "title": "Codeberg",
        "value": "codeberg.org/dunamismax",
        "href": "https://codeberg.org/dunamismax",
        "external": True,
        "detail": "Mirrored public source and a better home for open, inspectable code.",
    },
    {
        "title": "Reddit",
        "value": "u/DunamisMax",
        "href": "https://www.reddit.com/user/DunamisMax/",
        "external": True,
        "detail": "Where I talk about MTG and self-hosting more than anything else.",
    },
    {
        "title": "Site source",
        "value": "github.com/dunamismax/dunamismax.com",
        "href": "https://github.com/dunamismax/dunamismax.com",
        "external": True,
        "detail": "Source for this site is open. Issues and PRs welcome.",
    },
]


def render_contact() -> str:
    cards = []
    for contact in CONTACTS:
        rel_attr = ' rel="noopener noreferrer me"' if contact["external"] else ' rel="me"'
        target_attr = ' target="_blank"' if contact["external"] else ""
        cards.append(
            '<article class="contact-card">\n'
            f'  <p class="contact-card__title">{esc(contact["title"])}</p>\n'
            f'  <a class="contact-card__value" href="{esc(contact["href"])}"{rel_attr}{target_attr}>{esc(contact["value"])}</a>\n'
            f'  <p class="contact-card__detail">{esc(contact["detail"])}</p>\n'
            '</article>\n'
        )
    return (
        '<section class="page-hero">\n'
        '  <div class="section-inner">\n'
        '    <p class="eyebrow">Contact</p>\n'
        '    <h1>Get in touch.</h1>\n'
        '    <p class="lede">\n'
        '      Email is the best place to start. Signal works well for direct outreach,\n'
        '      and GitHub or Codeberg are the right places for public discussion around\n'
        '      code.\n'
        '    </p>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="page-section">\n'
        '  <div class="section-inner">\n'
        f'    <div class="contact-grid">\n{"".join(cards)}    </div>\n'
        '  </div>\n'
        '</section>\n'
    )


def render_projects_index(projects_by_cat: dict[str, list[Project]]) -> str:
    groups = []
    for category in PROJECT_CATEGORIES:
        items = projects_by_cat.get(category, [])
        if not items:
            continue
        cards = "".join(f'<li>\n{render_project_card(p)}</li>\n' for p in items)
        description = PROJECT_CATEGORY_DESCRIPTIONS.get(category, "")
        description_html = f'    <p>{esc(description)}</p>\n' if description else ""
        groups.append(
            '<section class="project-group">\n'
            '  <header class="project-group__heading">\n'
            f'    <h2>{esc(PROJECT_CATEGORY_LABELS.get(category, category.title()))}</h2>\n'
            f'{description_html}'
            '  </header>\n'
            f'  <ul class="post-list">\n{cards}</ul>\n'
            '</section>\n'
        )
    return (
        '<section class="page-hero">\n'
        '  <div class="section-inner">\n'
        '    <p class="eyebrow">Projects</p>\n'
        '    <h1>Selected systems work.</h1>\n'
        '    <p class="lede">\n'
        '      A focused catalog of current and representative work: systems software\n'
        '      in C and Zig, small Python tools, and the vanilla web that ties them\n'
        '      together.\n'
        '    </p>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="page-section">\n'
        '  <div class="section-inner">\n'
        f'    {"".join(groups)}\n'
        '  </div>\n'
        '</section>\n'
    )


def render_blog_index(posts: list[Post]) -> str:
    if not posts:
        body_inner = '<p class="prose">No posts yet.</p>\n'
    else:
        items = []
        for post in posts:
            items.append(
                '<li>\n'
                f'  <a href="/blog/{esc(post.slug)}" class="post-card">\n'
                f'    <span class="post-card__meta">{esc(format_published(post.published_on))} · {esc(reading_time(post.body_markdown))}</span>\n'
                f'    <span class="post-card__title">{esc(post.title)}</span>\n'
                f'    <span class="post-card__description">{esc(post.description)}</span>\n'
                '  </a>\n'
                '</li>\n'
            )
        body_inner = f'<ul class="post-list">\n{"".join(items)}</ul>\n'
    return (
        '<section class="page-hero">\n'
        '  <div class="section-inner">\n'
        '    <p class="eyebrow">Blog</p>\n'
        '    <h1>Notes from shipping software.</h1>\n'
        '    <p class="lede">\n'
        '      Build logs, design notes, and stack reasoning from a small-language,\n'
        '      no-framework default: systems work in C and Zig, Python where it fits,\n'
        '      and vanilla web on top.\n'
        '    </p>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="page-section">\n'
        '  <div class="section-inner">\n'
        f'    {body_inner}'
        '  </div>\n'
        '</section>\n'
    )


def render_post(post: Post) -> str:
    tags_block = ""
    if post.tags:
        tag_chips = "".join(
            f'<span class="stack-chip">#{esc(tag)}</span>' for tag in post.tags
        )
        tags_block = f'<div class="post-tags">{tag_chips}</div>\n'
    return (
        '<section class="page-hero">\n'
        '  <div class="section-inner">\n'
        '    <article class="post-detail">\n'
        '      <p class="eyebrow">Blog</p>\n'
        f'      <h1>{esc(post.title)}</h1>\n'
        f'      <p class="lede">{esc(post.description)}</p>\n'
        '      <p class="post-detail__meta">\n'
        f'        <span>{esc(format_published(post.published_on, long=True))}</span>\n'
        f'        <span>{esc(reading_time(post.body_markdown))}</span>\n'
        '      </p>\n'
        f'      {tags_block}'
        '    </article>\n'
        '  </div>\n'
        '</section>\n'
        '<section class="page-section">\n'
        '  <div class="section-inner">\n'
        '    <article class="post-detail">\n'
        f'      <div class="post-body">\n{post.body_html}\n      </div>\n'
        '      <p class="section-foot">\n'
        '        <a href="/blog" class="section-link">Back to all posts</a>\n'
        '      </p>\n'
        '    </article>\n'
        '  </div>\n'
        '</section>\n'
    )


def render_404() -> str:
    return (
        '<section class="page-hero">\n'
        '  <div class="section-inner">\n'
        '    <p class="eyebrow">404</p>\n'
        '    <h1>That page is not here.</h1>\n'
        '    <p class="lede">\n'
        '      The address may have moved, or never existed. Try the home page,\n'
        '      the project list, or the blog.\n'
        '    </p>\n'
        '    <div class="hero-actions hero-actions--inline">\n'
        '      <a href="/" class="button button-primary">Home</a>\n'
        '      <a href="/projects" class="button button-secondary">Projects</a>\n'
        '      <a href="/blog" class="button button-secondary">Blog</a>\n'
        '    </div>\n'
        '  </div>\n'
        '</section>\n'
    )
