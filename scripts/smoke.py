"""Cheap smoke checks for the Astro site."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.error import HTTPError
from urllib.request import urlopen

DIST_DIR = Path(__file__).resolve().parents[1] / "frontend" / "dist"
HTML_PATHS = ["/", "/projects", "/blog", "/blog/hello-world", "/about", "/contact"]
TEXT_PATHS = ["/feed.xml", "/sitemap.xml", "/robots.txt"]
JSON_PATHS = ["/health"]


class DistHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: object, directory: str, **kwargs: object) -> None:
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format: str, *args: object) -> None:  # noqa: A003
        return

    def guess_type(self, path: str) -> str:
        if Path(path).name == "health" and not Path(path).suffix:
            return "application/json"
        return super().guess_type(path)

    def end_headers(self) -> None:
        if self.path == "/health":
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_error(
        self,
        code: int,
        message: str | None = None,
        explain: str | None = None,
    ) -> None:
        if code == HTTPStatus.NOT_FOUND:
            error_page = Path(self.directory) / "404.html"
            if error_page.exists():
                content = error_page.read_bytes()
                self.send_response(HTTPStatus.NOT_FOUND)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(content)
                return
        super().send_error(code, message, explain)


@contextmanager
def serve_dist() -> str:
    if not DIST_DIR.exists():
        raise SystemExit(
            f"Missing built frontend at {DIST_DIR}. Run `cd frontend && bun run build` first.",
        )

    handler = partial(DistHandler, directory=str(DIST_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        host, port = server.server_address
        yield f"http://{host}:{port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


@contextmanager
def resolve_base_url(base_url: str | None) -> str:
    if base_url is None:
        with serve_dist() as served_url:
            yield served_url
        return

    yield base_url.rstrip("/")


def _fetch(base_url: str, path: str) -> tuple[int, str, str]:
    try:
        with urlopen(f"{base_url}{path}") as response:
            return response.status, response.headers.get_content_type(), response.read().decode("utf-8")
    except HTTPError as error:
        return error.code, error.headers.get_content_type(), error.read().decode("utf-8")


def _check_ok(base_url: str, path: str, expected_type: str | tuple[str, ...]) -> str:
    status, content_type, body = _fetch(base_url, path)
    assert status == 200, f"{path} returned {status}"

    expected_types = (expected_type,) if isinstance(expected_type, str) else expected_type
    assert content_type in expected_types, (
        f"{path} returned {content_type}, expected one of {expected_types}"
    )
    return body


def run_checks(base_url: str) -> None:
    for path in HTML_PATHS:
        _check_ok(base_url, path, "text/html")

    for path in TEXT_PATHS:
        _check_ok(base_url, path, ("application/xml", "text/xml") if path.endswith(".xml") else "text/plain")

    health = _check_ok(base_url, "/health", "application/json")
    assert health == '{"status":"ok"}'

    home = _check_ok(base_url, "/", "text/html")
    assert "Stephen Sawyer" in home
    assert 'href="/feed.xml"' in home

    feed = _check_ok(base_url, "/feed.xml", ("application/xml", "text/xml"))
    assert "https://dunamismax.com/blog/hello-world" in feed

    sitemap = _check_ok(base_url, "/sitemap.xml", ("application/xml", "text/xml"))
    assert "https://dunamismax.com/projects" in sitemap

    status, content_type, missing = _fetch(base_url, "/blog/nonexistent-slug")
    assert status == 404, f"/blog/nonexistent-slug returned {status}"
    assert content_type == "text/html"
    assert "Page not found." in missing


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        help="Probe an already running site instead of serving frontend/dist locally.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    with resolve_base_url(args.base_url) as base_url:
        run_checks(base_url)

    print(f"Smoke OK: {base_url}")
    for path in HTML_PATHS + TEXT_PATHS + JSON_PATHS:
        print(f"- {path}")


if __name__ == "__main__":
    main()
