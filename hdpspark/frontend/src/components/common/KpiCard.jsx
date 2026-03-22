import { motion } from 'framer-motion'

const COLOR_MAP = {
  blue: { value: 'text-spark-400', bg: 'bg-spark-600/10', border: 'border-spark-600/20' },
  green: { value: 'text-emerald-400', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
  amber: { value: 'text-amber-400', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
  red: { value: 'text-red-400', bg: 'bg-red-600/10', border: 'border-red-600/20' },
  purple: { value: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-600/20' },
  teal: { value: 'text-teal-400', bg: 'bg-teal-600/10', border: 'border-teal-600/20' },
}

export default function KpiCard({ label, value, color = 'blue', delta }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${c.bg} border ${c.border} rounded-xl p-4 transition-all`}
    >
      <div className={`kpi-value ${c.value}`}>{value}</div>
      <div className="kpi-label">{label}</div>
      {delta && <div className="text-xs text-gray-500 mt-1">{delta}</div>}
    </motion.div>
  )
}
