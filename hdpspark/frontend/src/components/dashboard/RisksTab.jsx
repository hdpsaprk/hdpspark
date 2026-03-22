import { AlertTriangle, Clock, UserX, Pause, ShieldAlert } from 'lucide-react'

const RISK_ICONS = {
  overdue: Clock,
  blocked: ShieldAlert,
  no_assignee: UserX,
  stale: Pause,
}

const RISK_COLORS = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  low: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
}

export default function RisksTab({ data }) {
  const { risk_items } = data

  if (!risk_items.length) {
    return (
      <div className="card text-center py-12">
        <div className="text-emerald-400 text-4xl mb-3">&#10003;</div>
        <p className="text-gray-400">No risks detected! Your project looks healthy.</p>
      </div>
    )
  }

  const high = risk_items.filter(r => r.severity === 'high')
  const medium = risk_items.filter(r => r.severity === 'medium')
  const low = risk_items.filter(r => r.severity === 'low')

  const byType = {}
  risk_items.forEach(r => {
    byType[r.risk_type] = (byType[r.risk_type] || 0) + 1
  })

  return (
    <div className="space-y-6">
      {/* Risk Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-red-400">{risk_items.length}</div>
          <div className="text-xs text-gray-500">Total Risks</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-400">{high.length}</div>
          <div className="text-xs text-gray-500">High Severity</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-400">{medium.length}</div>
          <div className="text-xs text-gray-500">Medium Severity</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-400">{low.length}</div>
          <div className="text-xs text-gray-500">Low Severity</div>
        </div>
      </div>

      {/* Risk Type Breakdown */}
      <div className="card">
        <h3 className="section-title">Risk Categories</h3>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(byType).map(([type, count]) => {
            const Icon = RISK_ICONS[type] || AlertTriangle
            return (
              <div key={type} className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2">
                <Icon className="w-4 h-4 text-amber-400" />
                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk List */}
      <div className="card overflow-x-auto">
        <h3 className="section-title">Risk Register</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Issue</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Summary</th>
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Risk Type</th>
              <th className="text-center py-2 px-3 text-gray-400 font-medium">Severity</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Days at Risk</th>
            </tr>
          </thead>
          <tbody>
            {risk_items.slice(0, 50).map((r, idx) => {
              const colors = RISK_COLORS[r.severity] || RISK_COLORS.low
              return (
                <tr key={`${r.issue_key}-${idx}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 px-3 font-mono text-spark-400 text-xs">{r.issue_key}</td>
                  <td className="py-2 px-3 max-w-[300px] truncate">{r.summary}</td>
                  <td className="py-2 px-3 capitalize text-xs">{r.risk_type.replace('_', ' ')}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${colors.bg} ${colors.border} ${colors.text} border`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">{r.days_at_risk}d</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
