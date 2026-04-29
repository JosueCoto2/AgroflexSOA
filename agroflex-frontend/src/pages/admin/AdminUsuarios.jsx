import { useState } from 'react'
import { Search, Users, AlertTriangle, UserX, UserCheck, Download } from 'lucide-react'
import { useAdminUsuarios } from '../../hooks/useAdminUsuarios'
import { useToast } from '../../components/admin/ToastNotification'
import UsuarioRow from '../../components/admin/UsuarioRow'
import UsuarioModal from '../../components/admin/UsuarioModal'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { adminService } from '../../services/adminService'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

export default function AdminUsuarios() {
  const { usuarios, total, loading, error, filtros, setFiltros, retry, suspender, activar, actionLoading } = useAdminUsuarios()
  const { toast }  = useToast()
  const [verModal, setVerModal]           = useState(null)
  const [suspModal, setSuspModal]         = useState(null)
  const [activModal, setActivModal]       = useState(null)
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

  const handleSuspender = async (motivo) => {
    try {
      await suspender(suspModal.idUsuario ?? suspModal.id, motivo)
      toast.success(`Usuario suspendido`)
      setSuspModal(null)
    } catch {
      toast.error('Error al suspender usuario')
    }
  }

  const handleActivar = async (motivo) => {
    try {
      await activar(activModal.idUsuario ?? activModal.id, motivo)
      toast.success(`Usuario activado`)
      setActivModal(null)
    } catch {
      toast.error('Error al activar usuario')
    }
  }

  return (
    <div style={FONT}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} usuarios registrados</p>
        </div>
        <button
          onClick={handleExportarCsv}
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-card disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exportLoading ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
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

      {/* Tabla */}
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
      </div>

      {/* Modales */}
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
