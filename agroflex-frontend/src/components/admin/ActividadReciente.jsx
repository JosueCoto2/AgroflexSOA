import { UserPlus, PackagePlus, BadgeCheck, AlertTriangle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const TIPO_MAP = {
  NUEVO_USUARIO:       { icon: UserPlus,      color: 'text-blue-500',   bg: 'bg-blue-50' },
  PRODUCTO_PUBLICADO:  { icon: PackagePlus,   color: 'text-green-600',  bg: 'bg-green-50' },
  INSIGNIA_SOLICITADA: { icon: BadgeCheck,    color: 'text-orange-500', bg: 'bg-orange-50' },
  DISPUTA_ABIERTA:     { icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50' },
}

function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })
  } catch {
    return ''
  }
}

export default function ActividadReciente({ actividad = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-slate-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!actividad.length) {
    return (
      <div className="flex flex-col items-center py-8 text-slate-400">
        <Clock className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Sin actividad reciente</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {actividad.map((item, i) => {
        const cfg = TIPO_MAP[item.tipo] ?? TIPO_MAP.NUEVO_USUARIO
        const Icon = cfg.icon
        return (
          <div key={i} className="flex items-start gap-3 py-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-snug">{item.descripcion}</p>
              <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.fecha)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
