import { Loader2 } from 'lucide-react'

/**
 * MetricaCard — tarjeta de estadística para el dashboard admin.
 * Props: title, value, icon, color ('blue'|'green'|'orange'|'red'), children, loading, cta
 */
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   value: 'text-blue-700' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600', value: 'text-green-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-500', value: 'text-orange-600' },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-500',     value: 'text-red-600' },
}

export default function MetricaCard({ title, value, icon: Icon, color = 'green', children, loading, cta }) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.green
  return (
    <div className={`rounded-2xl p-5 shadow-card ${c.bg} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      ) : (
        <p className={`text-3xl font-bold ${c.value}`}>{value ?? '—'}</p>
      )}

      {children && (
        <div className="text-xs text-slate-500 space-y-0.5">{children}</div>
      )}

      {cta && !loading && (
        <div className="pt-1">{cta}</div>
      )}
    </div>
  )
}
