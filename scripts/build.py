#!/usr/bin/env python3
"""Build dunamismax.com.

Subcommands:
  build   produce dist/ from content/, src/ts/, public/, static CSS
  serve   run a no-cache localhost server with a watch-rebuild loop
  check   validate content, run tsc --noEmit, walk internal links
  clean   remove dist/

The script targets Python 3.11+ and depends on a single optional package,
``markdown``, for blog post bodies. Everything else is stdlib.
"""

from __future__ import annotations

import argparse
import http.server
import os
import shutil
import socketserver
import subprocess
import sys
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

sys.path.insert(0, str(ROOT / "scripts"))

from builder.content import (  # noqa: E402
    Post,
    featured_projects,
    load_page_markdown,
    load_posts,
    load_projects,
    projects_by_category,
    published_posts,
)
from builder import check as check_mod  # noqa: E402
from builder.render import (  # noqa: E402
    PageMeta,
    SITE_DEFAULT_DESCRIPTION,
    SITE_TITLE,
    render_404,
    render_about,
    render_blog_index,
    render_contact,
    render_home,
    render_layout,
    render_post,
    render_projects_index,
)
from builder.rss import render_feed  # noqa: E402


def _import_markdown():
    try:
        import markdown  # type: ignore
    except ImportError as exc:
        raise SystemExit(
            "missing dependency 'markdown'. Install with: pip install --user markdown"
        ) from exc
    return markdown


def _make_md_renderer():
    markdown = _import_markdown()
    md = markdown.Markdown(
        extensions=["extra", "sane_lists", "smarty"],
        output_format="html5",
    )

    def render(text: str) -> str:
        md.reset()
        return md.convert(text)

    return render


def _write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def _copy(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def _compile_typescript() -> None:
    cmd = ["tsc", "-p", str(ROOT / "tsconfig.json")]
    try:
        subprocess.run(cmd, check=True, cwd=ROOT)
    except FileNotFoundError as exc:
        raise SystemExit(
            "tsc not found on PATH. Install with: npm install -g typescript"
        ) from exc


def _typescript_check() -> None:
    cmd = ["tsc", "-p", str(ROOT / "tsconfig.json"), "--noEmit"]
    subprocess.run(cmd, check=True, cwd=ROOT)


def _write_robots(out: Path) -> None:
    out.write_text("User-agent: *\nAllow: /\n", encoding="utf-8")


def _write_manifest(out: Path) -> None:
    out.write_text(
        '{\n'
        '  "name": "dunamismax",\n'
        '  "short_name": "dunamismax",\n'
        '  "icons": [\n'
        '    { "src": "/icon.svg", "type": "image/svg+xml", "sizes": "512x512" },\n'
        '    { "src": "/icon.svg", "type": "image/svg+xml", "sizes": "512x512", "purpose": "maskable" }\n'
        '  ],\n'
        '  "start_url": "/",\n'
        '  "display": "standalone",\n'
        '  "scope": "/",\n'
        '  "description": "Engineering work by Stephen Sawyer in Rust, Python, PostgreSQL, and vanilla TypeScript.",\n'
        '  "theme_color": "#0a0a0b",\n'
        '  "background_color": "#0a0a0b"\n'
        '}\n',
        encoding="utf-8",
    )


def _copy_static_assets() -> None:
    static_dir = ROOT / "static"
    if static_dir.is_dir():
        for path in static_dir.rglob("*"):
            if path.is_file():
                _copy(path, DIST / path.relative_to(static_dir))


def _copy_styles() -> None:
    src = ROOT / "src" / "styles" / "site.css"
    if not src.exists():
        raise SystemExit(f"missing stylesheet at {src}")
    _copy(src, DIST / "styles" / "site.css")


def cmd_clean(_args) -> int:
    if DIST.exists():
        shutil.rmtree(DIST)
        print(f"removed {DIST.relative_to(ROOT)}/")
    else:
        print("nothing to clean")
    return 0


def _build(*, run_tsc: bool = True) -> tuple[list, list]:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    render_md = _make_md_renderer()

    projects = load_projects(ROOT)
    posts = load_posts(ROOT, render_markdown=render_md)
    visible_posts = published_posts(posts)
    latest_post: Post | None = visible_posts[0] if visible_posts else None

    home_meta = PageMeta(
        path="/",
        title=SITE_TITLE,
        description=SITE_DEFAULT_DESCRIPTION,
        section="home",
    )
    _write(
        DIST / "index.html",
        render_layout(
            page=home_meta,
            body=render_home(
                featured=featured_projects(projects),
                latest=latest_post,
            ),
        ),
    )

    about_meta = PageMeta(
        path="/about",
        title="About · dunamismax",
        description=SITE_DEFAULT_DESCRIPTION,
        section="about",
    )
    about_html = load_page_markdown(ROOT, "about", render_markdown=render_md)
    if not about_html:
        raise SystemExit("missing content/pages/about.md")
    _write(
        DIST / "about" / "index.html",
        render_layout(page=about_meta, body=render_about(about_html)),
    )

    contact_meta = PageMeta(
        path="/contact",
        title="Contact · dunamismax",
        description=(
            "How to reach Stephen Sawyer by email, Signal, GitHub, "
            "Codeberg, or public source."
        ),
        section="contact",
    )
    _write(
        DIST / "contact" / "index.html",
        render_layout(page=contact_meta, body=render_contact()),
    )

    projects_meta = PageMeta(
        path="/projects",
        title="Projects · dunamismax",
        description=(
            "Selected work by Stephen Sawyer in Rust, Python, PostgreSQL, and vanilla TypeScript."
        ),
        section="projects",
    )
    _write(
        DIST / "projects" / "index.html",
        render_layout(
            page=projects_meta,
            body=render_projects_index(projects_by_category(projects)),
        ),
    )

    blog_meta = PageMeta(
        path="/blog",
        title="Blog · dunamismax",
        description=(
            "Notes on building, shipping, and self-hosting software in Rust, "
            "Python, PostgreSQL, and vanilla TypeScript."
        ),
        section="blog",
    )
    _write(
        DIST / "blog" / "index.html",
        render_layout(page=blog_meta, body=render_blog_index(visible_posts)),
    )

    for post in visible_posts:
        post_meta = PageMeta(
            path=f"/blog/{post.slug}",
            title=f"{post.title} · dunamismax",
            description=post.description,
            section="blog",
        )
        _write(
            DIST / "blog" / post.slug / "index.html",
            render_layout(
                page=post_meta, body=render_post(post), og_type="article"
            ),
        )

    not_found_meta = PageMeta(
        path="/404",
        title="404 · dunamismax",
        description="Page not found.",
        section="",
    )
    _write(
        DIST / "404.html",
        render_layout(page=not_found_meta, body=render_404()),
    )

    _write(DIST / "feed.xml", render_feed(visible_posts))
    _write_robots(DIST / "robots.txt")
    _write_manifest(DIST / "manifest.webmanifest")

    icon_src = ROOT / "static" / "icon.svg"
    if icon_src.exists():
        _copy(icon_src, DIST / "icon.svg")

    _copy_static_assets()
    _copy_styles()

    if run_tsc:
        _compile_typescript()

    return projects, visible_posts


def cmd_build(args) -> int:
    projects, posts = _build(run_tsc=not args.no_tsc)
    print(
        f"built dist/  · {len(projects)} projects · {len(posts)} posts"
    )
    return 0


def cmd_check(_args) -> int:
    render_md = _make_md_renderer()
    projects = load_projects(ROOT)
    posts = load_posts(ROOT, render_markdown=render_md)
    visible_posts = published_posts(posts)

    errors: list[str] = []
    errors.extend(check_mod.validate_projects(projects))
    errors.extend(check_mod.validate_posts(posts))

    if not DIST.exists():
        _build(run_tsc=False)

    errors.extend(check_mod.validate_internal_links(DIST, visible_posts))

    print("checking typescript...")
    _typescript_check()

    if errors:
        for error in errors:
            print(f"  ! {error}", file=sys.stderr)
        print(f"check failed with {len(errors)} error(s)", file=sys.stderr)
        return 1

    print(f"check ok · {len(projects)} projects · {len(visible_posts)} posts")
    return 0


class _NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format: str, *args) -> None:  # noqa: A002 - parent signature
        sys.stderr.write(
            "[%s] %s\n" % (self.log_date_time_string(), format % args)
        )


