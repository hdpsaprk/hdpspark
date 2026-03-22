"""Jira REST API fetcher - pulls issues using JQL with a personal API token."""

from __future__ import annotations

from datetime import date
from typing import Any, Optional

import httpx

from app.models.schemas import JiraDataset, JiraIssue


def _parse_date(val: Any) -> Optional[date]:
    if not val:
        return None
    try:
        # Jira dates: "2024-01-15T10:30:00.000+0000" or "2024-01-15"
        return date.fromisoformat(str(val)[:10])
    except (ValueError, TypeError):
        return None


def _safe_str(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, dict):
        return val.get("name", val.get("value", str(val)))
    return str(val).strip()


def _parse_float(val: Any) -> float:
    if val is None:
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def _extract_sprint_name(sprint_data: Any) -> str:
    """Extract sprint name from Jira's sprint field (can be string or object)."""
    if not sprint_data:
        return ""
    if isinstance(sprint_data, list):
        # Take the most recent sprint
        if not sprint_data:
            return ""
        sprint_data = sprint_data[-1]
    if isinstance(sprint_data, dict):
        return sprint_data.get("name", "")
    # Sometimes sprint is a string like "com.atlassian.greenhopper...name=Sprint 1,..."
    s = str(sprint_data)
    if "name=" in s:
        start = s.index("name=") + 5
        end = s.index(",", start) if "," in s[start:] else len(s)
        return s[start:end]
    return s.strip()


def _parse_issue(raw: dict) -> JiraIssue:
    """Convert a raw Jira API issue dict to our JiraIssue model."""
    fields = raw.get("fields", {})

    # Labels
    labels = fields.get("labels", []) or []

    # Components
    components = [c.get("name", "") for c in (fields.get("components") or []) if isinstance(c, dict)]

    # Fix versions
    fix_versions = [v.get("name", "") for v in (fields.get("fixVersions") or []) if isinstance(v, dict)]

    # Sprint - try customfield or sprint field
    sprint_name = ""
    for field_key in ["sprint", "customfield_10020", "customfield_10004"]:
        val = fields.get(field_key)
        if val:
            sprint_name = _extract_sprint_name(val)
            if sprint_name:
                break

    # Story points - try common custom fields
    story_points = 0.0
    for field_key in ["story_points", "customfield_10028", "customfield_10016", "customfield_10002"]:
        val = fields.get(field_key)
        if val is not None:
            story_points = _parse_float(val)
            if story_points > 0:
                break

    # Epic
    epic = ""
    epic_field = fields.get("epic") or fields.get("customfield_10014") or fields.get("customfield_10008")
    if isinstance(epic_field, dict):
        epic = epic_field.get("name", epic_field.get("summary", ""))
    elif epic_field:
        epic = _safe_str(epic_field)
    # Fallback: parent for next-gen projects
    if not epic and fields.get("parent"):
        parent = fields["parent"]
        parent_type = parent.get("fields", {}).get("issuetype", {}).get("name", "")
        if parent_type.lower() == "epic":
            epic = parent.get("fields", {}).get("summary", parent.get("key", ""))

    # Time tracking
    time_spent_hours = 0.0
    original_estimate_hours = 0.0
    time_tracking = fields.get("timetracking", {}) or {}
    if time_tracking.get("timeSpentSeconds"):
        time_spent_hours = time_tracking["timeSpentSeconds"] / 3600
    if time_tracking.get("originalEstimateSeconds"):
        original_estimate_hours = time_tracking["originalEstimateSeconds"] / 3600

    return JiraIssue(
        key=raw.get("key", ""),
        summary=_safe_str(fields.get("summary")),
        issue_type=_safe_str(fields.get("issuetype")),
        status=_safe_str(fields.get("status")),
        priority=_safe_str(fields.get("priority")),
        assignee=_safe_str(fields.get("assignee")),
        reporter=_safe_str(fields.get("reporter")),
        created=_parse_date(fields.get("created")),
        updated=_parse_date(fields.get("updated")),
        resolved=_parse_date(fields.get("resolutiondate")),
        due_date=_parse_date(fields.get("duedate")),
        sprint=sprint_name,
        epic=epic,
        labels=labels,
        story_points=story_points,
        components=components,
        fix_versions=fix_versions,
        time_spent_hours=time_spent_hours,
        original_estimate_hours=original_estimate_hours,
    )


async def fetch_jira_issues(
    site_url: str,
    email: str,
    api_token: str,
    jql: str = "ORDER BY created DESC",
    max_results: int = 500,
) -> JiraDataset:
    """Fetch issues from Jira Cloud REST API using a personal API token.

    Args:
        site_url: e.g. "https://yourcompany.atlassian.net" or "yourcompany.atlassian.net"
        email: Your Atlassian account email
        api_token: Personal API token from https://id.atlassian.com/manage-profile/security/api-tokens
        jql: JQL query to filter issues (default: all issues)
        max_results: Max issues to fetch (paginated automatically)
    """
    # Normalize URL
    site_url = site_url.strip().rstrip("/")
    if not site_url.startswith("http"):
        site_url = f"https://{site_url}"

    api_url = f"{site_url}/rest/api/3/search"
    auth = (email, api_token)

    all_issues: list[JiraIssue] = []
    sprints_set: set[str] = set()
    epics_set: set[str] = set()
    start_at = 0
    page_size = min(100, max_results)

    async with httpx.AsyncClient(timeout=30) as client:
        while start_at < max_results:
            resp = await client.get(
                api_url,
                auth=auth,
                params={
                    "jql": jql,
                    "startAt": start_at,
                    "maxResults": page_size,
                    "fields": "*all",
                },
            )
            resp.raise_for_status()
            data = resp.json()

            raw_issues = data.get("issues", [])
            if not raw_issues:
                break

            for raw in raw_issues:
                issue = _parse_issue(raw)
                all_issues.append(issue)
                if issue.sprint:
                    sprints_set.add(issue.sprint)
                if issue.epic:
                    epics_set.add(issue.epic)

            start_at += len(raw_issues)
            if start_at >= data.get("total", 0):
                break

    return JiraDataset(
        issues=all_issues,
        column_mapping={"source": "jira_api"},
        detected_sprints=sorted(sprints_set),
        detected_epics=sorted(epics_set),
        total_issues=len(all_issues),
    )


async def list_jira_projects(
    site_url: str,
    email: str,
    api_token: str,
) -> list[dict]:
    """List accessible Jira projects (to help user pick a project for JQL)."""
    site_url = site_url.strip().rstrip("/")
    if not site_url.startswith("http"):
        site_url = f"https://{site_url}"

    api_url = f"{site_url}/rest/api/3/project/search"
    auth = (email, api_token)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(api_url, auth=auth, params={"maxResults": 50})
        resp.raise_for_status()
        data = resp.json()

    return [
        {"key": p["key"], "name": p["name"], "style": p.get("style", "")}
        for p in data.get("values", [])
    ]
