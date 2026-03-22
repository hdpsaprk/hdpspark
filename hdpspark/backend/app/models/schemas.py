"""Pydantic models for request/response schemas."""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# --- Enums ---

class IssuePriority(str, Enum):
    HIGHEST = "Highest"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    LOWEST = "Lowest"


class IssueStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    IN_REVIEW = "In Review"
    DONE = "Done"
    BLOCKED = "Blocked"


class HealthScore(str, Enum):
    GREEN = "green"
    AMBER = "amber"
    RED = "red"


# --- Jira Models ---

class JiraIssue(BaseModel):
    key: str
    summary: str
    issue_type: str = ""
    status: str = ""
    priority: str = ""
    assignee: str = ""
    reporter: str = ""
    created: Optional[date] = None
    updated: Optional[date] = None
    resolved: Optional[date] = None
    due_date: Optional[date] = None
    sprint: str = ""
    epic: str = ""
    labels: list[str] = Field(default_factory=list)
    story_points: float = 0
    components: list[str] = Field(default_factory=list)
    fix_versions: list[str] = Field(default_factory=list)
    time_spent_hours: float = 0
    original_estimate_hours: float = 0


class JiraDataset(BaseModel):
    issues: list[JiraIssue]
    column_mapping: dict[str, str] = Field(default_factory=dict)
    detected_sprints: list[str] = Field(default_factory=list)
    detected_epics: list[str] = Field(default_factory=list)
    total_issues: int = 0


# --- Confluence Models ---

class ConfluenceInput(BaseModel):
    url: Optional[str] = None
    raw_text: Optional[str] = None
    api_token: Optional[str] = None
    username: Optional[str] = None


class OKR(BaseModel):
    objective: str
    key_results: list[KeyResult] = Field(default_factory=list)
    confidence: float = 0.0
    health: HealthScore = HealthScore.AMBER


class KeyResult(BaseModel):
    description: str
    target: str = ""
    current: str = ""
    progress_pct: float = 0.0
    linked_issues: list[str] = Field(default_factory=list)


OKR.model_rebuild()


# --- Analytics / KPI Models ---

class SprintMetrics(BaseModel):
    sprint_name: str
    total_issues: int = 0
    completed: int = 0
    carry_over: int = 0
    added_mid_sprint: int = 0
    velocity: float = 0.0
    planned_points: float = 0.0
    completed_points: float = 0.0
    completion_rate: float = 0.0


class TeamMemberMetrics(BaseModel):
    name: str
    issues_assigned: int = 0
    issues_completed: int = 0
    story_points_completed: float = 0.0
    avg_cycle_time_days: float = 0.0
    bugs_raised: int = 0
    blockers: int = 0


class KPISummary(BaseModel):
    total_issues: int = 0
    open_issues: int = 0
    done_issues: int = 0
    avg_cycle_time_days: float = 0.0
    avg_lead_time_days: float = 0.0
    throughput_per_week: float = 0.0
    defect_density: float = 0.0
    blocker_count: int = 0
    overdue_count: int = 0
    story_points_total: float = 0.0
    story_points_done: float = 0.0
    health_score: HealthScore = HealthScore.AMBER
    sprint_velocity_trend: list[float] = Field(default_factory=list)


class RiskItem(BaseModel):
    issue_key: str
    summary: str
    risk_type: str  # overdue, blocked, no_assignee, stale, large_unestimated
    severity: str  # high, medium, low
    days_at_risk: int = 0


class EpicProgress(BaseModel):
    epic_name: str
    total_issues: int = 0
    done: int = 0
    in_progress: int = 0
    todo: int = 0
    progress_pct: float = 0.0
    story_points_total: float = 0.0
    story_points_done: float = 0.0
    health: HealthScore = HealthScore.AMBER


class FlowMetrics(BaseModel):
    date: str
    todo: int = 0
    in_progress: int = 0
    done: int = 0


class DashboardData(BaseModel):
    kpi_summary: KPISummary
    sprint_metrics: list[SprintMetrics] = Field(default_factory=list)
    team_metrics: list[TeamMemberMetrics] = Field(default_factory=list)
    epic_progress: list[EpicProgress] = Field(default_factory=list)
    risk_items: list[RiskItem] = Field(default_factory=list)
    okrs: list[OKR] = Field(default_factory=list)
    flow_metrics: list[FlowMetrics] = Field(default_factory=list)
    issue_type_distribution: dict[str, int] = Field(default_factory=dict)
    priority_distribution: dict[str, int] = Field(default_factory=dict)
    status_distribution: dict[str, int] = Field(default_factory=dict)
    label_cloud: dict[str, int] = Field(default_factory=dict)
    weekly_throughput: list[dict[str, Any]] = Field(default_factory=list)
    cycle_time_distribution: list[float] = Field(default_factory=list)
