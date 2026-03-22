import { create } from 'zustand'
import * as api from '../services/api'

const useDashboardStore = create((set, get) => ({
  // State
  view: 'upload', // upload | dashboard
  loading: false,
  error: null,
  dataset: null,
  dashboard: null,
  confluenceResult: null,
  activeTab: 'overview',

  // Actions
  setView: (view) => set({ view }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  clearError: () => set({ error: null }),

  uploadJiraFile: async (file) => {
    set({ loading: true, error: null })
    try {
      const dataset = await api.uploadJiraExcel(file)
      set({ dataset, loading: false })
      return dataset
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed'
      set({ error: msg, loading: false })
      throw err
    }
  },

  parseConfluence: async (payload) => {
    set({ loading: true, error: null })
    try {
      const result = await api.parseConfluence(payload)
      set({ confluenceResult: result, loading: false })
      return result
    } catch (err) {
      const msg = err.response?.data?.detail || 'Confluence parsing failed'
      set({ error: msg, loading: false })
      throw err
    }
  },

  generateDashboard: async () => {
    set({ loading: true, error: null })
    try {
      const dashboard = await api.generateDashboard()
      set({ dashboard, view: 'dashboard', loading: false })
      return dashboard
    } catch (err) {
      const msg = err.response?.data?.detail || 'Dashboard generation failed'
      set({ error: msg, loading: false })
      throw err
    }
  },
}))

export default useDashboardStore
