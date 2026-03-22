import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from 'recharts'
import KpiCard from '../common/KpiCard'
import HealthBadge from '../common/HealthBadge'

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']

export default function OverviewTab({ data }) {
  const { kpi_summary: kpi, issue_type_distribution, priority_distribution, status_distribution, sprint_metrics, weekly_throughput } = data

  const typeData = Object.entries(issue_type_distribution).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(priority_distribution).map(([name, value]) => ({ name, value }))
  const statusData = Object.entries(status_distribution).map(([name, value]) => ({ name, value }))

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
  const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KpiCard label="Total Issues" value={kpi.total_issues} color="blue" />
        <KpiCard label="Completed" value={kpi.done_issues} color="green" delta={`${((kpi.done_issues / kpi.total_issues) * 100).toFixed(0)}%`} />
        <KpiCard label="Open" value={kpi.open_issues} color="amber" />
        <KpiCard label="Blockers" value={kpi.blocker_count} color="red" />
        <KpiCard label="Avg Cycle Time" value={`${kpi.avg_cycle_time_days}d`} color="purple" />
        <KpiCard label="Throughput/wk" value={kpi.throughput_per_week} color="teal" />
      </motion.div>

      {/* Health Score & Story Points */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card flex flex-col items-center justify-center py-8">
          <HealthBadge health={kpi.health_score} size="lg" />
          <p className="text-sm text-gray-400 mt-3">Project Health</p>
          <div className="mt-4 grid grid-cols-2 gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-spark-400">{kpi.story_points_done}</div>
              <div className="text-xs text-gray-500">SP Done</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-400">{kpi.story_points_total}</div>
              <div className="text-xs text-gray-500">SP Total</div>
            </div>
          </div>
        </div>

        {/* Issue Type Pie */}
        <div className="card">
          <h3 className="section-title">Issue Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={2}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {typeData.map((d, i) => (
              <span key={d.name} className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <h3 className="section-title">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Sprint Velocity & Throughput */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title">Sprint Velocity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sprint_metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="sprint_name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="completed_points" fill="#3b82f6" name="Completed SP" radius={[4, 4, 0, 0]} />
              <Bar dataKey="planned_points" fill="#374151" name="Planned SP" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="section-title">Weekly Throughput</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weekly_throughput}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf680" name="Issues Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Status Distribution */}
      <motion.div variants={fadeUp} className="card">
        <h3 className="section-title">Status Overview</h3>
        <div className="flex gap-3 flex-wrap">
          {statusData.map((s, i) => (
            <div key={s.name} className="flex-1 min-w-[120px] bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.name}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
