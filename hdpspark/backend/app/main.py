"""HDP Spark - Jira & Confluence Dashboard Framework"""

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.upload import router as upload_router
from app.api.dashboard import router as dashboard_router
from app.api.confluence import router as confluence_router
from app.api.analytics import router as analytics_router

app = FastAPI(
    title="HDP Spark",
    description="On-demand dashboards from Jira exports & Confluence pages",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(confluence_router, prefix="/api/confluence", tags=["Confluence"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"
REPORT_PATH = SEED_DIR / "dashboard_report.html"


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "hdpspark"}


@app.get("/report", response_class=HTMLResponse)
async def serve_report():
    """Serve the pre-generated HTML dashboard report."""
    if REPORT_PATH.exists():
        return FileResponse(REPORT_PATH, media_type="text/html")
    return HTMLResponse("<h1>Report not generated yet. Run: python seed/generate_html_report.py</h1>", status_code=404)
