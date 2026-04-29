import { Clock, User, Shield } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_MAP = {
  ABIERTA:     { label: 'Abierta',      cls: 'bg-red-100 text-red-600' },
  EN_REVISION: { label: 'En revisión',  cls: 'bg-blue-100 text-blue-600' },
  RESUELTA:    { label: 'Resuelta',     cls: 'bg-green-100 text-green-600' },
  CERRADA:     { label: 'Cerrada',      cls: 'bg-slate-100 text-slate-500' },
}

function timeAgo(dateStr) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es }) }
  catch { return '' }
}

export default function DisputaCard({ disputa, onTomar, onResolver, onVer }) {
  const { idPedido, tipoReporte, descripcion, estado, adminAsignado, fechaCreacion } = disputa
  const e = ESTADO_MAP[estado] ?? ESTADO_MAP.ABIERTA

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Pedido #{idPedido}</p>
          <p className="text-sm font-semibold text-slate-800">{tipoReporte}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${e.cls}`}>{e.label}</span>
      </div>

      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{descripcion}</p>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(fechaCreacion)}
        </div>
        <div className="flex items-center gap-1">
          {adminAsignado
            ? <><Shield className="w-3 h-3 text-blue-400" /><span className="text-blue-500">{adminAsignado}</span></>
            : <span>Sin asignar</span>
          }
        </div>
      </div>

      <div className="flex gap-2">
        {!adminAsignado && (
          <button
            onClick={() => onTomar(disputa)}
            className="flex-1 py-2 text-xs font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl transition-all"
          >
            Tomar caso
          </button>
        )}
        <button
          onClick={() => onVer(disputa)}
          className="flex-1 py-2 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
        >
          Ver detalle
        </button>
        {estado !== 'RESUELTA' && estado !== 'CERRADA' && (
          <button
            onClick={() => onResolver(disputa)}
            className="flex-1 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all"
          >
            Resolver
          </button>
        )}
      </div>
    </div>
  )
}
