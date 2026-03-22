"""HDP Spark - Jira & Confluence Dashboard Framework"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(confluence_router, prefix="/api/confluence", tags=["Confluence"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "hdpspark"}
