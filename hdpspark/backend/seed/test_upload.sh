#!/usr/bin/env bash
# Quick test script - uploads seed data and generates dashboard
# Usage: ./test_upload.sh [BASE_URL]

set -e
BASE="${1:-http://localhost:8000}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "HDP Spark - Seed Data Upload Test"
echo "=================================="
echo "Server: $BASE"
echo ""

echo "[1/4] Health check..."
curl -sf "$BASE/api/health" | python3 -m json.tool
echo ""

echo "[2/4] Uploading Jira Excel (100 issues)..."
curl -sf -X POST "$BASE/api/upload/jira" \
  -F "file=@$SCRIPT_DIR/seed_jira_export.xlsx" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  Issues: {d[\"total_issues\"]}, Sprints: {len(d[\"detected_sprints\"])}, Epics: {len(d[\"detected_epics\"])}')
"
echo ""

echo "[3/4] Parsing Confluence OKR content..."
curl -sf -X POST "$BASE/api/confluence/parse" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "import json; print(json.dumps({'raw_text': open('$SCRIPT_DIR/seed_confluence_okrs.txt').read()}))")" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  Text: {d[\"text_length\"]} chars, OKRs found: {d[\"okrs_found\"]}')
for o in d['okrs']:
    print(f'    [{o[\"health\"].upper():6s}] {o[\"objective\"]} ({o[\"confidence\"]:.0f}%)')
"
echo ""

echo "[4/4] Generating dashboard..."
curl -sf "$BASE/api/dashboard/generate" | python3 -c "
import sys, json
d = json.load(sys.stdin)
k = d['kpi_summary']
print(f'  Health: {k[\"health_score\"].upper()} | Issues: {k[\"total_issues\"]} | Done: {k[\"done_issues\"]} | Blockers: {k[\"blocker_count\"]}')
print(f'  Cycle Time: {k[\"avg_cycle_time_days\"]}d | Throughput: {k[\"throughput_per_week\"]}/wk | SP: {k[\"story_points_done\"]}/{k[\"story_points_total\"]}')
print(f'  Sprints: {len(d[\"sprint_metrics\"])} | Team: {len(d[\"team_metrics\"])} | Epics: {len(d[\"epic_progress\"])} | Risks: {len(d[\"risk_items\"])} | OKRs: {len(d[\"okrs\"])}')
"
echo ""
echo "Done! Open the frontend at http://localhost:5173 to see the dashboard."
