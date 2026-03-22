#!/usr/bin/env python3
"""Comprehensive end-to-end test suite for HDP Spark.

Tests every API endpoint, validates data integrity, and checks edge cases.
Run with: python run_tests.py [BASE_URL]
"""

import json
import os
import sys
import traceback

import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
SEED_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(SEED_DIR, "seed_jira_export.xlsx")
CONFLUENCE_PATH = os.path.join(SEED_DIR, "seed_confluence_okrs.txt")

passed = 0
failed = 0
errors = []


def test(name, fn):
    global passed, failed
    try:
        fn()
        passed += 1
        print(f"  \033[32mPASS\033[0m  {name}")
    except AssertionError as e:
        failed += 1
        errors.append((name, str(e)))
        print(f"  \033[31mFAIL\033[0m  {name} — {e}")
    except Exception as e:
        failed += 1
        errors.append((name, traceback.format_exc()))
        print(f"  \033[31mERROR\033[0m {name} — {e}")


client = httpx.Client(base_url=BASE, timeout=30)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[1/7] HEALTH & PRE-UPLOAD CHECKS\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "healthy"
    assert d["service"] == "hdpspark"


def test_upload_status_empty():
    r = client.get("/api/upload/status")
    assert r.status_code == 200
    # May or may not have data depending on prior state


def test_dashboard_no_data():
    r = client.get("/api/dashboard/generate")
    assert r.status_code == 400
    assert "No data" in r.json()["detail"]


def test_analytics_no_data():
    r = client.get("/api/analytics/sprints")
    assert r.status_code == 400


test("Health check", test_health)
test("Upload status endpoint", test_upload_status_empty)
test("Dashboard rejects when no data", test_dashboard_no_data)
test("Analytics rejects when no data", test_analytics_no_data)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[2/7] UPLOAD VALIDATION\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def test_upload_bad_filetype():
    r = client.post("/api/upload/jira", files={"file": ("test.csv", b"a,b,c", "text/csv")})
    assert r.status_code == 400
    assert "Excel" in r.json()["detail"]


