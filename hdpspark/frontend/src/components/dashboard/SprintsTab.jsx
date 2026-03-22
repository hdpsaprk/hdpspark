import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts'

export default function SprintsTab({ data }) {
  const { sprint_metrics } = data

  if (!sprint_metrics.length) {
    return <div className="card text-center py-12 text-gray-500">No sprint data detected in the uploaded file.</div>
  }

  return (
    <div className="space-y-6">
      {/* Velocity Trend */}
      <div className="card">
        <h3 className="section-title">Velocity Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sprint_metrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="sprint_name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Velocity (SP)" />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Issues Done" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate & Carry Over */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title">Completion Rate by Sprint</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sprint_metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="sprint_name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="completion_rate" fill="#10b981" name="Completion %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title">Planned vs Completed (SP)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sprint_metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="sprint_name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="planned_points" fill="#6366f1" name="Planned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed_points" fill="#3b82f6" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sprint Table */}
      <div className="card overflow-x-auto">
        <h3 className="section-title">Sprint Details</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Sprint</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Total</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Done</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Carry Over</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Velocity</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Completion</th>
            </tr>
          </thead>
          <tbody>
            {sprint_metrics.map((s) => (
              <tr key={s.sprint_name} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-2 px-3 font-medium">{s.sprint_name}</td>
                <td className="py-2 px-3 text-right">{s.total_issues}</td>
                <td className="py-2 px-3 text-right text-emerald-400">{s.completed}</td>
                <td className="py-2 px-3 text-right text-amber-400">{s.carry_over}</td>
                <td className="py-2 px-3 text-right text-spark-400">{s.velocity}</td>
                <td className="py-2 px-3 text-right">
                  <span className={s.completion_rate >= 80 ? 'text-emerald-400' : s.completion_rate >= 50 ? 'text-amber-400' : 'text-red-400'}>
                    {s.completion_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
