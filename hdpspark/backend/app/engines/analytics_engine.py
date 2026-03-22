"""Core analytics engine - computes all KPIs, metrics, and dashboard data."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, timedelta
from typing import Any

from app.models.schemas import (
    DashboardData,
    EpicProgress,
    FlowMetrics,
    HealthScore,
    JiraDataset,
    KPISummary,
    OKR,
    RiskItem,
    SprintMetrics,
    TeamMemberMetrics,
)


def compute_dashboard(dataset: JiraDataset, okrs: list[OKR] | None = None) -> DashboardData:
    """Compute the full dashboard from a Jira dataset and optional OKRs."""
    issues = dataset.issues
    today = date.today()

    kpi = _compute_kpis(issues, today)
    sprints = _compute_sprint_metrics(issues)
    team = _compute_team_metrics(issues)
    epics = _compute_epic_progress(issues)
    risks = _compute_risks(issues, today)
    flow = _compute_flow_metrics(issues)
    weekly = _compute_weekly_throughput(issues)
    cycle_times = _compute_cycle_time_distribution(issues)

    # Distributions
    type_dist = dict(Counter(i.issue_type for i in issues if i.issue_type))
    priority_dist = dict(Counter(i.priority for i in issues if i.priority))
    status_dist = dict(Counter(i.status for i in issues if i.status))

    label_counter: Counter = Counter()
    for issue in issues:
        for label in issue.labels:
            label_counter[label] += 1
    label_cloud = dict(label_counter.most_common(30))

    # Sprint velocity trend for KPI
    kpi.sprint_velocity_trend = [s.velocity for s in sprints]

    return DashboardData(
        kpi_summary=kpi,
        sprint_metrics=sprints,
        team_metrics=team,
        epic_progress=epics,
        risk_items=risks,
        okrs=okrs or [],
        flow_metrics=flow,
        issue_type_distribution=type_dist,
        priority_distribution=priority_dist,
        status_distribution=status_dist,
        label_cloud=label_cloud,
        weekly_throughput=weekly,
        cycle_time_distribution=cycle_times,
    )


def _compute_kpis(issues: list, today: date) -> KPISummary:
    total = len(issues)
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}
    blocked_statuses = {"blocked", "impediment"}

    done = [i for i in issues if i.status.lower() in done_statuses]
    open_issues = [i for i in issues if i.status.lower() not in done_statuses]
    blockers = [i for i in issues if i.status.lower() in blocked_statuses]

    # Cycle time: created -> resolved (for done items)
    cycle_times = []
    for i in done:
        if i.created and i.resolved:
            delta = (i.resolved - i.created).days
            if delta >= 0:
                cycle_times.append(delta)

    avg_cycle = sum(cycle_times) / len(cycle_times) if cycle_times else 0

    # Lead time approximation
    lead_times = []
    for i in done:
        if i.created and i.resolved:
            lead_times.append((i.resolved - i.created).days)
    avg_lead = sum(lead_times) / len(lead_times) if lead_times else 0

    # Throughput: resolved items per week
    resolved_dates = [i.resolved for i in done if i.resolved]
    if resolved_dates:
        date_range = (max(resolved_dates) - min(resolved_dates)).days or 1
        weeks = max(date_range / 7, 1)
        throughput = len(resolved_dates) / weeks
    else:
        throughput = 0

    # Defect density
    bugs = [i for i in issues if i.issue_type.lower() in {"bug", "defect", "incident"}]
    defect_density = len(bugs) / total if total else 0

    # Overdue
    overdue = [
        i for i in open_issues
        if i.due_date and i.due_date < today
    ]

    # Story points
    sp_total = sum(i.story_points for i in issues)
    sp_done = sum(i.story_points for i in done)

    # Health score
    completion_rate = len(done) / total if total else 0
    if completion_rate >= 0.7 and len(blockers) <= 2:
        health = HealthScore.GREEN
    elif completion_rate >= 0.4 or len(blockers) <= 5:
        health = HealthScore.AMBER
    else:
        health = HealthScore.RED

    return KPISummary(
        total_issues=total,
        open_issues=len(open_issues),
        done_issues=len(done),
        avg_cycle_time_days=round(avg_cycle, 1),
        avg_lead_time_days=round(avg_lead, 1),
        throughput_per_week=round(throughput, 1),
        defect_density=round(defect_density, 3),
        blocker_count=len(blockers),
        overdue_count=len(overdue),
        story_points_total=sp_total,
        story_points_done=sp_done,
        health_score=health,
    )


def _compute_sprint_metrics(issues: list) -> list[SprintMetrics]:
    sprints: dict[str, list] = defaultdict(list)
    for i in issues:
        if i.sprint:
            sprints[i.sprint].append(i)

    result = []
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}

    for name, sprint_issues in sorted(sprints.items()):
        completed = [i for i in sprint_issues if i.status.lower() in done_statuses]
        planned_points = sum(i.story_points for i in sprint_issues)
        completed_points = sum(i.story_points for i in completed)

        result.append(SprintMetrics(
            sprint_name=name,
            total_issues=len(sprint_issues),
            completed=len(completed),
            carry_over=len(sprint_issues) - len(completed),
            velocity=completed_points,
            planned_points=planned_points,
            completed_points=completed_points,
            completion_rate=round(
                len(completed) / len(sprint_issues) * 100 if sprint_issues else 0, 1
            ),
        ))
    return result


def _compute_team_metrics(issues: list) -> list[TeamMemberMetrics]:
    members: dict[str, dict[str, Any]] = defaultdict(
        lambda: {
            "assigned": 0, "completed": 0, "sp_done": 0.0,
            "cycle_times": [], "bugs": 0, "blockers": 0,
        }
    )
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}

    for i in issues:
        if not i.assignee:
            continue
        m = members[i.assignee]
        m["assigned"] += 1
        if i.status.lower() in done_statuses:
            m["completed"] += 1
            m["sp_done"] += i.story_points
            if i.created and i.resolved:
                m["cycle_times"].append((i.resolved - i.created).days)
        if i.issue_type.lower() in {"bug", "defect"}:
            m["bugs"] += 1
        if i.status.lower() == "blocked":
            m["blockers"] += 1

    return [
        TeamMemberMetrics(
            name=name,
            issues_assigned=data["assigned"],
            issues_completed=data["completed"],
            story_points_completed=data["sp_done"],
            avg_cycle_time_days=round(
                sum(data["cycle_times"]) / len(data["cycle_times"]), 1
            ) if data["cycle_times"] else 0,
            bugs_raised=data["bugs"],
            blockers=data["blockers"],
        )
        for name, data in sorted(members.items())
    ]


def _compute_epic_progress(issues: list) -> list[EpicProgress]:
    epics: dict[str, list] = defaultdict(list)
    for i in issues:
        if i.epic:
            epics[i.epic].append(i)

    done_statuses = {"done", "closed", "resolved", "complete", "completed"}
    ip_statuses = {"in progress", "in review", "in development", "in testing"}

    result = []
    for name, epic_issues in sorted(epics.items()):
        done = len([i for i in epic_issues if i.status.lower() in done_statuses])
        in_prog = len([i for i in epic_issues if i.status.lower() in ip_statuses])
        total = len(epic_issues)
        todo = total - done - in_prog
        sp_total = sum(i.story_points for i in epic_issues)
        sp_done = sum(
            i.story_points for i in epic_issues if i.status.lower() in done_statuses
        )
        pct = round(done / total * 100, 1) if total else 0

        if pct >= 70:
            health = HealthScore.GREEN
        elif pct >= 30:
            health = HealthScore.AMBER
        else:
            health = HealthScore.RED

        result.append(EpicProgress(
            epic_name=name,
            total_issues=total,
            done=done,
            in_progress=in_prog,
            todo=todo,
            progress_pct=pct,
            story_points_total=sp_total,
            story_points_done=sp_done,
            health=health,
        ))
    return result


def _compute_risks(issues: list, today: date) -> list[RiskItem]:
    risks: list[RiskItem] = []
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}

    for i in issues:
        if i.status.lower() in done_statuses:
            continue

        # Overdue
        if i.due_date and i.due_date < today:
            days = (today - i.due_date).days
            risks.append(RiskItem(
                issue_key=i.key,
                summary=i.summary,
                risk_type="overdue",
                severity="high" if days > 14 else "medium",
                days_at_risk=days,
            ))

        # Blocked
        if i.status.lower() in {"blocked", "impediment"}:
            days = (today - i.updated).days if i.updated else 0
            risks.append(RiskItem(
                issue_key=i.key,
                summary=i.summary,
                risk_type="blocked",
                severity="high",
                days_at_risk=days,
            ))

        # Unassigned
        if not i.assignee:
            risks.append(RiskItem(
                issue_key=i.key,
                summary=i.summary,
                risk_type="no_assignee",
                severity="medium",
                days_at_risk=0,
            ))

        # Stale (not updated in 14+ days)
        if i.updated and (today - i.updated).days > 14:
            risks.append(RiskItem(
                issue_key=i.key,
                summary=i.summary,
                risk_type="stale",
                severity="low",
                days_at_risk=(today - i.updated).days,
            ))

    # Sort by severity
    sev_order = {"high": 0, "medium": 1, "low": 2}
    risks.sort(key=lambda r: sev_order.get(r.severity, 3))
    return risks


def _compute_flow_metrics(issues: list) -> list[FlowMetrics]:
    """Compute cumulative flow data."""
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}
    ip_statuses = {"in progress", "in review", "in development", "in testing"}

    # Build a timeline from created dates
    date_map: dict[date, dict[str, int]] = defaultdict(lambda: {"todo": 0, "in_progress": 0, "done": 0})

    for i in issues:
        if not i.created:
            continue
        d = i.created
        if i.status.lower() in done_statuses:
            date_map[d]["done"] += 1
        elif i.status.lower() in ip_statuses:
            date_map[d]["in_progress"] += 1
        else:
            date_map[d]["todo"] += 1

    if not date_map:
        return []

    # Cumulative sum
    sorted_dates = sorted(date_map.keys())
    cum_todo = cum_ip = cum_done = 0
    result = []
    for d in sorted_dates:
        cum_todo += date_map[d]["todo"]
        cum_ip += date_map[d]["in_progress"]
        cum_done += date_map[d]["done"]
        result.append(FlowMetrics(
            date=d.isoformat(),
            todo=cum_todo,
            in_progress=cum_ip,
            done=cum_done,
        ))
    return result


def _compute_weekly_throughput(issues: list) -> list[dict[str, Any]]:
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}
    resolved = [i for i in issues if i.resolved and i.status.lower() in done_statuses]

    if not resolved:
        return []

    weekly: dict[str, int] = defaultdict(int)
    for i in resolved:
        # ISO week
        week_start = i.resolved - timedelta(days=i.resolved.weekday())
        weekly[week_start.isoformat()] += 1

    return [
        {"week": k, "count": v}
        for k, v in sorted(weekly.items())
    ]


def _compute_cycle_time_distribution(issues: list) -> list[float]:
    done_statuses = {"done", "closed", "resolved", "complete", "completed"}
    times = []
    for i in issues:
        if i.status.lower() in done_statuses and i.created and i.resolved:
            delta = (i.resolved - i.created).days
            if delta >= 0:
                times.append(float(delta))
    return sorted(times)
