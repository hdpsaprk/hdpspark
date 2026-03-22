#!/usr/bin/env python3
"""Generate a self-contained HTML dashboard from seed data."""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.engines.jira_parser import parse_jira_excel
from app.engines.okr_extractor import extract_okrs
from app.engines.analytics_engine import compute_dashboard

SEED_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(SEED_DIR, "seed_jira_export.xlsx")
CONFLUENCE_PATH = os.path.join(SEED_DIR, "seed_confluence_okrs.txt")
OUTPUT_PATH = os.path.join(SEED_DIR, "dashboard_report.html")


def main():
    print("Parsing Jira Excel...")
    with open(EXCEL_PATH, "rb") as f:
        dataset = parse_jira_excel(f.read())
    print(f"  {dataset.total_issues} issues loaded")

    print("Parsing Confluence OKRs...")
    with open(CONFLUENCE_PATH) as f:
        okrs = extract_okrs(f.read())
    print(f"  {len(okrs)} OKRs extracted")

    print("Computing dashboard...")
    dashboard = compute_dashboard(dataset, okrs=okrs)
    data = json.loads(dashboard.model_dump_json())

    html = build_html(data)
    with open(OUTPUT_PATH, "w") as f:
        f.write(html)
    print(f"\nDashboard saved to: {OUTPUT_PATH}")


# ── HTML helpers ──

def health_color(h):
    return {"green": "#10b981", "amber": "#f59e0b", "red": "#ef4444"}.get(h, "#f59e0b")

def health_label(h):
    return {"green": "Healthy", "amber": "At Risk", "red": "Critical"}.get(h, "At Risk")

def health_grade(h):
    return {"green": "A", "amber": "B", "red": "C"}.get(h, "B")

def health_badge_bg(h):
    m = {"green": "rgba(16,185,129,0.15);color:#34d399",
         "amber": "rgba(245,158,11,0.15);color:#fbbf24",
         "red": "rgba(239,68,68,0.15);color:#f87171"}
    return m.get(h, m["amber"])

def sev_class(s):
    return "text-red" if s == "high" else "text-amber" if s == "medium" else "text-gray"

CHART_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899','#6366f1','#14b8a6','#f97316','#06b6d4']


def build_status_pills(status_dist):
    parts = []
    for i, (k, v) in enumerate(status_dist.items()):
        c = CHART_COLORS[i % len(CHART_COLORS)]
        parts.append(f'<div class="status-pill" style="flex:1;min-width:100px">'
                     f'<div class="value" style="color:{c}">{v}</div>'
                     f'<div class="label">{k}</div></div>')
    return "\n".join(parts)


def build_sprint_rows(sprints):
    rows = []
    for s in sprints:
        cr = s["completion_rate"]
        cls = "text-green" if cr >= 70 else "text-amber" if cr >= 50 else "text-red"
        rows.append(
            f'<tr><td>{s["sprint_name"]}</td>'
            f'<td class="text-right">{s["total_issues"]}</td>'
            f'<td class="text-right text-green">{s["completed"]}</td>'
            f'<td class="text-right text-amber">{s["carry_over"]}</td>'
            f'<td class="text-right text-blue">{s["velocity"]}</td>'
            f'<td class="text-right {cls}">{cr}%</td></tr>'
        )
    return "\n".join(rows)


def build_team_rows(team):
    rows = []
    for m in team:
        rows.append(
            f'<tr><td>{m["name"]}</td>'
            f'<td class="text-right">{m["issues_assigned"]}</td>'
            f'<td class="text-right text-green">{m["issues_completed"]}</td>'
            f'<td class="text-right text-blue">{m["story_points_completed"]}</td>'
            f'<td class="text-right text-purple">{m["avg_cycle_time_days"]}d</td>'
            f'<td class="text-right text-amber">{m["bugs_raised"]}</td>'
            f'<td class="text-right text-red">{m["blockers"]}</td></tr>'
        )
    return "\n".join(rows)