def test_upload_corrupt_file():
    r = client.post("/api/upload/jira", files={"file": ("bad.xlsx", b"not-an-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
    assert r.status_code == 422


test("Rejects non-Excel file", test_upload_bad_filetype)
test("Rejects corrupt Excel file", test_upload_corrupt_file)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[3/7] JIRA EXCEL UPLOAD\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

jira_data = None


def test_upload_jira():
    global jira_data
    with open(EXCEL_PATH, "rb") as f:
        r = client.post("/api/upload/jira", files={"file": ("seed.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
    assert r.status_code == 200
    jira_data = r.json()
    assert jira_data["total_issues"] == 100


def test_jira_column_detection():
    assert jira_data is not None
    cm = jira_data["column_mapping"]
    expected = ["key", "summary", "issue_type", "status", "priority", "assignee",
                "reporter", "created", "updated", "resolved", "due_date", "sprint",
                "epic", "labels", "story_points", "components", "fix_versions",
                "time_spent_hours", "original_estimate_hours"]
    for field in expected:
        assert field in cm, f"Missing column mapping: {field}"


def test_jira_sprints_detected():
    sprints = jira_data["detected_sprints"]
    assert len(sprints) == 5
    assert "Sprint 2025-Q4-1" in sprints
    assert "Sprint 2026-Q1-2" in sprints


def test_jira_epics_detected():
    epics = jira_data["detected_epics"]
    assert len(epics) == 4
    assert "User Authentication & SSO" in epics
    assert "Mobile App v2 Redesign" in epics


def test_jira_issue_integrity():
    issues = jira_data["issues"]
    keys = [i["key"] for i in issues]
    assert len(set(keys)) == 100, "Duplicate or missing keys"
    assert "SPARK-1" in keys
    assert "SPARK-100" in keys

    # Spot check first issue
    i1 = next(i for i in issues if i["key"] == "SPARK-1")
    assert i1["summary"] != ""
    assert i1["issue_type"] != ""
    assert i1["status"] != ""
    assert i1["sprint"] != ""
    assert i1["epic"] != ""


def test_jira_dates_parsed():
    issues = jira_data["issues"]
    issues_with_created = [i for i in issues if i["created"]]
    assert len(issues_with_created) == 100, "All issues should have created date"
    resolved = [i for i in issues if i["resolved"]]
    assert len(resolved) > 0, "Some issues should be resolved"


def test_jira_story_points():
    issues = jira_data["issues"]
    sp = [i["story_points"] for i in issues]
    assert all(isinstance(p, (int, float)) for p in sp)
    total = sum(sp)
    assert total > 0, "Total story points should be > 0"


def test_upload_status_after():
    r = client.get("/api/upload/status")
    assert r.status_code == 200
    d = r.json()
    assert d["has_data"] is True
    assert d["total_issues"] == 100


test("Upload seed Jira Excel (100 issues)", test_upload_jira)
test("Column auto-detection (19 fields)", test_jira_column_detection)
test("Sprint detection (5 sprints)", test_jira_sprints_detected)
test("Epic detection (4 epics)", test_jira_epics_detected)
test("Issue data integrity (100 unique keys)", test_jira_issue_integrity)
test("Date parsing (created/resolved)", test_jira_dates_parsed)
test("Story points parsed as numbers", test_jira_story_points)
test("Upload status reflects data", test_upload_status_after)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[4/7] CONFLUENCE & OKR PARSING\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

confluence_data = None


def test_confluence_no_input():
    r = client.post("/api/confluence/parse", json={})
    assert r.status_code == 400


def test_confluence_empty_text():
    r = client.post("/api/confluence/parse", json={"raw_text": "   "})
    assert r.status_code == 422


def test_confluence_parse():
    global confluence_data
    text = open(CONFLUENCE_PATH).read()
    r = client.post("/api/confluence/parse", json={"raw_text": text})
    assert r.status_code == 200
    confluence_data = r.json()
    assert confluence_data["text_length"] > 1000
    assert confluence_data["okrs_found"] == 4


def test_okr_structure():
    okrs = confluence_data["okrs"]
    assert len(okrs) == 4

    # Objective 1: Platform Adoption
    o1 = okrs[0]
    assert "Adoption" in o1["objective"] or "Platform" in o1["objective"]
    assert len(o1["key_results"]) == 4
    assert o1["health"] == "amber"
    assert 40 <= o1["confidence"] <= 60

    # Objective 2: Engineering Excellence
    o2 = okrs[1]
    assert len(o2["key_results"]) == 4
    assert o2["health"] == "green"
    assert o2["confidence"] > 80

    # Objective 3: Analytics Engine
    o3 = okrs[2]
    assert len(o3["key_results"]) == 4
    assert o3["health"] == "amber"

    # Objective 4: Mobile (should be red, lower confidence)
    o4 = okrs[3]
    assert len(o4["key_results"]) == 4
    assert o4["health"] == "red"


def test_kr_progress_extraction():
    okrs = confluence_data["okrs"]
    # O1 KR1 should have 55% progress
    kr1 = okrs[0]["key_results"][0]
    assert kr1["progress_pct"] == 55.0, f"Expected 55%, got {kr1['progress_pct']}"

    # O2 KR4 should have 100%
    kr4 = okrs[1]["key_results"][3]
    assert kr4["progress_pct"] == 100.0


def test_okr_endpoint():
    r = client.get("/api/confluence/okrs")
    assert r.status_code == 200
    d = r.json()
    assert len(d["okrs"]) == 4


test("Rejects empty input", test_confluence_no_input)
test("Rejects blank text", test_confluence_empty_text)
test("Parse Confluence OKR content", test_confluence_parse)
test("OKR structure (4 objectives, 4 KRs each)", test_okr_structure)
test("KR progress % extraction", test_kr_progress_extraction)
test("GET /confluence/okrs endpoint", test_okr_endpoint)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[5/7] DASHBOARD GENERATION\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dashboard = None


def test_dashboard_generate():
    global dashboard
    r = client.get("/api/dashboard/generate")
    assert r.status_code == 200
    dashboard = r.json()
    assert "kpi_summary" in dashboard
    assert "sprint_metrics" in dashboard
    assert "team_metrics" in dashboard
    assert "epic_progress" in dashboard
    assert "risk_items" in dashboard
    assert "okrs" in dashboard
    assert "flow_metrics" in dashboard
    assert "issue_type_distribution" in dashboard
    assert "priority_distribution" in dashboard
    assert "status_distribution" in dashboard
    assert "label_cloud" in dashboard
    assert "weekly_throughput" in dashboard
    assert "cycle_time_distribution" in dashboard


def test_kpi_summary():
    kpi = dashboard["kpi_summary"]
    assert kpi["total_issues"] == 100
    assert kpi["done_issues"] + kpi["open_issues"] == 100
    assert kpi["done_issues"] > 0
    assert kpi["open_issues"] > 0
    assert kpi["avg_cycle_time_days"] > 0
    assert kpi["avg_lead_time_days"] > 0
    assert kpi["throughput_per_week"] > 0
    assert 0 < kpi["defect_density"] < 1
    assert kpi["story_points_total"] > 0
    assert kpi["story_points_done"] > 0
    assert kpi["story_points_done"] <= kpi["story_points_total"]
    assert kpi["health_score"] in ("green", "amber", "red")
    assert len(kpi["sprint_velocity_trend"]) == 5


def test_sprint_metrics():
    sprints = dashboard["sprint_metrics"]
    assert len(sprints) == 5
    total_sprint_issues = sum(s["total_issues"] for s in sprints)
    assert total_sprint_issues == 100

    for s in sprints:
        assert s["sprint_name"] != ""
        assert s["total_issues"] > 0
        assert s["completed"] <= s["total_issues"]
        assert s["carry_over"] == s["total_issues"] - s["completed"]
        assert 0 <= s["completion_rate"] <= 100
        assert s["velocity"] >= 0
        assert s["planned_points"] >= s["completed_points"]


def test_team_metrics():
    team = dashboard["team_metrics"]
    assert len(team) == 8
    for m in team:
        assert m["name"] != ""
        assert m["issues_assigned"] > 0
        assert m["issues_completed"] <= m["issues_assigned"]
        assert m["story_points_completed"] >= 0
        assert m["avg_cycle_time_days"] >= 0


def test_epic_progress():
    epics = dashboard["epic_progress"]
    assert len(epics) == 4
    for e in epics:
        assert e["epic_name"] != ""
        assert e["total_issues"] > 0
        assert e["done"] + e["in_progress"] + e["todo"] == e["total_issues"]
        assert 0 <= e["progress_pct"] <= 100
        assert e["health"] in ("green", "amber", "red")
        assert e["story_points_done"] <= e["story_points_total"]


def test_risk_items():
    risks = dashboard["risk_items"]
    assert len(risks) > 0
    valid_types = {"overdue", "blocked", "no_assignee", "stale", "large_unestimated"}
    valid_sev = {"high", "medium", "low"}
    for r in risks:
        assert r["issue_key"].startswith("SPARK-")
        assert r["risk_type"] in valid_types
        assert r["severity"] in valid_sev
        assert r["days_at_risk"] >= 0

    # Should be sorted by severity
    sev_order = {"high": 0, "medium": 1, "low": 2}
    for i in range(len(risks) - 1):
        assert sev_order[risks[i]["severity"]] <= sev_order[risks[i + 1]["severity"]]


def test_okrs_in_dashboard():
    okrs = dashboard["okrs"]
    assert len(okrs) == 4


def test_flow_metrics():
    flow = dashboard["flow_metrics"]
    assert len(flow) > 0
    for f in flow:
        assert f["date"] != ""
        assert f["todo"] >= 0
        assert f["in_progress"] >= 0
        assert f["done"] >= 0

    # Should be cumulative (non-decreasing totals)
    for i in range(1, len(flow)):
        total_prev = flow[i - 1]["todo"] + flow[i - 1]["in_progress"] + flow[i - 1]["done"]
        total_curr = flow[i]["todo"] + flow[i]["in_progress"] + flow[i]["done"]
        assert total_curr >= total_prev, "Flow metrics should be cumulative"


def test_distributions():
    types = dashboard["issue_type_distribution"]
    assert sum(types.values()) == 100
    assert "Story" in types
    assert "Bug" in types

    priorities = dashboard["priority_distribution"]
    assert sum(priorities.values()) == 100
    assert "High" in priorities

    statuses = dashboard["status_distribution"]
    assert sum(statuses.values()) == 100
    assert "Done" in statuses


def test_label_cloud():
    labels = dashboard["label_cloud"]
    assert len(labels) > 0
    assert all(isinstance(v, int) and v > 0 for v in labels.values())


def test_weekly_throughput():
    weekly = dashboard["weekly_throughput"]
    assert len(weekly) > 0
    for w in weekly:
        assert "week" in w
        assert "count" in w
        assert w["count"] > 0


def test_cycle_time_distribution():
    ct = dashboard["cycle_time_distribution"]
    assert len(ct) > 0
    # Should be sorted
    for i in range(1, len(ct)):
        assert ct[i] >= ct[i - 1], "Cycle times should be sorted"


test("Generate full dashboard", test_dashboard_generate)
test("KPI summary (totals, rates, health)", test_kpi_summary)
test("Sprint metrics (5 sprints, carry-over)", test_sprint_metrics)
test("Team metrics (8 members, cycle times)", test_team_metrics)
test("Epic progress (4 epics, health)", test_epic_progress)
test("Risk items (sorted by severity)", test_risk_items)
test("OKRs present in dashboard", test_okrs_in_dashboard)
test("Flow metrics (cumulative, non-decreasing)", test_flow_metrics)
test("Distributions (types+priorities+statuses=100)", test_distributions)
test("Label cloud populated", test_label_cloud)
test("Weekly throughput data", test_weekly_throughput)
test("Cycle time distribution (sorted)", test_cycle_time_distribution)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[6/7] ANALYTICS ENDPOINTS\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def test_analytics_sprints():
    r = client.get("/api/analytics/sprints")
    assert r.status_code == 200
    d = r.json()
    assert len(d["sprints"]) == 5


def test_analytics_team():
    r = client.get("/api/analytics/team")
    assert r.status_code == 200
    d = r.json()
    assert len(d["team"]) == 8


def test_analytics_epics():
    r = client.get("/api/analytics/epics")
    assert r.status_code == 200
    d = r.json()
    assert len(d["epics"]) == 4


def test_analytics_risks():
    r = client.get("/api/analytics/risks")
    assert r.status_code == 200
    d = r.json()
    assert d["total_risks"] > 0
    assert d["high_severity"] >= 0
    assert isinstance(d["by_type"], dict)


def test_analytics_flow():
    r = client.get("/api/analytics/flow")
    assert r.status_code == 200
    d = r.json()
    assert len(d["flow"]) > 0


def test_analytics_throughput():
    r = client.get("/api/analytics/throughput")
    assert r.status_code == 200
    d = r.json()
    assert len(d["throughput"]) > 0


def test_analytics_cycle_time():
    r = client.get("/api/analytics/cycle-time")
    assert r.status_code == 200
    d = r.json()
    assert d["count"] > 0
    assert d["average"] > 0
    assert d["median"] > 0
    assert d["p85"] >= d["median"]
    assert d["p95"] >= d["p85"]


def test_filter_options():
    r = client.get("/api/analytics/filter-options")
    assert r.status_code == 200
    d = r.json()
    assert len(d["sprints"]) == 5
    assert len(d["epics"]) == 4
    assert len(d["assignees"]) == 8
    assert "Done" in d["statuses"]
    assert len(d["priorities"]) > 0
    assert len(d["issue_types"]) > 0


test("GET /analytics/sprints", test_analytics_sprints)
test("GET /analytics/team", test_analytics_team)
test("GET /analytics/epics", test_analytics_epics)
test("GET /analytics/risks", test_analytics_risks)
test("GET /analytics/flow", test_analytics_flow)
test("GET /analytics/throughput", test_analytics_throughput)
test("GET /analytics/cycle-time (avg/median/p85/p95)", test_analytics_cycle_time)
test("GET /analytics/filter-options", test_filter_options)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print("\n\033[1m[7/7] DASHBOARD SUMMARY\033[0m")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


def test_dashboard_summary():
    r = client.get("/api/dashboard/summary")
    assert r.status_code == 200
    d = r.json()
    assert d["has_data"] is True
    assert d["total_issues"] == 100
    assert len(d["sprints"]) == 5
    assert len(d["epics"]) == 4
    assert d["okrs_count"] == 4
    assert len(d["columns_detected"]) >= 15


test("GET /dashboard/summary", test_dashboard_summary)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RESULTS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
print(f"\n{'='*50}")
print(f"\033[1mRESULTS: {passed} passed, {failed} failed, {passed + failed} total\033[0m")
if errors:
    print(f"\n\033[31mFailed tests:\033[0m")
    for name, err in errors:
        print(f"  - {name}: {err[:120]}")
print(f"{'='*50}\n")

sys.exit(0 if failed == 0 else 1)
