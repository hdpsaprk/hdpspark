"""Dashboard generation API."""

from fastapi import APIRouter, HTTPException

from app.api.upload import get_current_dataset
from app.api.confluence import get_current_okrs
from app.engines.analytics_engine import compute_dashboard
from app.models.schemas import DashboardData

router = APIRouter()


@router.get("/generate", response_model=DashboardData)
async def generate_dashboard():
    """Generate full dashboard from uploaded data."""
    dataset = get_current_dataset()
    if not dataset:
        raise HTTPException(400, "No data uploaded yet. Upload a Jira Excel file first.")

    okrs = get_current_okrs()
    dashboard = compute_dashboard(dataset, okrs=okrs if okrs else None)
    return dashboard


@router.get("/summary")
async def get_summary():
    """Get a quick summary of the current dataset."""
    dataset = get_current_dataset()
    if not dataset:
        return {"has_data": False}

    okrs = get_current_okrs()
    return {
        "has_data": True,
        "total_issues": dataset.total_issues,
        "sprints": dataset.detected_sprints,
        "epics": dataset.detected_epics,
        "okrs_count": len(okrs),
        "columns_detected": list(dataset.column_mapping.keys()),
    }