def build_epic_cards(epics):
    cards = []
    for e in epics:
        hc = health_color(e["health"])
        hb = health_badge_bg(e["health"])
        cards.append(
            f'<div class="card">'
            f'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
            f'<span style="font-weight:600;font-size:13px;">{e["epic_name"][:30]}</span>'
            f'<span class="health" style="background:{hb}">{e["health"].title()}</span></div>'
            f'<div class="progress-bar"><div class="progress-fill" style="width:{e["progress_pct"]}%;background:{hc}"></div></div>'
            f'<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:12px;">'
            f'<span class="text-green">{e["done"]} done</span>'
            f'<span class="text-blue">{e["in_progress"]} in prog</span>'
            f'<span class="text-gray">{e["todo"]} todo</span></div>'
            f'<div style="margin-top:8px;padding-top:8px;border-top:1px solid #1f2937;font-size:11px;color:#6b7280;display:flex;justify-content:space-between;">'
            f'<span>SP: {e["story_points_done"]}/{e["story_points_total"]}</span>'
            f'<span>{e["progress_pct"]}%</span></div></div>'
        )
    return "\n".join(cards)


def build_risk_categories(risks):
    by_type = {}
    for r in risks:
        by_type[r["risk_type"]] = by_type.get(r["risk_type"], 0) + 1
    parts = []
    for t, c in by_type.items():
        parts.append(
            f'<div style="display:flex;align-items:center;gap:6px;background:rgba(31,41,55,0.5);'
            f'border-radius:8px;padding:8px 14px;font-size:13px;">'
            f'<span style="text-transform:capitalize">{t.replace("_"," ")}</span>'
            f'<span style="background:#374151;padding:2px 8px;border-radius:10px;font-size:11px;">{c}</span></div>'
        )
    return "\n".join(parts)


def build_risk_rows(risks, limit=30):
    rows = []
    for r in risks[:limit]:
        rows.append(
            f'<tr><td class="font-mono text-blue">{r["issue_key"]}</td>'
            f'<td style="max-width:350px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{r["summary"]}</td>'
            f'<td style="text-transform:capitalize;font-size:12px">{r["risk_type"].replace("_"," ")}</td>'
            f'<td class="text-center"><span class="badge badge-{r["severity"]}">{r["severity"]}</span></td>'
            f'<td class="text-right">{r["days_at_risk"]}d</td></tr>'
        )
    return "\n".join(rows)


def build_okr_cards(okrs):
    cards = []
    for i, o in enumerate(okrs):
        hc = health_color(o["health"])
        hb = health_badge_bg(o["health"])
        kr_html = []
        for ki, kr in enumerate(o["key_results"]):
            pct = min(kr["progress_pct"], 100)
            kr_html.append(
                f'<div class="kr-item">'
                f'<div class="kr-num">{ki+1}</div>'
                f'<div style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{kr["description"]}</div>'
                f'<div class="kr-bar"><div class="progress-bar" style="height:6px;">'
                f'<div class="progress-fill" style="width:{pct}%;background:#8b5cf6"></div></div></div>'
                f'<div class="kr-pct">{round(kr["progress_pct"])}%</div></div>'
            )
        krs = "\n".join(kr_html)
        cards.append(
            f'<div class="card" style="margin-bottom:12px;">'
            f'<div class="okr-card" style="border-color:{hc}">'
            f'<div style="display:flex;justify-content:space-between;align-items:center;">'
            f'<div class="obj"><span style="color:#60a5fa;margin-right:8px;">O{i+1}</span>{o["objective"]}</div>'
            f'<div style="display:flex;align-items:center;gap:8px;">'
            f'<span class="health" style="background:{hb}">{o["health"].title()}</span>'
            f'<span style="color:#6b7280;font-size:13px;">{round(o["confidence"])}%</span></div></div>'
            f'<div class="progress-bar" style="margin:10px 0;height:4px;">'
            f'<div class="progress-fill" style="width:{o["confidence"]}%;background:{hc}"></div></div>'
            f'{krs}</div></div>'
        )
    return "\n".join(cards)


