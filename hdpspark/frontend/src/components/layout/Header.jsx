import { Sparkles, RotateCcw } from 'lucide-react'
import useDashboardStore from '../../store/useDashboardStore'

export default function Header() {
  const { view, setView, activeTab, setActiveTab } = useDashboardStore()

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sprints', label: 'Sprints' },
    { id: 'team', label: 'Team' },
    { id: 'epics', label: 'Epics' },
    { id: 'risks', label: 'Risks' },
    { id: 'flow', label: 'Flow' },
    { id: 'okrs', label: 'OKRs' },
  ]

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-spark-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-spark-400 to-purple-400 bg-clip-text text-transparent">
            HDP Spark
          </h1>
          <span className="text-xs text-gray-500 ml-2">Jira & Confluence Dashboard</span>
        </div>

        {view === 'dashboard' && (
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-spark-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {view === 'dashboard' && (
          <button
            onClick={() => setView('upload')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            New Data
          </button>
        )}
      </div>
    </header>
  )
}
