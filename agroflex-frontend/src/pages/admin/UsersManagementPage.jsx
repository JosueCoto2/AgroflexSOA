/**
 * UsersManagementPage — Gestión completa de usuarios con métricas por rol.
 *
 * Combina las estadísticas de usuarios (roles, estado) con la tabla de gestión.
 * Flujo SOA: → adminService.getUsuarios / getStats() → admin-service (8089)
 */
import { useState } from 'react'
import {
  Search, Users, UserCheck, UserX, RefreshCw, Download,
  Leaf, Home, ShoppingCart, FlaskConical, ShieldCheck,
} from 'lucide-react'
import { useAdminUsuarios } from '../../hooks/useAdminUsuarios'
import { useAdminStats }    from '../../hooks/useAdminStats'
import { useToast }         from '../../components/admin/ToastNotification'
import UsuarioRow           from '../../components/admin/UsuarioRow'
import UsuarioModal         from '../../components/admin/UsuarioModal'
import ConfirmModal         from '../../components/admin/ConfirmModal'
import { adminService }     from '../../services/adminService'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const ROL_META = {
  COMPRADOR:   { icon: ShoppingCart, color: 'bg-sky-50 text-sky-600',   bar: 'bg-sky-400' },
  PRODUCTOR:   { icon: Leaf,         color: 'bg-green-50 text-green-600', bar: 'bg-green-500' },
  INVERNADERO: { icon: Home,         color: 'bg-teal-50 text-teal-600',  bar: 'bg-teal-500' },
  PROVEEDOR:   { icon: FlaskConical, color: 'bg-blue-50 text-blue-600',  bar: 'bg-blue-500' },
  ADMIN:       { icon: ShieldCheck,  color: 'bg-slate-100 text-slate-600', bar: 'bg-slate-400' },
}

// ── Tarjeta resumen por rol ────────────────────────────────────────────────
function RolCard({ rol, count, total }) {
  const meta = ROL_META[rol] ?? ROL_META.COMPRADOR
  const Icon = meta.icon
  const pct  = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className={`rounded-xl p-3.5 ${meta.color.split(' ')[0]} flex items-center gap-3`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 capitalize">{rol.toLowerCase()}</p>
        <p className="text-lg font-bold text-slate-800">{count}</p>
        <div className="h-1 bg-white/70 rounded-full mt-1 overflow-hidden">
          <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-xs text-slate-400 font-semibold">{pct}%</span>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function UsersManagementPage() {
  const { usuarios, total, loading, error, filtros, setFiltros, retry, suspender, activar, actionLoading } = useAdminUsuarios()
  const { stats } = useAdminStats()
  const { toast } = useToast()

  const [verModal,      setVerModal]      = useState(null)
  const [suspModal,     setSuspModal]     = useState(null)
  const [activModal,    setActivModal]    = useState(null)
  const [exportLoading, setExportLoading] = useState(false)

  const handleExportarCsv = async () => {
    setExportLoading(true)
    try {
      const blob = await adminService.exportarUsuariosCsv()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'usuarios_agroflex.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV descargado correctamente')
    } catch { toast.error('Error al exportar usuarios') }
    finally { setExportLoading(false) }
  }

  const porRol      = stats?.usuarios?.porRol ?? {}
  const totalGlobal = stats?.usuarios?.total  ?? 0
  const activos     = stats?.usuarios?.activos ?? 0
  const suspendidos = stats?.usuarios?.suspendidos ?? 0
  const nuevos      = stats?.usuarios?.nuevosEsteMes ?? 0

  const handleSuspender = async (motivo) => {
    try {
      await suspender(suspModal.idUsuario ?? suspModal.id, motivo)
      toast.success('Usuario suspendido')
      setSuspModal(null)
    } catch {
      toast.error('Error al suspender usuario')
    }
  }

  const handleActivar = async (motivo) => {
    try {
      await activar(activModal.idUsuario ?? activModal.id, motivo)
      toast.success('Usuario activado')
      setActivModal(null)
    } catch {
      toast.error('Error al activar usuario')
    }
  }

  return (
    <div style={FONT}>

      {/* ── Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-400 mt-0.5">{totalGlobal} usuarios registrados en la plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportarCsv}
            disabled={exportLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-card disabled:opacity-50"
          >
            <Download size={13} />
            {exportLoading ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={retry}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Resumen de estado */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-green-50 rounded-xl p-3.5 text-center">
          <UserCheck size={18} className="text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-700">{activos}</p>
          <p className="text-xs text-green-500">Activos</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3.5 text-center">
          <UserX size={18} className="text-red-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-600">{suspendidos}</p>
          <p className="text-xs text-red-400">Suspendidos</p>
        </div>
        <div className="bg-sky-50 rounded-xl p-3.5 text-center">
          <Users size={18} className="text-sky-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-sky-600">+{nuevos}</p>
          <p className="text-xs text-sky-400">Nuevos este mes</p>
        </div>
      </div>

      {/* ── Distribución por rol */}
      {Object.keys(porRol).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {Object.entries(porRol)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([rol, count]) => (
              <RolCard key={rol} rol={rol} count={count} total={totalGlobal} />
            ))}
        </div>
      )}

      {/* ── Filtros */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={filtros.buscar}
            onChange={e => setFiltros({ buscar: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
          />
        </div>
        <select
          value={filtros.activo}
          onChange={e => setFiltros({ activo: e.target.value })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-slate-700"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Suspendidos</option>
        </select>
      </div>

      {/* ── Tabla */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {error && (
          <div className="p-4 text-sm text-red-600 flex justify-between border-b border-slate-100">
            {error}
            <button onClick={retry} className="underline text-xs">Reintentar</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 hidden lg:table-cell">Ubicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 hidden xl:table-cell">Registro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center py-12 text-slate-400">
                      <Users className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No se encontraron usuarios</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <UsuarioRow
                    key={u.id ?? u.idUsuario}
                    usuario={u}
                    onVer={setVerModal}
                    onSuspender={setSuspModal}
                    onActivar={setActivModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación simple */}
        {total > filtros.size && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Mostrando {Math.min(filtros.size, usuarios.length)} de {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltros({ page: Math.max(0, filtros.page - 1) })}
                disabled={filtros.page === 0 || loading}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => setFiltros({ page: filtros.page + 1 })}
                disabled={(filtros.page + 1) * filtros.size >= total || loading}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modales */}
      <UsuarioModal
        usuario={verModal}
        onClose={() => setVerModal(null)}
        onSuspender={setSuspModal}
        onActivar={setActivModal}
      />
      <ConfirmModal
        open={!!suspModal}
        title="Suspender usuario"
        message={`¿Deseas suspender la cuenta de ${suspModal?.nombre ?? ''}? El usuario no podrá iniciar sesión.`}
        icon={UserX}
        confirmLabel="Suspender"
        confirmClass="bg-red-500 hover:bg-red-600 text-white"
        requireMotivo
        motivoLabel="Motivo de la suspensión"
        loading={actionLoading}
        onConfirm={handleSuspender}
        onCancel={() => setSuspModal(null)}
      />
      <ConfirmModal
        open={!!activModal}
        title="Activar usuario"
        message={`¿Deseas reactivar la cuenta de ${activModal?.nombre ?? ''}?`}
        icon={UserCheck}
        confirmLabel="Activar"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        loading={actionLoading}
        onConfirm={handleActivar}
        onCancel={() => setActivModal(null)}
      />
    </div>
  )
}
