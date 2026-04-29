import { BadgeCheck, CheckCircle, XCircle, PackageSearch } from 'lucide-react'
import { useState } from 'react'
import { useAdminInsignias } from '../../hooks/useAdminInsignias'
import { useToast } from '../../components/admin/ToastNotification'
import SolicitudInsigniaCard from '../../components/admin/SolicitudInsigniaCard'
import ConfirmModal from '../../components/admin/ConfirmModal'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

export default function AdminInsignias() {
  const { pendientes, stats, loading, error, retry, aprobar, rechazar, actionLoading } = useAdminInsignias()
  const { toast } = useToast()
  const [aprobModal, setAprobModal] = useState(null)
  const [rechModal, setRechModal]   = useState(null)

  const handleAprobar = async (comentario) => {
    try {
      await aprobar(aprobModal.id, comentario)
      toast.success(`Insignia aprobada para ${aprobModal.nombreUsuario}`)
      setAprobModal(null)
    } catch {
      toast.error('Error al aprobar la insignia')
    }
  }

  const handleRechazar = async (motivo) => {
    try {
      await rechazar(rechModal.id, motivo)
      toast.success(`Solicitud rechazada`)
      setRechModal(null)
    } catch {
      toast.error('Error al rechazar la solicitud')
    }
  }

  return (
    <div style={FONT}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Insignias</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {stats?.pendientes ?? 0} pendientes · {stats?.aprobadas ?? 0} aprobadas · {stats?.rechazadas ?? 0} rechazadas
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between">
          {error}
          <button onClick={retry} className="underline text-xs">Reintentar</button>
        </div>
      )}

      {/* Cards de solicitudes pendientes */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
              <div className="flex gap-2 pt-2">
                <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
                <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : pendientes.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <PackageSearch className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">No hay solicitudes pendientes</p>
          <p className="text-xs text-slate-400 mt-1">Todas las solicitudes han sido procesadas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendientes.map(s => (
            <SolicitudInsigniaCard
              key={s.id}
              solicitud={s}
              onAprobar={setAprobModal}
              onRechazar={setRechModal}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <ConfirmModal
        open={!!aprobModal}
        title={`Aprobar insignia — ${aprobModal?.nombreUsuario ?? ''}`}
        message={`¿Confirmas que deseas aprobar la solicitud de insignia como ${aprobModal?.rolSolicitado}?`}
        icon={CheckCircle}
        confirmLabel="Aprobar"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        requireMotivo={false}
        motivoLabel="Comentario interno (opcional)"
        loading={actionLoading}
        onConfirm={handleAprobar}
        onCancel={() => setAprobModal(null)}
      />
      <ConfirmModal
        open={!!rechModal}
        title={`Rechazar solicitud — ${rechModal?.nombreUsuario ?? ''}`}
        message="El solicitante verá este mensaje. Sé claro y profesional."
        icon={XCircle}
        confirmLabel="Rechazar"
        confirmClass="bg-red-500 hover:bg-red-600 text-white"
        requireMotivo
        motivoLabel="Motivo del rechazo (obligatorio)"
        loading={actionLoading}
        onConfirm={handleRechazar}
        onCancel={() => setRechModal(null)}
      />
    </div>
  )
}
