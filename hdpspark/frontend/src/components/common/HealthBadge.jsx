const BADGE_MAP = {
  green: { class: 'badge-green', label: 'Healthy', dot: 'bg-emerald-400' },
  amber: { class: 'badge-amber', label: 'At Risk', dot: 'bg-amber-400' },
  red: { class: 'badge-red', label: 'Critical', dot: 'bg-red-400' },
}

export default function HealthBadge({ health, size = 'sm' }) {
  const b = BADGE_MAP[health] || BADGE_MAP.amber

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full ${b.dot} flex items-center justify-center shadow-lg`}
          style={{ boxShadow: `0 0 20px ${health === 'green' ? '#10b98140' : health === 'amber' ? '#f59e0b40' : '#ef444440'}` }}
        >
          <span className="text-white text-xl font-bold">
            {health === 'green' ? 'A' : health === 'amber' ? 'B' : 'C'}
          </span>
        </div>
        <span className={`mt-2 text-sm font-medium ${b.dot.replace('bg-', 'text-')}`}>{b.label}</span>
      </div>
    )
  }

  return (
    <span className={b.class}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot} mr-1`} />
      {b.label}
    </span>
  )
}
