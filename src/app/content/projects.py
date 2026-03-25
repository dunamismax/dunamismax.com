"""Project data for the portfolio page."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Project:
    name: str
    tagline: str
    category: str
    status: str
    repo: str
    stack: list[str]
    url: str | None = None


CATEGORY_LABELS: dict[str, str] = {
    "apps": "Apps",
    "infrastructure": "Infrastructure",
    "developer-tools": "Developer Tools",
    "reference": "Reference",
}

CATEGORY_ORDER: list[str] = ["apps", "infrastructure", "developer-tools", "reference"]

STATUS_LABELS: dict[str, str] = {
    "active": "Active",
    "shipped": "Shipped",
    "phase-0": "Phase 0",
    "legacy": "Legacy",
}

PROJECTS: list[Project] = [
    Project(
        name="Scrybase",
        tagline=(
            "Commander intelligence workbench. Decks, collection, pod tracking,"
            " matchup journal, and Scryfall integration."
        ),
        category="apps",
        status="active",
        repo="https://github.com/dunamismax/scrybase",
        stack=["Go", "React", "Vite", "SQLite"],
    ),
    Project(
        name="Patchworks",
        tagline=(
            "Git-style diffs for SQLite databases. Schema, rows, and the SQL to"
            " reconcile them. Native desktop app and headless CLI."
        ),
        category="apps",
        status="active",
        repo="https://github.com/dunamismax/patchworks",
        stack=["Go", "SQLite"],
    ),
    Project(
        name="bore",
        tagline=(
            "Peer-to-peer encrypted file transfer. Direct connections via"
            " STUN/hole-punching with Noise XXpsk0 E2E encryption, relay fallback"
            " when NAT wins. No accounts, no cloud."
        ),
        category="infrastructure",
        status="shipped",
        repo="https://github.com/dunamismax/bore",
        stack=["Go", "Noise", "STUN"],
    ),
    Project(
        name="wirescope",
        tagline=(
            "Terminal-first network observability. Live capture, top talkers, DNS"
            " context, connection tables, PCAP on disk. Go core with Rust capture"
            " backend."
        ),
        category="infrastructure",
        status="shipped",
        repo="https://github.com/dunamismax/wirescope",
        stack=["Go", "Rust", "SQLite", "PCAP"],
    ),
    Project(
        name="repokeeper",
        tagline=(
            "Self-hosted repo health daemon. Scheduled scans with jitter, doc"
            " verification, remote validation, drift detection. One binary,"
            " systemd/launchd service files included."
        ),
        category="developer-tools",
        status="active",
        repo="https://github.com/dunamismax/repokeeper",
        stack=["Go", "SQLite"],
    ),
    Project(
        name="cargo-compatible",
        tagline=(
            "Check whether your resolved dependency graph fits a target Rust"
            " version. Lockfile-first, fixes before manifest changes."
        ),
        category="developer-tools",
        status="shipped",
        repo="https://github.com/dunamismax/cargo-compatible",
        stack=["Rust"],
    ),
    Project(
        name="cargo-async-doctor",
        tagline="Catch async Rust bugs that compile fine and pass Clippy but deadlock at 2 AM.",
        category="developer-tools",
        status="shipped",
        repo="https://github.com/dunamismax/cargo-async-doctor",
        stack=["Rust"],
    ),
    Project(
        name="rust-async-field-guide",
        tagline=(
            "Learn async Rust by breaking things first. Twelve chapters of real"
            " footguns, reproductions, and verified fixes."
        ),
        category="reference",
        status="shipped",
        repo="https://github.com/dunamismax/rust-async-field-guide",
        url="https://dunamismax.github.io/rust-async-field-guide/",
        stack=["Rust"],
    ),
]


@dataclass(frozen=True)
class ProjectGroup:
    category: str
    label: str
    projects: list[Project]


def get_projects_grouped() -> list[ProjectGroup]:
    """Return projects grouped by category in display order."""
    groups: list[ProjectGroup] = []
    for cat in CATEGORY_ORDER:
        cat_projects = [p for p in PROJECTS if p.category == cat]
        if cat_projects:
            groups.append(
                ProjectGroup(category=cat, label=CATEGORY_LABELS[cat], projects=cat_projects)
            )
    return groups
