"""File upload API for Jira Excel sheets."""

from fastapi import APIRouter, File, UploadFile, HTTPException

from app.engines.jira_parser import parse_jira_excel
from app.models.schemas import JiraDataset

router = APIRouter()

# In-memory store for current session (swap for Redis/DB in production)
_current_dataset: JiraDataset | None = None


def get_current_dataset() -> JiraDataset | None:
    return _current_dataset


@router.post("/jira", response_model=JiraDataset)
async def upload_jira_excel(file: UploadFile = File(...)):
    """Upload a Jira Excel export and parse it into structured data."""
    global _current_dataset

    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Please upload an Excel file (.xlsx or .xls)")

    try:
        contents = await file.read()
        dataset = parse_jira_excel(contents)
    except Exception as e:
        raise HTTPException(422, f"Failed to parse Excel file: {str(e)}")

    if dataset.total_issues == 0:
        raise HTTPException(422, "No Jira issues found. Check column headers match Jira export format.")

    _current_dataset = dataset
    return dataset


@router.get("/status")
async def upload_status():
    """Check if data has been uploaded."""
    if _current_dataset:
        return {
            "has_data": True,
            "total_issues": _current_dataset.total_issues,
            "sprints": len(_current_dataset.detected_sprints),
            "epics": len(_current_dataset.detected_epics),
        }
    return {"has_data": False}
