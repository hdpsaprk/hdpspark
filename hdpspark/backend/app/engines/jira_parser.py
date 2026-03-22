"""Jira Excel sheet parser with smart column detection."""

from __future__ import annotations

import re
from datetime import date, datetime
from io import BytesIO
from typing import Any

import pandas as pd

from app.models.schemas import JiraDataset, JiraIssue

# Common Jira export column name variants
COLUMN_ALIASES = {
    "key": ["key", "issue key", "issue_key", "jira key", "ticket", "issue id"],
    "summary": ["summary", "title", "description", "issue summary"],
    "issue_type": ["issue type", "issuetype", "type", "issue_type", "ticket type"],
    "status": ["status", "state", "issue status", "workflow status"],
    "priority": ["priority", "issue priority", "severity"],
    "assignee": ["assignee", "assigned to", "assigned", "owner", "developer"],
    "reporter": ["reporter", "reported by", "creator", "created by"],
    "created": ["created", "created date", "creation date", "date created", "opened"],
    "updated": ["updated", "updated date", "last updated", "modified", "date modified"],
    "resolved": ["resolved", "resolved date", "resolution date", "closed date", "done date"],
    "due_date": ["due date", "due_date", "duedate", "deadline", "target date"],
    "sprint": ["sprint", "iteration", "sprint name", "agile sprint"],
    "epic": ["epic", "epic link", "epic name", "epic_link", "parent", "epic key"],
    "labels": ["labels", "label", "tags", "tag"],
    "story_points": [
        "story points", "story_points", "storypoints", "points",
        "effort", "estimate", "size", "sp",
    ],
    "components": ["components", "component", "component/s", "module"],
    "fix_versions": ["fix version", "fix_version", "fix version/s", "release", "fix versions"],
    "time_spent_hours": [
        "time spent", "time_spent", "logged time", "hours logged",
        "work logged", "actual hours",
    ],
    "original_estimate_hours": [
        "original estimate", "original_estimate", "estimated time",
        "estimate hours", "planned hours",
    ],
}


def _normalize(col: str) -> str:
    return re.sub(r"[^a-z0-9]", " ", col.lower()).strip()


def _detect_columns(df: pd.DataFrame) -> dict[str, str]:
    """Map our schema fields to actual DataFrame column names."""
    mapping: dict[str, str] = {}
    normalized = {_normalize(c): c for c in df.columns}

    for field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            norm = _normalize(alias)
            if norm in normalized:
                mapping[field] = normalized[norm]
                break
    return mapping


def _parse_date(val: Any) -> date | None:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    if isinstance(val, (datetime, date)):
        return val if isinstance(val, date) else val.date()
    try:
        return pd.to_datetime(str(val), dayfirst=False).date()
    except Exception:
        return None


def _parse_list(val: Any) -> list[str]:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return []
    s = str(val)
    if "," in s:
        return [x.strip() for x in s.split(",") if x.strip()]
    return [s.strip()] if s.strip() else []


def _parse_float(val: Any) -> float:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _safe_str(val: Any) -> str:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return ""
    return str(val).strip()


def parse_jira_excel(file_bytes: bytes) -> JiraDataset:
    """Parse a Jira Excel export into structured JiraDataset."""
    df = pd.read_excel(BytesIO(file_bytes), engine="openpyxl")
    df.columns = [str(c).strip() for c in df.columns]

    col_map = _detect_columns(df)

    def get(row: pd.Series, field: str) -> Any:
        col = col_map.get(field)
        if col is None:
            return None
        return row.get(col)

    issues: list[JiraIssue] = []
    sprints_set: set[str] = set()
    epics_set: set[str] = set()

    for _, row in df.iterrows():
        key = _safe_str(get(row, "key"))
        if not key:
            continue

        sprint = _safe_str(get(row, "sprint"))
        epic = _safe_str(get(row, "epic"))
        if sprint:
            sprints_set.add(sprint)
        if epic:
            epics_set.add(epic)

        issue = JiraIssue(
            key=key,
            summary=_safe_str(get(row, "summary")),
            issue_type=_safe_str(get(row, "issue_type")),
            status=_safe_str(get(row, "status")),
            priority=_safe_str(get(row, "priority")),
            assignee=_safe_str(get(row, "assignee")),
            reporter=_safe_str(get(row, "reporter")),
            created=_parse_date(get(row, "created")),
            updated=_parse_date(get(row, "updated")),
            resolved=_parse_date(get(row, "resolved")),
            due_date=_parse_date(get(row, "due_date")),
            sprint=sprint,
            epic=epic,
            labels=_parse_list(get(row, "labels")),
            story_points=_parse_float(get(row, "story_points")),
            components=_parse_list(get(row, "components")),
            fix_versions=_parse_list(get(row, "fix_versions")),
            time_spent_hours=_parse_float(get(row, "time_spent_hours")),
            original_estimate_hours=_parse_float(get(row, "original_estimate_hours")),
        )
        issues.append(issue)

    return JiraDataset(
        issues=issues,
        column_mapping=col_map,
        detected_sprints=sorted(sprints_set),
        detected_epics=sorted(epics_set),
        total_issues=len(issues),
    )
