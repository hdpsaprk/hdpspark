import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export async function uploadJiraExcel(file) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/upload/jira', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getUploadStatus() {
  const { data } = await api.get('/upload/status')
  return data
}

export async function parseConfluence(payload) {
  const { data } = await api.post('/confluence/parse', payload)
  return data
}

export async function getOkrs() {
  const { data } = await api.get('/confluence/okrs')
  return data
}

export async function generateDashboard() {
  const { data } = await api.get('/dashboard/generate')
  return data
}

export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export async function getSprintAnalytics() {
  const { data } = await api.get('/analytics/sprints')
  return data
}

export async function getTeamAnalytics() {
  const { data } = await api.get('/analytics/team')
  return data
}

export async function getRiskAnalysis() {
  const { data } = await api.get('/analytics/risks')
  return data
}

export async function getCycleTime() {
  const { data } = await api.get('/analytics/cycle-time')
  return data
}

export async function getFilterOptions() {
  const { data } = await api.get('/analytics/filter-options')
  return data
}

export async function healthCheck() {
  const { data } = await api.get('/health')
  return data
}
