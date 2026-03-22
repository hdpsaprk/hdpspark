"""Detailed analytics endpoints for specific views."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.api.upload import get_current_dataset
from app.engines.analytics_engine import (
    _compute_sprint_metrics,
    _compute_team_metrics,
    _compute_epic_progress,
    _compute_risks,
    _compute_flow_metrics,
    _compute_cycle_time_distribution,
    _compute_weekly_throughput,
)
from datetime import date

router = APIRouter()


def _require_data():
    ds = get_current_dataset()
    if not ds:
        raise HTTPException(400, "No data uploaded yet.")
    return ds


@router.get("/sprints")
async def sprint_analytics():
    """Detailed sprint-by-sprint analytics."""
    ds = _require_data()
    return {"sprints": [s.model_dump() for s in _compute_sprint_metrics(ds.issues)]}


@router.get("/team")
async def team_analytics():
    """Team member performance metrics."""
    ds = _require_data()
    return {"team": [t.model_dump() for t in _compute_team_metrics(ds.issues)]}


@router.get("/epics")
async def epic_analytics():
    """Epic progress breakdown."""
    ds = _require_data()
    return {"epics": [e.model_dump() for e in _compute_epic_progress(ds.issues)]}


@router.get("/risks")
async def risk_analysis():
    """Risk and blocker analysis."""
    ds = _require_data()
    risks = _compute_risks(ds.issues, date.today())
    return {
        "risks": [r.model_dump() for r in risks],
        "total_risks": len(risks),
        "high_severity": len([r for r in risks if r.severity == "high"]),
        "by_type": _group_risks(risks),
    }


@router.get("/flow")
async def flow_metrics():
    """Cumulative flow diagram data."""
    ds = _require_data()
    return {"flow": [f.model_dump() for f in _compute_flow_metrics(ds.issues)]}


@router.get("/throughput")
async def throughput():
    """Weekly throughput data."""
    ds = _require_data()
    return {"throughput": _compute_weekly_throughput(ds.issues)}


@router.get("/cycle-time")
async def cycle_time():
    """Cycle time distribution."""
    ds = _require_data()
    times = _compute_cycle_time_distribution(ds.issues)
    return {
        "distribution": times,
        "count": len(times),
        "average": round(sum(times) / len(times), 1) if times else 0,
        "median": times[len(times) // 2] if times else 0,
        "p85": times[int(len(times) * 0.85)] if times else 0,
        "p95": times[int(len(times) * 0.95)] if times else 0,
    }


@router.get("/filter-options")
async def filter_options():
    """Get available filter options from the dataset."""
    ds = _require_data()
    return {
        "sprints": ds.detected_sprints,
        "epics": ds.detected_epics,
        "statuses": list(set(i.status for i in ds.issues if i.status)),
        "assignees": sorted(set(i.assignee for i in ds.issues if i.assignee)),
        "priorities": list(set(i.priority for i in ds.issues if i.priority)),
        "issue_types": list(set(i.issue_type for i in ds.issues if i.issue_type)),
    }


def _group_risks(risks):
    groups = {}
    for r in risks:
        groups.setdefault(r.risk_type, 0)
        groups[r.risk_type] += 1
    return groups
