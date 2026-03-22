"""Generate realistic seed data for HDP Spark testing.

Creates:
  - seed_jira_export.xlsx  (100 Jira issues across 5 sprints, 4 epics, 8 team members)
  - seed_confluence_okrs.txt (OKR page content with 4 objectives and key results)
"""

import os
import random
from datetime import date, timedelta

import openpyxl

# ── Configuration ──────────────────────────────────────────────────

SEED = 42
random.seed(SEED)
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

NUM_ISSUES = 100

PROJECT_KEY = "SPARK"

SPRINTS = [
    "Sprint 2025-Q4-1",
    "Sprint 2025-Q4-2",
    "Sprint 2025-Q4-3",
    "Sprint 2026-Q1-1",
    "Sprint 2026-Q1-2",
]

EPICS = [
    "User Authentication & SSO",
    "Dashboard & Reporting Engine",
    "Data Pipeline Modernization",
    "Mobile App v2 Redesign",
]

ASSIGNEES = [
    "Alice Chen", "Bob Martinez", "Carol Okonkwo", "David Kim",
    "Eva Petrov", "Frank Johnson", "Grace Liu", "Hassan Ali",
]

REPORTERS = ASSIGNEES + ["PM - Sarah Wilson", "PM - James Taylor"]

ISSUE_TYPES = {
    "Story": 50,
    "Bug": 20,
    "Task": 15,
    "Sub-task": 8,
    "Spike": 4,
    "Epic": 3,
}

STATUSES_FLOW = ["To Do", "In Progress", "In Review", "Done", "Blocked"]
STATUS_WEIGHTS = {
    "To Do": 15,
    "In Progress": 20,
    "In Review": 10,
    "Done": 48,
    "Blocked": 7,
}

PRIORITIES = {
    "Highest": 5,
    "High": 20,
    "Medium": 45,
    "Low": 25,
    "Lowest": 5,
}

LABELS = [
    "backend", "frontend", "api", "security", "performance",
    "tech-debt", "ux", "infra", "testing", "documentation",
    "accessibility", "mobile", "analytics", "auth", "database",
]

COMPONENTS = [
    "Web App", "API Gateway", "Auth Service", "Data Service",
    "Mobile iOS", "Mobile Android", "Shared Libs", "CI/CD",
]

FIX_VERSIONS = ["v2.0.0", "v2.1.0", "v2.2.0", "v3.0.0-beta"]

# Story summaries by epic
SUMMARIES = {
    "User Authentication & SSO": [
        "Implement OAuth2 login flow with Google provider",
        "Add SAML SSO integration for enterprise customers",
        "Build password reset flow with email verification",
        "Create multi-factor authentication (MFA) setup page",
        "Implement JWT token refresh mechanism",
        "Add role-based access control (RBAC) middleware",
        "Build user profile settings page",
        "Add session management and device tracking",
        "Implement account lockout after failed attempts",
        "Add social login support (GitHub, Microsoft)",
        "Create API key management for service accounts",
        "Build audit log for authentication events",
        "Fix: SSO redirect loop on expired sessions",
        "Fix: MFA code validation timing issue",
        "Spike: Evaluate passkey/WebAuthn support",
    ],
    "Dashboard & Reporting Engine": [
        "Build real-time dashboard widget framework",
        "Implement drag-and-drop dashboard layout editor",
        "Create chart component library (bar, line, pie, area)",
        "Add CSV/PDF export for all report views",
        "Build scheduled report email delivery system",
        "Implement custom date range picker for analytics",
        "Create KPI card component with trend indicators",
        "Add drill-down navigation from summary to detail views",
        "Build saved filters and bookmarked views",
        "Implement dashboard sharing with permission controls",
        "Create embeddable widget for external sites",
        "Add data caching layer for dashboard performance",
        "Fix: Chart tooltip overlap on mobile viewport",
        "Fix: Export PDF cuts off wide tables",
        "Fix: Dashboard loading spinner stuck on slow connections",
        "Spike: Evaluate WebSocket for real-time data push",
    ],
    "Data Pipeline Modernization": [
        "Migrate batch ETL jobs to streaming architecture",
        "Implement Apache Kafka event ingestion pipeline",
        "Build data quality validation framework",
        "Create schema registry for event contracts",
        "Add dead letter queue handling for failed events",
        "Implement data partitioning strategy for time-series data",
        "Build monitoring dashboard for pipeline health",
        "Create data lineage tracking system",
        "Add automated data reconciliation checks",
        "Implement incremental data sync for large datasets",
        "Build CDC (Change Data Capture) connector for PostgreSQL",
        "Create data catalog with search and discovery",
        "Fix: Kafka consumer lag causing data delays",
        "Fix: Schema evolution breaking downstream consumers",
        "Task: Document data pipeline architecture",
        "Task: Set up staging environment for pipeline testing",
    ],
    "Mobile App v2 Redesign": [
        "Redesign home screen with personalized feed",
        "Implement bottom navigation with gesture support",
        "Build offline-first data sync engine",
        "Create push notification preference center",
        "Add biometric authentication (Face ID / fingerprint)",
        "Implement dark mode with system preference detection",
        "Build image optimization and lazy loading",
        "Create onboarding flow for new users",
        "Add pull-to-refresh with skeleton loading states",
        "Implement deep linking for shared content",
        "Build accessibility audit and WCAG compliance fixes",
        "Create app performance monitoring integration",
        "Fix: App crash on low-memory Android devices",
        "Fix: Push notifications not received when app is backgrounded",
        "Fix: Image upload fails on slow network connections",
        "Spike: Evaluate React Native vs Flutter migration",
    ],
}

