import { DashboardConfig } from '../types';

export const DEMO_DASHBOARD: DashboardConfig = {
  title: 'Sprint 14 — Jira Issue Tracker',
  subtitle:
    'AI-generated analytics dashboard from uploaded spreadsheet data',
  tags: ['Sprint 14', 'Q1 2026', 'Engineering'],
  kpis: [
    {
      label: 'Total Issues',
      value: 170,
      sub: 'across all statuses',
      trend: '+12% vs Sprint 13',
      dir: 'up',
    },
    {
      label: 'Completion Rate',
      value: '72%',
      sub: '122 of 170 done',
      trend: '+8% improvement',
      dir: 'up',
    },
    {
      label: 'Avg Resolution',
      value: '3.2d',
      sub: 'days per issue',
      trend: '-0.5d faster',
      dir: 'up',
    },
    {
      label: 'Open Blockers',
      value: 7,
      sub: 'critical priority',
      trend: '+2 since last week',
      dir: 'down',
    },
    {
      label: 'Story Points',
      value: 284,
      sub: 'delivered this sprint',
    },
  ],
  charts: [
    {
      type: 'bar',
      title: 'Issues by Status',
      description: 'Distribution of issues across workflow states',
      data: [
        { name: 'Done', value: 122 },
        { name: 'In Progress', value: 23 },
        { name: 'To Do', value: 14 },
        { name: 'In Review', value: 8 },
        { name: 'Blocked', value: 3 },
      ],
    },
    {
      type: 'pie',
      title: 'Issues by Priority',
      description: 'Breakdown of issue priority levels',
      data: [
        { name: 'Medium', value: 68 },
        { name: 'High', value: 45 },
        { name: 'Low', value: 32 },
        { name: 'Critical', value: 15 },
        { name: 'Trivial', value: 10 },
      ],
    },
    {
      type: 'line',
      title: 'Velocity Trend',
      description: 'Story points completed per sprint over the last 6 sprints',
      data: [
        { name: 'S9', value: 180 },
        { name: 'S10', value: 210 },
        { name: 'S11', value: 195 },
        { name: 'S12', value: 240 },
        { name: 'S13', value: 260 },
        { name: 'S14', value: 284 },
      ],
    },
    {
      type: 'area',
      title: 'Burndown',
      description: 'Remaining work over the sprint duration',
      data: [
        { name: 'Day 1', value: 170 },
        { name: 'Day 3', value: 148 },
        { name: 'Day 5', value: 120 },
        { name: 'Day 7', value: 95 },
        { name: 'Day 9', value: 62 },
        { name: 'Day 10', value: 48 },
      ],
    },
  ],
  insights: [
    {
      icon: '📈',
      text: '<strong>Velocity is trending up</strong> — the team delivered 284 story points this sprint, a 9% increase from Sprint 13.',
    },
    {
      icon: '⚡',
      text: '<strong>Resolution time improved</strong> — average time to close an issue dropped from 3.7 to 3.2 days.',
    },
    {
      icon: '🔄',
      text: 'The <strong>In Review</strong> queue has 8 items — consider scheduling a review session to prevent bottleneck.',
    },
    {
      icon: '👥',
      text: '<strong>Top contributor:</strong> 3 team members completed over 20 issues each this sprint.',
    },
  ],
  blockers: [
    {
      level: 'red',
      icon: '🔴',
      label: 'Blocker',
      text: '7 critical-priority issues remain unresolved, blocking the payment module release.',
    },
    {
      level: 'amber',
      icon: '🟡',
      label: 'Risk',
      text: 'API rate limiting may delay the integration testing phase planned for next sprint.',
    },
    {
      level: 'amber',
      icon: '🟡',
      label: 'Risk',
      text: 'Two senior engineers are OOO next week, reducing review capacity by 40%.',
    },
    {
      level: 'green',
      icon: '✅',
      label: 'Achievement',
      text: 'Zero P0 incidents in production for 3 consecutive sprints.',
    },
  ],
  table: {
    title: 'Top Issues by Story Points',
    columns: ['Key', 'Summary', 'Status', 'Priority', 'Points'],
    rows: [
      ['PROJ-142', 'Redesign checkout flow', 'In Progress', 'Critical', 13],
      ['PROJ-158', 'Migrate auth to OAuth2', 'In Review', 'High', 8],
      ['PROJ-163', 'Add export to PDF', 'To Do', 'High', 8],
      ['PROJ-171', 'Fix memory leak in worker', 'Blocked', 'Critical', 5],
      ['PROJ-149', 'Update dependencies', 'Done', 'Medium', 5],
      ['PROJ-155', 'Add rate limiting middleware', 'Done', 'High', 5],
      ['PROJ-167', 'Improve search indexing', 'In Progress', 'Medium', 3],
    ],
  },
};
