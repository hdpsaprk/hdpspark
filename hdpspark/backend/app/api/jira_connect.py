"""Jira Cloud API connection endpoint - pull issues directly with API token."""

from fastapi import APIRouter, HTTPException

from app.engines.jira_fetcher import fetch_jira_issues, list_jira_projects
from app.models.schemas import JiraConnectInput, JiraDataset
from app.api.upload import _current_dataset

router = APIRouter()


@router.post("/connect", response_model=JiraDataset)
async def connect_jira(input_data: JiraConnectInput):
    """Connect to Jira Cloud and fetch issues via REST API.

    Requires only a personal API token (no admin access needed).
    Generate one at: https://id.atlassian.com/manage-profile/security/api-tokens
    """
    from app.api import upload as upload_mod

    # Build JQL
    jql = input_data.jql.strip() if input_data.jql else ""
    if input_data.project_key and not jql:
        jql = f"project = {input_data.project_key} ORDER BY created DESC"
    elif not jql:
        jql = "ORDER BY created DESC"

    try:
        dataset = await fetch_jira_issues(
            site_url=input_data.site_url,
            email=input_data.email,
            api_token=input_data.api_token,
            jql=jql,
            max_results=input_data.max_results,
        )
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg:
            raise HTTPException(401, "Authentication failed. Check your email and API token.")
        if "403" in error_msg:
            raise HTTPException(403, "Access denied. Your token may lack permissions for this project.")
        raise HTTPException(422, f"Failed to fetch from Jira: {error_msg}")

    if dataset.total_issues == 0:
        raise HTTPException(422, "No issues found. Try a different project or JQL query.")

    # Store as the current dataset (same as file upload)
    upload_mod._current_dataset = dataset
    return dataset


@router.post("/projects")
async def get_projects(input_data: JiraConnectInput):
    """List accessible Jira projects to help user pick one."""
    try:
        projects = await list_jira_projects(
            site_url=input_data.site_url,
            email=input_data.email,
            api_token=input_data.api_token,
        )
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg:
            raise HTTPException(401, "Authentication failed. Check your email and API token.")
        raise HTTPException(422, f"Failed to list projects: {error_msg}")

    return {"projects": projects}