# ── Date helpers ───────────────────────────────────────────────────

SPRINT_DATES = {
    "Sprint 2025-Q4-1": (date(2025, 10, 1), date(2025, 10, 14)),
    "Sprint 2025-Q4-2": (date(2025, 10, 15), date(2025, 10, 28)),
    "Sprint 2025-Q4-3": (date(2025, 10, 29), date(2025, 11, 11)),
    "Sprint 2026-Q1-1": (date(2026, 1, 5), date(2026, 1, 18)),
    "Sprint 2026-Q1-2": (date(2026, 1, 19), date(2026, 2, 1)),
}


def weighted_choice(options: dict) -> str:
    keys = list(options.keys())
    weights = list(options.values())
    return random.choices(keys, weights=weights, k=1)[0]


def random_date_between(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, max(delta, 0)))


# ── Generate issues ────────────────────────────────────────────────

def generate_issues() -> list[dict]:
    issues = []
    summary_pool = {}
    for epic, sums in SUMMARIES.items():
        summary_pool[epic] = list(sums)

    for i in range(1, NUM_ISSUES + 1):
        epic = random.choice(EPICS)
        sprint = random.choice(SPRINTS)
        sprint_start, sprint_end = SPRINT_DATES[sprint]
        issue_type = weighted_choice(ISSUE_TYPES)
        status = weighted_choice(STATUS_WEIGHTS)
        priority = weighted_choice(PRIORITIES)

        # Pick a summary
        if summary_pool[epic]:
            summary = summary_pool[epic].pop(0)
        else:
            summary = f"[{epic.split()[0]}] Additional work item #{i}"

        assignee = random.choice(ASSIGNEES)
        reporter = random.choice(REPORTERS)

        # Dates
        created = random_date_between(
            sprint_start - timedelta(days=5), sprint_start + timedelta(days=3)
        )
        updated = random_date_between(created, min(sprint_end + timedelta(days=7), date(2026, 3, 20)))

        resolved = None
        if status == "Done":
            resolved = random_date_between(
                created + timedelta(days=1),
                min(sprint_end + timedelta(days=5), date(2026, 3, 20)),
            )
            updated = resolved

        # Due date (some issues have it, some don't)
        due_date = None
        if random.random() < 0.7:
            due_date = sprint_end + timedelta(days=random.randint(-3, 5))

        # Story points
        if issue_type in ("Story", "Bug", "Spike"):
            story_points = random.choice([1, 2, 3, 5, 8, 13])
        elif issue_type == "Task":
            story_points = random.choice([1, 2, 3, 5])
        else:
            story_points = random.choice([0, 1, 2])

        # Labels (1-3 random)
        num_labels = random.randint(1, 3)
        labels = ", ".join(random.sample(LABELS, num_labels))

        # Component
        component = random.choice(COMPONENTS)

        # Fix version
        fix_version = random.choice(FIX_VERSIONS) if random.random() < 0.6 else ""

        # Time tracking
        if status == "Done":
            estimate_hours = story_points * random.uniform(2, 6)
            time_spent = estimate_hours * random.uniform(0.7, 1.5)
        elif status == "In Progress":
            estimate_hours = story_points * random.uniform(2, 6)
            time_spent = estimate_hours * random.uniform(0.2, 0.6)
        else:
            estimate_hours = story_points * random.uniform(2, 6) if random.random() < 0.5 else 0
            time_spent = 0

        # Make some blocked items have no assignee for risk testing
        if status == "Blocked" and random.random() < 0.3:
            assignee = ""

        issues.append({
            "Issue Key": f"{PROJECT_KEY}-{i}",
            "Summary": summary,
            "Issue Type": issue_type,
            "Status": status,
            "Priority": priority,
            "Assignee": assignee,
            "Reporter": reporter,
            "Created": created,
            "Updated": updated,
            "Resolved": resolved,
            "Due Date": due_date,
            "Sprint": sprint,
            "Epic Link": epic,
            "Labels": labels,
            "Story Points": story_points,
            "Component/s": component,
            "Fix Version/s": fix_version,
            "Time Spent": round(time_spent, 1) if time_spent else "",
            "Original Estimate": round(estimate_hours, 1) if estimate_hours else "",
        })

    return issues


# ── Write Excel ────────────────────────────────────────────────────

