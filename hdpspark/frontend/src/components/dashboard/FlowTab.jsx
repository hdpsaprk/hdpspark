import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, ScatterChart, Scatter, ZAxis,
} from 'recharts'

export default function FlowTab({ data }) {
  const { flow_metrics, cycle_time_distribution, weekly_throughput } = data

  // Build histogram from cycle time distribution
  const histogram = buildHistogram(cycle_time_distribution)

  return (
    <div className="space-y-6">
      {/* Cumulative Flow Diagram */}
      <div className="card">
        <h3 className="section-title">Cumulative Flow Diagram</h3>
        {flow_metrics.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={flow_metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="done" stackId="1" stroke="#10b981" fill="#10b98140" name="Done" />
              <Area type="monotone" dataKey="in_progress" stackId="1" stroke="#3b82f6" fill="#3b82f640" name="In Progress" />
              <Area type="monotone" dataKey="todo" stackId="1" stroke="#6366f1" fill="#6366f140" name="To Do" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No flow data available (requires created dates in issues).</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cycle Time Distribution */}
        <div className="card">
          <h3 className="section-title">Cycle Time Distribution</h3>
          {histogram.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={histogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" name="Issues" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-4 text-xs text-gray-400">
                <span>Median: {cycle_time_distribution.length > 0 ? cycle_time_distribution[Math.floor(cycle_time_distribution.length / 2)] : 0}d</span>
                <span>Total: {cycle_time_distribution.length} issues</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No cycle time data available.</p>
          )}
        </div>

        {/* Weekly Throughput */}
        <div className="card">
          <h3 className="section-title">Weekly Throughput</h3>
          {weekly_throughput.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekly_throughput}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#10b981" name="Issues Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No throughput data available.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function buildHistogram(values) {
  if (!values || values.length === 0) return []

  const max = Math.max(...values)
  const bucketSize = Math.max(1, Math.ceil(max / 10))
  const buckets = {}

  values.forEach(v => {
    const bucket = Math.floor(v / bucketSize) * bucketSize
    const label = `${bucket}-${bucket + bucketSize}d`
    buckets[label] = (buckets[label] || 0) + 1
  })

  return Object.entries(buckets).map(([label, count]) => ({ label, count }))
}
