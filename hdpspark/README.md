# HDP Spark - Jira & Confluence Dashboard Framework

A powerful on-demand dashboard generator that transforms Jira Excel exports and Confluence pages into rich, interactive analytics dashboards with KPIs, OKRs, and deep project insights.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HDP Spark                                │
├──────────────────────────┬──────────────────────────────────────┤
│      React Frontend      │          FastAPI Backend             │
│  ┌────────────────────┐  │  ┌────────────────────────────────┐  │
│  │  Dashboard Engine   │  │  │  Ingestion Layer               │  │
│  │  - KPI Cards       │  │  │  - Excel Parser (openpyxl)     │  │
│  │  - OKR Tracker     │  │  │  - Confluence Fetcher (API)    │  │
│  │  - Sprint Velocity │  │  │  - Text Extractor              │  │
│  │  - Burn Charts     │  │  │                                │  │
│  │  - Team Heatmaps   │  │  ├────────────────────────────────┤  │
│  │  - Risk Matrix     │  │  │  Analytics Engine               │  │
│  │  - Flow Metrics    │  │  │  - KPI Calculator              │  │
│  │  - Dependency Graph │  │  │  - OKR Extractor              │  │
│  └────────────────────┘  │  │  - Sprint Analyzer             │  │
│  ┌────────────────────┐  │  │  - Risk Scorer                 │  │
│  │  Upload Manager     │  │  │  - Trend Forecaster            │  │
│  │  - Drag & Drop     │  │  │  - Team Performance Engine     │  │
│  │  - URL Input       │  │  │  - Bottleneck Detector         │  │
│  │  - Live Preview    │  │  │                                │  │
│  └────────────────────┘  │  └────────────────────────────────┘  │
└──────────────────────────┴──────────────────────────────────────┘
```

## Features

### Data Ingestion
- **Jira Excel Import**: Upload `.xlsx` exports with automatic column detection
- **Confluence Integration**: Fetch pages via URL or paste raw content
- **Smart Detection**: Auto-detects Jira fields, sprint data, epics, and labels

### Analytics & KPIs
- Sprint Velocity & Burndown/Burnup
- Cycle Time & Lead Time Distribution
- Throughput & WIP Analysis
- Defect Density & Escape Rate
- Team Workload Balancing
- Epic Progress & Health Scoring
- Blocker & Dependency Analysis

### OKR Tracking
- Automatic OKR extraction from Confluence pages
- Key Result progress mapping to Jira issues
- Confidence scoring with traffic light indicators
- Historical OKR trend analysis

### Dashboard Views
- **Executive Summary**: High-level health scores and trend indicators
- **Sprint Analytics**: Deep dive into sprint performance
- **Team Performance**: Individual and team-level metrics
- **Risk & Blockers**: Risk matrix with impact assessment
- **Flow Metrics**: Cumulative flow, cycle time, throughput
- **OKR Tracker**: Objective progress with key result mapping

## Quick Start

### Backend
```bash
cd hdpspark/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd hdpspark/frontend
npm install
npm run dev
```

Open `http://localhost:5173` to access the dashboard.

## Tech Stack
- **Backend**: Python 3.11+, FastAPI, pandas, openpyxl, beautifulsoup4
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion
- **State**: Zustand for lightweight state management