def write_excel(issues: list[dict], path: str):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Jira Export"

    headers = list(issues[0].keys())
    ws.append(headers)

    # Style header row
    from openpyxl.styles import Font, PatternFill, Alignment

    header_fill = PatternFill(start_color="1E40AF", end_color="1E40AF", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True, size=11)
    for col_num, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    # Write data
    for issue in issues:
        row = []
        for h in headers:
            val = issue[h]
            if isinstance(val, date):
                row.append(val)
            elif val == "" or val is None:
                row.append(None)
            else:
                row.append(val)
        ws.append(row)

    # Auto-width columns
    for col in ws.columns:
        max_len = 0
        col_letter = col[0].column_letter
        for cell in col:
            if cell.value:
                max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = min(max_len + 2, 40)

    # Format date columns
    from openpyxl.styles import numbers
    date_cols = ["Created", "Updated", "Resolved", "Due Date"]
    for col_idx, h in enumerate(headers, 1):
        if h in date_cols:
            for row in range(2, len(issues) + 2):
                cell = ws.cell(row=row, column=col_idx)
                if cell.value:
                    cell.number_format = "YYYY-MM-DD"

    wb.save(path)
    print(f"Created: {path} ({len(issues)} issues)")


# ── Confluence OKR Content ─────────────────────────────────────────

CONFLUENCE_OKR_CONTENT = """# Q1 2026 Product OKRs - Project Spark

## Company Mission
Deliver a world-class project analytics platform that helps engineering teams
ship better software faster with data-driven insights.

---

## Objective 1: Accelerate Platform Adoption Across Enterprise Customers
Drive adoption of the Spark analytics platform to achieve market leadership
in the engineering intelligence space.

- KR 1: Increase monthly active enterprise accounts from 45 to 120 (55% progress)
- KR 2: Achieve Net Promoter Score (NPS) of 65+ across all customer segments (72% progress)
- KR 3: Reduce customer onboarding time from 14 days to 3 days (40% progress)
- KR 4: Launch self-serve trial flow with 25% conversion rate target (30% progress)

## Objective 2: Achieve Engineering Excellence and Platform Reliability
Ensure the platform is robust, performant, and delightful to use with
world-class engineering practices.

- KR 1: Maintain 99.95% uptime SLA across all services (98% progress)
- KR 2: Reduce average API response time to under 200ms (p95) (85% progress)
- KR 3: Achieve 90%+ unit test coverage across all microservices (76% progress)
- KR 4: Zero critical security vulnerabilities in production (100% progress)

## Objective 3: Build Next-Generation Analytics and Insights Engine
Create an AI-powered analytics engine that surfaces actionable insights
automatically from project data.

- KR 1: Launch predictive sprint completion model with 85% accuracy (45% progress)
- KR 2: Ship automated anomaly detection for cycle time regressions (60% progress)
- KR 3: Build natural language query interface for dashboard data (25% progress)
- KR 4: Deliver team health score algorithm validated by 10+ beta customers (35% progress)

## Objective 4: Expand Mobile Experience and Cross-Platform Reach
Deliver a seamless mobile experience that enables managers and leads to
stay informed on the go.

- KR 1: Launch iOS and Android apps with feature parity to web (70% progress)
- KR 2: Achieve 4.5+ star rating on both app stores (0% progress - not yet launched)
- KR 3: Enable push notification alerts for sprint anomalies and blockers (50% progress)
- KR 4: Support offline dashboard viewing with background sync (30% progress)

---

## Team Health Indicators

| Area | Status | Notes |
|------|--------|-------|
| Engineering Velocity | Green | Sprint velocity trending up 15% QoQ |
| Code Quality | Amber | Test coverage at 76%, target is 90% |
| Customer Satisfaction | Green | NPS at 68, exceeding target |
| Platform Reliability | Green | 99.97% uptime last 30 days |
| Security Posture | Green | SOC 2 Type II audit completed |
| Team Morale | Amber | Survey shows concern about on-call load |

## Key Risks and Mitigations

- **Risk**: Mobile app launch timeline slipping due to React Native performance issues
  - Mitigation: Evaluating Flutter as alternative; POC in progress
- **Risk**: Data pipeline modernization creating temporary data inconsistencies
  - Mitigation: Running old and new pipelines in parallel with reconciliation checks
- **Risk**: Single point of failure in authentication service
  - Mitigation: Active-active HA deployment planned for Sprint Q1-2

## Dependencies

- SSO integration depends on enterprise customer IT team availability
- Mobile app store review process (2-3 week lead time)
- Kafka cluster provisioning by DevOps team (in progress)
- Design system v2 delivery from UX team (75% complete)
"""


def write_confluence_content(path: str):
    with open(path, "w") as f:
        f.write(CONFLUENCE_OKR_CONTENT)
    print(f"Created: {path} ({len(CONFLUENCE_OKR_CONTENT)} chars)")


# ── Main ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    issues = generate_issues()
    excel_path = os.path.join(OUTPUT_DIR, "seed_jira_export.xlsx")
    write_excel(issues, excel_path)

    confluence_path = os.path.join(OUTPUT_DIR, "seed_confluence_okrs.txt")
    write_confluence_content(confluence_path)

    print(f"\nSeed data generated successfully!")
    print(f"  Issues: {len(issues)}")
    print(f"  Sprints: {len(SPRINTS)}")
    print(f"  Epics: {len(EPICS)}")
    print(f"  Team Members: {len(ASSIGNEES)}")