def build_label_cloud(labels):
    parts = []
    for l, c in sorted(labels.items(), key=lambda x: -x[1]):
        parts.append(f'<span class="label-tag">{l} ({c})</span>')
    return "\n".join(parts)


def build_html(data):
    kpi = data["kpi_summary"]
    sprints = data["sprint_metrics"]
    team = data["team_metrics"]
    epics = data["epic_progress"]
    risks = data["risk_items"]
    okrs = data["okrs"]
    flow = data["flow_metrics"]
    types_dist = data["issue_type_distribution"]
    priority_dist = data["priority_distribution"]
    status_dist = data["status_distribution"]
    weekly = data["weekly_throughput"]
    cycle_times = data["cycle_time_distribution"]
    labels = data["label_cloud"]

    hc = health_color(kpi["health_score"])
    hl = health_label(kpi["health_score"])
    hg = health_grade(kpi["health_score"])

    risk_high = len([r for r in risks if r["severity"] == "high"])
    risk_med = len([r for r in risks if r["severity"] == "medium"])
    risk_low = len([r for r in risks if r["severity"] == "low"])

    compl_pct = round(kpi["done_issues"] / kpi["total_issues"] * 100) if kpi["total_issues"] else 0
    ct_median = cycle_times[len(cycle_times)//2] if cycle_times else 0
    ct_p85 = cycle_times[int(len(cycle_times)*0.85)] if cycle_times else 0
    ct_p95 = cycle_times[int(len(cycle_times)*0.95)] if cycle_times else 0
    avg_conf = round(sum(o["confidence"] for o in okrs) / len(okrs)) if okrs else 0
    total_krs = sum(len(o["key_results"]) for o in okrs)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HDP Spark Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:#0a0f1e;color:#e5e7eb;line-height:1.5}}
.container{{max-width:1400px;margin:0 auto;padding:16px}}
header{{background:linear-gradient(135deg,#1e3a8a 0%,#581c87 100%);padding:24px 32px;border-radius:14px;margin-bottom:20px}}
header h1{{font-size:24px;font-weight:700}} header h1 span{{background:linear-gradient(90deg,#93c5fd,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}}
header p{{color:#94a3b8;font-size:13px}}
.grid{{display:grid;gap:14px;margin-bottom:14px}}
.grid-6{{grid-template-columns:repeat(6,1fr)}} .grid-4{{grid-template-columns:repeat(4,1fr)}}
.grid-3{{grid-template-columns:repeat(3,1fr)}} .grid-2{{grid-template-columns:repeat(2,1fr)}}
@media(max-width:1200px){{.grid-6{{grid-template-columns:repeat(3,1fr)}}}}
@media(max-width:768px){{.grid-6,.grid-4,.grid-3,.grid-2{{grid-template-columns:1fr}}}}
.card{{background:rgba(17,24,39,0.7);border:1px solid #1f2937;border-radius:12px;padding:18px}}
.card h3{{font-size:14px;font-weight:600;color:#d1d5db;margin-bottom:14px}}
.kpi{{text-align:center;padding:14px;border-radius:12px}}
.kpi .value{{font-size:26px;font-weight:700}} .kpi .label{{font-size:11px;color:#9ca3af;margin-top:3px}}
.kpi-blue{{background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2)}} .kpi-blue .value{{color:#60a5fa}}
.kpi-green{{background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2)}} .kpi-green .value{{color:#34d399}}
.kpi-amber{{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2)}} .kpi-amber .value{{color:#fbbf24}}
.kpi-red{{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2)}} .kpi-red .value{{color:#f87171}}
.kpi-purple{{background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2)}} .kpi-purple .value{{color:#a78bfa}}
.kpi-teal{{background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.2)}} .kpi-teal .value{{color:#2dd4bf}}
.health{{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}}
.section{{margin-top:28px;margin-bottom:14px;font-size:18px;font-weight:700;color:#f3f4f6;border-bottom:2px solid #1f2937;padding-bottom:6px}}
table{{width:100%;border-collapse:collapse;font-size:12px}}
th{{text-align:left;padding:7px 10px;color:#9ca3af;font-weight:500;border-bottom:1px solid #1f2937}}
td{{padding:7px 10px;border-bottom:1px solid rgba(31,41,55,0.5)}} tr:hover{{background:rgba(31,41,55,0.3)}}
.text-right{{text-align:right}} .text-center{{text-align:center}}
.text-green{{color:#34d399}} .text-amber{{color:#fbbf24}} .text-red{{color:#f87171}}
.text-blue{{color:#60a5fa}} .text-purple{{color:#a78bfa}} .text-gray{{color:#9ca3af}}
.font-mono{{font-family:'SF Mono',monospace;font-size:11px}}
.progress-bar{{width:100%;height:8px;background:#1f2937;border-radius:4px;overflow:hidden}}
.progress-fill{{height:100%;border-radius:4px}}
.okr-card{{border-left:4px solid;padding-left:14px;margin-bottom:16px}}
.okr-card .obj{{font-size:15px;font-weight:600;margin-bottom:6px}}
.kr-item{{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px}}
.kr-num{{width:20px;height:20px;border-radius:4px;background:rgba(139,92,246,0.2);color:#a78bfa;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}}
.kr-bar{{width:70px;flex-shrink:0}} .kr-pct{{width:36px;text-align:right;color:#9ca3af;font-size:11px;flex-shrink:0}}
.badge{{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:500}}
.badge-high{{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}}
.badge-medium{{background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)}}
.badge-low{{background:rgba(107,114,128,0.15);color:#9ca3af;border:1px solid rgba(107,114,128,0.3)}}
.chart-container{{position:relative;height:260px}}
.chart-sm{{height:200px}}
.status-pill{{text-align:center;padding:10px;background:rgba(31,41,55,0.5);border-radius:8px}}
.status-pill .value{{font-size:22px;font-weight:700}} .status-pill .label{{font-size:10px;color:#9ca3af}}
.label-cloud{{display:flex;flex-wrap:wrap;gap:6px}}
.label-tag{{padding:4px 10px;border-radius:6px;font-size:11px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.25);color:#a5b4fc}}
</style>
</head>
<body>
<div class="container">

<header>
  <h1><span>HDP Spark</span> Dashboard Report</h1>
  <p>Jira &amp; Confluence Analytics &bull; {kpi["total_issues"]} Issues &bull; {len(sprints)} Sprints &bull; {len(epics)} Epics &bull; {len(team)} Team Members &bull; {len(okrs)} OKRs</p>
</header>

<!-- KPIs -->
<div class="grid grid-6">
  <div class="kpi kpi-blue"><div class="value">{kpi["total_issues"]}</div><div class="label">Total Issues</div></div>
  <div class="kpi kpi-green"><div class="value">{kpi["done_issues"]}</div><div class="label">Completed ({compl_pct}%)</div></div>
  <div class="kpi kpi-amber"><div class="value">{kpi["open_issues"]}</div><div class="label">Open</div></div>
  <div class="kpi kpi-red"><div class="value">{kpi["blocker_count"]}</div><div class="label">Blockers</div></div>
  <div class="kpi kpi-purple"><div class="value">{kpi["avg_cycle_time_days"]}d</div><div class="label">Avg Cycle Time</div></div>
  <div class="kpi kpi-teal"><div class="value">{kpi["throughput_per_week"]}</div><div class="label">Throughput/wk</div></div>
</div>

<!-- Health + Charts -->
<div class="grid grid-3">
  <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
    <div style="width:72px;height:72px;border-radius:50%;background:{hc};display:flex;align-items:center;justify-content:center;box-shadow:0 0 25px {hc}40;"><span style="color:white;font-size:22px;font-weight:700;">{hg}</span></div>
    <div style="margin-top:10px;font-size:15px;font-weight:600;color:{hc}">{hl}</div>
    <div style="font-size:11px;color:#6b7280;">Project Health</div>
    <div style="display:flex;gap:20px;margin-top:14px;">
      <div style="text-align:center"><div style="font-size:18px;font-weight:700;color:#60a5fa">{kpi["story_points_done"]}</div><div style="font-size:10px;color:#6b7280">SP Done</div></div>
      <div style="text-align:center"><div style="font-size:18px;font-weight:700;color:#6b7280">{kpi["story_points_total"]}</div><div style="font-size:10px;color:#6b7280">SP Total</div></div>
    </div>
    <div style="margin-top:10px;font-size:11px;color:#6b7280;">Defect Density: {kpi["defect_density"]} &bull; Overdue: {kpi["overdue_count"]}</div>
  </div>
  <div class="card"><h3>Issue Types</h3><div class="chart-container chart-sm"><canvas id="typeChart"></canvas></div></div>
  <div class="card"><h3>Priority Breakdown</h3><div class="chart-container chart-sm"><canvas id="priorityChart"></canvas></div></div>
</div>

<!-- Status -->
<div class="card" style="margin-bottom:14px"><h3>Status Overview</h3><div style="display:flex;gap:10px;flex-wrap:wrap;">{build_status_pills(status_dist)}</div></div>

<!-- Sprints -->
<h2 class="section">Sprint Analytics</h2>
<div class="grid grid-2">
  <div class="card"><h3>Sprint Velocity Trend</h3><div class="chart-container"><canvas id="velocityChart"></canvas></div></div>
  <div class="card"><h3>Weekly Throughput</h3><div class="chart-container"><canvas id="throughputChart"></canvas></div></div>
</div>
<div class="grid grid-2">
  <div class="card"><h3>Completion Rate</h3><div class="chart-container"><canvas id="completionChart"></canvas></div></div>
  <div class="card"><h3>Planned vs Completed (SP)</h3><div class="chart-container"><canvas id="plannedVsCompChart"></canvas></div></div>
</div>
<div class="card"><h3>Sprint Details</h3>
<table><thead><tr><th>Sprint</th><th class="text-right">Total</th><th class="text-right">Done</th><th class="text-right">Carry Over</th><th class="text-right">Velocity</th><th class="text-right">Completion</th></tr></thead>
<tbody>{build_sprint_rows(sprints)}</tbody></table></div>

<!-- Team -->
<h2 class="section">Team Performance</h2>
<div class="grid grid-2">
  <div class="card"><h3>Workload Distribution</h3><div class="chart-container"><canvas id="teamWorkloadChart"></canvas></div></div>
  <div class="card"><h3>Story Points Delivered</h3><div class="chart-container"><canvas id="teamSPChart"></canvas></div></div>
</div>
<div class="card"><h3>Team Summary</h3>
<table><thead><tr><th>Member</th><th class="text-right">Assigned</th><th class="text-right">Completed</th><th class="text-right">SP Done</th><th class="text-right">Avg Cycle</th><th class="text-right">Bugs</th><th class="text-right">Blockers</th></tr></thead>
<tbody>{build_team_rows(team)}</tbody></table></div>

<!-- Epics -->
<h2 class="section">Epic Progress</h2>
<div class="card" style="margin-bottom:14px"><h3>Epic Progress Overview</h3><div class="chart-container"><canvas id="epicChart"></canvas></div></div>
<div class="grid grid-4">{build_epic_cards(epics)}</div>

<!-- Flow -->
<h2 class="section">Flow Metrics</h2>
<div class="grid grid-2">
  <div class="card"><h3>Cumulative Flow Diagram</h3><div class="chart-container"><canvas id="flowChart"></canvas></div></div>
  <div class="card"><h3>Cycle Time Distribution</h3><div class="chart-container"><canvas id="cycleChart"></canvas></div>
    <div style="margin-top:6px;font-size:11px;color:#6b7280;">Median: {ct_median}d &bull; P85: {ct_p85}d &bull; P95: {ct_p95}d &bull; n={len(cycle_times)}</div></div>
</div>

<!-- Risks -->
<h2 class="section">Risk Analysis</h2>
<div class="grid grid-4" style="margin-bottom:14px">
  <div class="kpi kpi-red"><div class="value">{len(risks)}</div><div class="label">Total Risks</div></div>
  <div class="kpi kpi-red"><div class="value">{risk_high}</div><div class="label">High Severity</div></div>
  <div class="kpi kpi-amber"><div class="value">{risk_med}</div><div class="label">Medium</div></div>
  <div class="kpi" style="background:rgba(107,114,128,0.1);border:1px solid rgba(107,114,128,0.2)"><div class="value" style="color:#9ca3af">{risk_low}</div><div class="label">Low</div></div>
</div>
<div class="card" style="margin-bottom:14px"><h3>Risk Categories</h3><div style="display:flex;gap:10px;flex-wrap:wrap;">{build_risk_categories(risks)}</div></div>
<div class="card"><h3>Risk Register (Top 30)</h3>
<table><thead><tr><th>Issue</th><th>Summary</th><th>Type</th><th class="text-center">Severity</th><th class="text-right">Days</th></tr></thead>
<tbody>{build_risk_rows(risks)}</tbody></table></div>

<!-- OKRs -->
<h2 class="section">OKR Tracker</h2>
<div class="grid grid-3" style="margin-bottom:14px">
  <div class="kpi kpi-blue"><div class="value">{len(okrs)}</div><div class="label">Objectives</div></div>
  <div class="kpi kpi-purple"><div class="value">{total_krs}</div><div class="label">Key Results</div></div>
  <div class="kpi kpi-green"><div class="value">{avg_conf}%</div><div class="label">Avg Confidence</div></div>
</div>
{build_okr_cards(okrs)}

<!-- Labels -->
<div class="card" style="margin-top:14px"><h3>Label Cloud</h3><div class="label-cloud">{build_label_cloud(labels)}</div></div>

<div style="text-align:center;margin-top:28px;padding:14px;color:#4b5563;font-size:11px;">HDP Spark Dashboard &bull; Generated from seed data</div>
</div>

<script>
Chart.defaults.color='#9ca3af';
Chart.defaults.plugins.legend.labels.boxWidth=12;
Chart.defaults.plugins.legend.labels.padding=12;
Chart.defaults.elements.arc.borderWidth=0;
const C=['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#ec4899','#6366f1','#14b8a6','#f97316','#06b6d4'];
const gs={{color:'#1f293744'}};
const ng={{display:false}};

new Chart(document.getElementById('typeChart'),{{type:'doughnut',data:{{labels:{json.dumps(list(types_dist.keys()))},datasets:[{{data:{json.dumps(list(types_dist.values()))},backgroundColor:C}}]}},options:{{responsive:true,maintainAspectRatio:false,plugins:{{legend:{{position:'bottom'}}}}}}}});

new Chart(document.getElementById('priorityChart'),{{type:'bar',data:{{labels:{json.dumps(list(priority_dist.keys()))},datasets:[{{data:{json.dumps(list(priority_dist.values()))},backgroundColor:C,borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{{legend:ng}},scales:{{x:{{grid:gs}},y:{{grid:ng}}}}}}}});

new Chart(document.getElementById('velocityChart'),{{type:'line',data:{{labels:{json.dumps([s['sprint_name'] for s in sprints])},datasets:[{{label:'Velocity (SP)',data:{json.dumps([s['velocity'] for s in sprints])},borderColor:'#3b82f6',backgroundColor:'#3b82f640',fill:true,tension:0.3}},{{label:'Issues Done',data:{json.dumps([s['completed'] for s in sprints])},borderColor:'#10b981',borderDash:[5,5],tension:0.3}}]}},options:{{responsive:true,maintainAspectRatio:false,scales:{{x:{{grid:gs}},y:{{grid:gs}}}}}}}});

new Chart(document.getElementById('throughputChart'),{{type:'bar',data:{{labels:{json.dumps([w['week'] for w in weekly])},datasets:[{{label:'Resolved',data:{json.dumps([w['count'] for w in weekly])},backgroundColor:'#8b5cf680',borderColor:'#8b5cf6',borderWidth:1,borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,plugins:{{legend:ng}},scales:{{x:{{grid:gs,ticks:{{maxRotation:45}}}},y:{{grid:gs}}}}}}}});

new Chart(document.getElementById('completionChart'),{{type:'bar',data:{{labels:{json.dumps([s['sprint_name'] for s in sprints])},datasets:[{{label:'Completion %',data:{json.dumps([s['completion_rate'] for s in sprints])},backgroundColor:'#10b98180',borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,plugins:{{legend:ng}},scales:{{x:{{grid:gs}},y:{{grid:gs,max:100}}}}}}}});

new Chart(document.getElementById('plannedVsCompChart'),{{type:'bar',data:{{labels:{json.dumps([s['sprint_name'] for s in sprints])},datasets:[{{label:'Planned',data:{json.dumps([s['planned_points'] for s in sprints])},backgroundColor:'#6366f180',borderRadius:4}},{{label:'Completed',data:{json.dumps([s['completed_points'] for s in sprints])},backgroundColor:'#3b82f6',borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,scales:{{x:{{grid:gs}},y:{{grid:gs}}}}}}}});

new Chart(document.getElementById('teamWorkloadChart'),{{type:'bar',data:{{labels:{json.dumps([m['name'] for m in team])},datasets:[{{label:'Assigned',data:{json.dumps([m['issues_assigned'] for m in team])},backgroundColor:'#6366f1',borderRadius:4}},{{label:'Completed',data:{json.dumps([m['issues_completed'] for m in team])},backgroundColor:'#10b981',borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,indexAxis:'y',scales:{{x:{{grid:gs}},y:{{grid:ng}}}}}}}});

new Chart(document.getElementById('teamSPChart'),{{type:'bar',data:{{labels:{json.dumps([m['name'] for m in team])},datasets:[{{label:'SP',data:{json.dumps([m['story_points_completed'] for m in team])},backgroundColor:'#3b82f6',borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,plugins:{{legend:ng}},scales:{{x:{{grid:gs}},y:{{grid:gs}}}}}}}});

new Chart(document.getElementById('epicChart'),{{type:'bar',data:{{labels:{json.dumps([e['epic_name'] for e in epics])},datasets:[{{label:'Progress %',data:{json.dumps([e['progress_pct'] for e in epics])},backgroundColor:C,borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{{legend:ng}},scales:{{x:{{grid:gs,max:100}},y:{{grid:ng}}}}}}}});

new Chart(document.getElementById('flowChart'),{{type:'line',data:{{labels:{json.dumps([f['date'] for f in flow])},datasets:[{{label:'Done',data:{json.dumps([f['done'] for f in flow])},borderColor:'#10b981',backgroundColor:'#10b98130',fill:true,tension:0.3}},{{label:'In Progress',data:{json.dumps([f['in_progress'] for f in flow])},borderColor:'#3b82f6',backgroundColor:'#3b82f630',fill:true,tension:0.3}},{{label:'To Do',data:{json.dumps([f['todo'] for f in flow])},borderColor:'#6366f1',backgroundColor:'#6366f130',fill:true,tension:0.3}}]}},options:{{responsive:true,maintainAspectRatio:false,plugins:{{legend:{{position:'bottom'}}}},scales:{{x:{{grid:gs,ticks:{{maxTicksLimit:12}}}},y:{{grid:gs,stacked:true}}}}}}}});

const ct={json.dumps(cycle_times)};
const bs=Math.max(1,Math.ceil(Math.max(...ct)/10));
const bk={{}};ct.forEach(v=>{{const b=Math.floor(v/bs)*bs;const l=b+'-'+(b+bs)+'d';bk[l]=(bk[l]||0)+1}});
new Chart(document.getElementById('cycleChart'),{{type:'bar',data:{{labels:Object.keys(bk),datasets:[{{label:'Issues',data:Object.values(bk),backgroundColor:'#8b5cf6',borderRadius:4}}]}},options:{{responsive:true,maintainAspectRatio:false,plugins:{{legend:ng}},scales:{{x:{{grid:gs}},y:{{grid:gs}}}}}}}});
</script>
</body>
</html>"""


if __name__ == "__main__":
    main()
