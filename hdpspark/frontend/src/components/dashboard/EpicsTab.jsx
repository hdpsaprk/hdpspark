import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import HealthBadge from '../common/HealthBadge'

export default function EpicsTab({ data }) {
  const { epic_progress } = data

  if (!epic_progress.length) {
    return <div className="card text-center py-12 text-gray-500">No epic data detected in the uploaded file.</div>
  }

  return (
    <div className="space-y-6">
      {/* Epic Progress Bars */}
      <div className="card">
        <h3 className="section-title">Epic Progress</h3>
        <ResponsiveContainer width="100%" height={Math.max(200, epic_progress.length * 40)}>
          <BarChart data={epic_progress} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis type="category" dataKey="epic_name" width={160} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="progress_pct" fill="#3b82f6" name="Progress %" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Epic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {epic_progress.map((epic) => (
          <div key={epic.epic_name} className="card-hover">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-sm truncate pr-2">{epic.epic_name}</h4>
              <HealthBadge health={epic.health} />
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${epic.progress_pct}%`,
                  background: epic.health === 'green' ? '#10b981' : epic.health === 'amber' ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-emerald-400">{epic.done}</div>
                <div className="text-gray-500">Done</div>
              </div>
              <div>
                <div className="text-lg font-bold text-spark-400">{epic.in_progress}</div>
                <div className="text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-400">{epic.todo}</div>
                <div className="text-gray-500">To Do</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
              <span>SP: {epic.story_points_done}/{epic.story_points_total}</span>
              <span>{epic.progress_pct}% complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
