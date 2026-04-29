import { Eye, UserX, UserCheck, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ROL_COLOR = {
  PRODUCTOR:   'bg-green-100 text-green-700',
  INVERNADERO: 'bg-lime-100 text-lime-700',
  PROVEEDOR:   'bg-blue-100 text-blue-700',
  COMPRADOR:   'bg-slate-100 text-slate-600',
  EMPAQUE:     'bg-purple-100 text-purple-700',
  ADMIN:       'bg-red-100 text-red-700',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try { return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

export default function UsuarioRow({ usuario, onVer, onSuspender, onActivar }) {
  const { nombre, apellidos, correo, roles = [], activo, municipio, estadoRepublica, fechaRegistro } = usuario
  const navigate     = useNavigate()
  const initials = `${nombre?.charAt(0) ?? ''}${apellidos?.charAt(0) ?? ''}`.toUpperCase()
  const rolPrincipal = roles[0] ?? 'COMPRADOR'
  const userId       = usuario.id ?? usuario.idUsuario

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
      {/* Avatar + Nombre */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{nombre} {apellidos}</p>
            <p className="text-xs text-slate-400">{correo}</p>
          </div>
        </div>
      </td>
      {/* Rol */}
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ROL_COLOR[rolPrincipal] ?? ROL_COLOR.COMPRADOR}`}>
          {rolPrincipal}
        </span>
      </td>
      {/* Estado */}
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {activo ? 'Activo' : 'Suspendido'}
        </span>
      </td>
      {/* Ubicación */}
      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
        {municipio && estadoRepublica ? `${municipio}, ${estadoRepublica}` : municipio ?? estadoRepublica ?? '—'}
      </td>
      {/* Fecha */}
      <td className="px-4 py-3 text-xs text-slate-400 hidden xl:table-cell">
        {formatDate(fechaRegistro)}
      </td>
      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/usuarios/${userId}`)}
            title="Ver detalle completo"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onVer(usuario)}
            title="Vista rápida"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {activo ? (
            <button
              onClick={() => onSuspender(usuario)}
              title="Suspender"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <UserX className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onActivar(usuario)}
              title="Activar"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
