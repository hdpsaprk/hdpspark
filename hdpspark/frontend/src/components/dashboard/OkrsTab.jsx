import { motion } from 'framer-motion'
import { Target, TrendingUp } from 'lucide-react'
import HealthBadge from '../common/HealthBadge'

export default function OkrsTab({ data }) {
  const { okrs } = data

  if (!okrs.length) {
    return (
      <div className="card text-center py-12">
        <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 mb-2">No OKRs detected</p>
        <p className="text-gray-500 text-sm">
          Add Confluence content with OKR-formatted text to see objectives and key results here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* OKR Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <Target className="w-6 h-6 text-spark-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-spark-400">{okrs.length}</div>
          <div className="text-xs text-gray-500">Objectives</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-400">
            {okrs.reduce((sum, o) => sum + o.key_results.length, 0)}
          </div>
          <div className="text-xs text-gray-500">Key Results</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-emerald-400">
            {okrs.length > 0 ? Math.round(okrs.reduce((sum, o) => sum + o.confidence, 0) / okrs.length) : 0}%
          </div>
          <div className="text-xs text-gray-500">Avg Confidence</div>
        </div>
      </div>

      {/* OKR Cards */}
      {okrs.map((okr, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="card"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-spark-600/20 flex items-center justify-center text-spark-400 font-bold text-sm">
                O{idx + 1}
              </div>
              <h3 className="font-semibold text-lg">{okr.objective}</h3>
            </div>
            <div className="flex items-center gap-2">
              <HealthBadge health={okr.health} />
              <span className="text-sm text-gray-400">{Math.round(okr.confidence)}%</span>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${okr.confidence}%`,
                background: okr.health === 'green' ? '#10b981' : okr.health === 'amber' ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>

          {/* Key Results */}
          <div className="space-y-3">
            {okr.key_results.map((kr, kIdx) => (
              <div key={kIdx} className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                <div className="w-6 h-6 rounded bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                  {kIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{kr.description}</p>
                  {kr.target && <p className="text-xs text-gray-500 mt-0.5">Target: {kr.target}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-purple-500"
                      style={{ width: `${Math.min(kr.progress_pct, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{Math.round(kr.progress_pct)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
