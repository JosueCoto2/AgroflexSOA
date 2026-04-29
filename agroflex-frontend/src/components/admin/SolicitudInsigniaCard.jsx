import { Clock, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

function timeAgo(dateStr) {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es }) }
  catch { return '' }
}

export default function SolicitudInsigniaCard({ solicitud, onAprobar, onRechazar }) {
  const { nombreUsuario, correoUsuario, rolSolicitado, motivoSolicitud, documentoUrl, fechaSolicitud } = solicitud

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {nombreUsuario?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{nombreUsuario}</p>
          <p className="text-xs text-slate-400 truncate">{correoUsuario}</p>
        </div>
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
          {rolSolicitado}
        </span>
      </div>

      {/* Motivo */}
      {motivoSolicitud && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-3">{motivoSolicitud}</p>
      )}

      {/* Tiempo + documento */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          {timeAgo(fechaSolicitud)}
        </div>
        {documentoUrl && (
          <a
            href={documentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ver documento
          </a>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={() => onRechazar(solicitud)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-all"
        >
          <XCircle className="w-3.5 h-3.5" />
          Rechazar
        </button>
        <button
          onClick={() => onAprobar(solicitud)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Aprobar
        </button>
      </div>
    </div>
  )
}
