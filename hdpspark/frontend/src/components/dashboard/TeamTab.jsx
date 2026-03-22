import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

export default function TeamTab({ data }) {
  const { team_metrics } = data

  if (!team_metrics.length) {
    return <div className="card text-center py-12 text-gray-500">No assignee data found in the uploaded file.</div>
  }

  // Radar data for top contributors
  const topMembers = [...team_metrics].sort((a, b) => b.story_points_completed - a.story_points_completed).slice(0, 8)

  return (
    <div className="space-y-6">
      {/* Workload Chart */}
      <div className="card">
        <h3 className="section-title">Team Workload Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={team_metrics} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="issues_assigned" fill="#6366f1" name="Assigned" radius={[0, 4, 4, 0]} />
            <Bar dataKey="issues_completed" fill="#10b981" name="Completed" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Story Points by Member */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title">Story Points Delivered</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topMembers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="story_points_completed" fill="#3b82f6" name="SP Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title">Average Cycle Time (days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={team_metrics.filter(m => m.avg_cycle_time_days > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="avg_cycle_time_days" fill="#f59e0b" name="Avg Cycle Time" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Table */}
      <div className="card overflow-x-auto">
        <h3 className="section-title">Team Performance Summary</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Member</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Assigned</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Completed</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">SP Done</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Avg Cycle</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Bugs</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Blockers</th>
            </tr>
          </thead>
          <tbody>
            {team_metrics.map((m) => (
              <tr key={m.name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium">{m.name}</td>
                <td className="py-2 px-3 text-right">{m.issues_assigned}</td>
                <td className="py-2 px-3 text-right text-emerald-400">{m.issues_completed}</td>
                <td className="py-2 px-3 text-right text-spark-400">{m.story_points_completed}</td>
                <td className="py-2 px-3 text-right text-purple-400">{m.avg_cycle_time_days}d</td>
                <td className="py-2 px-3 text-right text-amber-400">{m.bugs_raised}</td>
                <td className="py-2 px-3 text-right text-red-400">{m.blockers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
