"""Project data loaded from frontend-owned JSON files."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Project:
    name: str
    tagline: str
    category: str
    status: str
    repo: str
    stack: list[str]
    order: int = 0
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

FRONTEND_PROJECTS_DIR = (
    Path(__file__).resolve().parents[3] / "frontend" / "src" / "content" / "projects"
)


@dataclass(frozen=True)
class ProjectGroup:
    category: str
    label: str
    projects: list[Project]


def _category_rank(category: str) -> int:
    try:
        return CATEGORY_ORDER.index(category)
    except ValueError as exc:
        raise ValueError(f"Unknown project category: {category}") from exc


def _load_project(path: Path) -> Project:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise TypeError(f"Project entry must decode to an object in {path}")

    stack = data.get("stack", [])
    if not isinstance(stack, list):
        raise TypeError(f"Project stack must be a list in {path}")

    return Project(
        name=str(data["name"]),
        tagline=str(data["tagline"]),
        category=str(data["category"]),
        status=str(data["status"]),
        repo=str(data["repo"]),
        stack=[str(item) for item in stack],
        order=int(data.get("order", 0)),
        url=str(data["url"]) if data.get("url") is not None else None,
    )


def get_projects() -> list[Project]:
    """Return projects in stable display order."""
    projects = [_load_project(path) for path in sorted(FRONTEND_PROJECTS_DIR.glob("*.json"))]
    return sorted(projects, key=lambda project: (_category_rank(project.category), project.order))


def get_projects_grouped() -> list[ProjectGroup]:
    """Return projects grouped by category in display order."""
    groups: list[ProjectGroup] = []
    projects = get_projects()

    for cat in CATEGORY_ORDER:
        cat_projects = [p for p in projects if p.category == cat]
        if cat_projects:
            groups.append(
                ProjectGroup(category=cat, label=CATEGORY_LABELS[cat], projects=cat_projects)
            )
    return groups
