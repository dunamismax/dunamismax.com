"""Application configuration."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """App-wide settings loaded from environment variables."""

    site_name: str = "dunamismax.com"
    site_url: str = "https://dunamismax.com"
    site_title: str = "Stephen Sawyer"
    site_description: str = (
        "Building self-hostable systems software. Python, Go, Rust, and the web."
    )
    debug: bool = False


def get_settings() -> Settings:
    """Build settings from env vars with sensible defaults."""
    return Settings(
        debug=os.getenv("DEBUG", "").lower() in ("1", "true", "yes"),
    )
