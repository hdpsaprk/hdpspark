#!/bin/bash
set -e

echo "=== Setting up hdpspark/atlassian repo ==="

# 1. Create the repo on GitHub
echo "Creating private repo hdpspark/atlassian..."
gh repo create hdpspark/atlassian --private --description "Jira & Confluence Analytics Dashboard — AI-powered project insights"

# 2. Clone the new empty repo
echo "Cloning new repo..."
cd /tmp
rm -rf atlassian-setup
gh repo clone hdpspark/atlassian atlassian-setup
cd atlassian-setup

# 3. Copy the project code (run this from wherever you cloned hdpspark)
echo "Copying project files..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp -r "$SCRIPT_DIR"/backend .
cp -r "$SCRIPT_DIR"/frontend .
cp -r "$SCRIPT_DIR"/dashframe .
cp "$SCRIPT_DIR"/docker-compose.yml .
cp "$SCRIPT_DIR"/README.md .
cp "$SCRIPT_DIR"/.gitignore . 2>/dev/null || echo "node_modules/" > .gitignore

# 4. Add proper .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
__pycache__/
*.pyc
.venv/
venv/
uploads/
*.egg-info/
EOF

# 5. Commit and push
echo "Committing and pushing..."
git add -A
git commit -m "feat: Initial commit — Jira & Confluence Analytics Dashboard

Full-stack analytics platform:
- FastAPI backend (Excel parser, Confluence fetcher, analytics engine, 41 E2E tests)
- React frontend (KPI cards, sprint velocity, burn charts, OKR tracker)
- DashFrame AI-powered dashboard generator (Anthropic theme)
- Docker Compose for production deployment
- Seed data and test suite included"

git push -u origin main

echo ""
echo "=== Done! ==="
echo "Repo: https://github.com/hdpspark/atlassian"
echo ""
echo "To run with Docker:"
echo "  cd /tmp/atlassian-setup"
echo "  cp backend/.env.example backend/.env"
echo "  docker compose up --build"