def _watch_loop(stop: threading.Event) -> None:
    watch_roots = [
        ROOT / "content",
        ROOT / "src",
        ROOT / "scripts" / "builder",
    ]

    def snapshot() -> dict[str, float]:
        out: dict[str, float] = {}
        for base in watch_roots:
            if not base.exists():
                continue
            for p in base.rglob("*"):
                if p.is_file() and "__pycache__" not in p.parts:
                    out[str(p)] = p.stat().st_mtime
        return out

    last = snapshot()
    while not stop.is_set():
        time.sleep(0.6)
        current = snapshot()
        if current != last:
            print("change detected, rebuilding...", flush=True)
            try:
                _build(run_tsc=True)
                print("rebuilt", flush=True)
            except Exception as exc:  # pragma: no cover - dev loop
                print(f"build error: {exc}", file=sys.stderr, flush=True)
            last = current


def cmd_serve(args) -> int:
    _build(run_tsc=True)
    os.chdir(DIST)
    handler = _NoCacheHandler
    stop = threading.Event()
    watcher = threading.Thread(target=_watch_loop, args=(stop,), daemon=True)
    watcher.start()
    with socketserver.TCPServer(("127.0.0.1", args.port), handler) as httpd:
        print(f"serving dist/ at http://127.0.0.1:{args.port}/", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nshutting down")
        finally:
            stop.set()
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="build.py", description=__doc__)
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_build = sub.add_parser("build", help="produce dist/")
    p_build.add_argument(
        "--no-tsc",
        action="store_true",
        help="skip TypeScript compilation (used by check)",
    )
    p_build.set_defaults(func=cmd_build)

    p_serve = sub.add_parser("serve", help="run dev server with watch")
    p_serve.add_argument("--port", type=int, default=8000)
    p_serve.set_defaults(func=cmd_serve)

    p_check = sub.add_parser("check", help="validate content + links + tsc")
    p_check.set_defaults(func=cmd_check)

    p_clean = sub.add_parser("clean", help="remove dist/")
    p_clean.set_defaults(func=cmd_clean)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
