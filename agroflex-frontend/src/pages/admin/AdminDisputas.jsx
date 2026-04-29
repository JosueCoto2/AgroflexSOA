import { useState } from 'react'
import { AlertTriangle, PackageSearch } from 'lucide-react'
import { useAdminDisputas } from '../../hooks/useAdminDisputas'
import { useToast } from '../../components/admin/ToastNotification'
import DisputaCard from '../../components/admin/DisputaCard'
import ConfirmModal from '../../components/admin/ConfirmModal'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const TABS = [
  { label: 'Abiertas',    value: 'ABIERTA' },
  { label: 'En revisión', value: 'EN_REVISION' },
  { label: 'Resueltas',   value: 'RESUELTA' },
  { label: 'Todas',       value: 'TODAS' },
]

export default function AdminDisputas() {
  const { disputas, total, loading, error, tabActivo, setTabActivo, retry, tomar, resolver, actionLoading } = useAdminDisputas()
  const { toast } = useToast()
  const [resolverModal, setResolverModal] = useState(null)
  const [verModal, setVerModal]           = useState(null)

  const handleTomar = async (disputa) => {
    try {
      await tomar(disputa.id)
      toast.success('Caso tomado exitosamente')
    } catch { toast.error('Error al tomar el caso') }
  }

  const handleResolver = async (resolucion) => {
    try {
      await resolver(resolverModal.id, resolucion, 'RESOLVER')
      toast.success('Disputa resuelta')
      setResolverModal(null)
    } catch { toast.error('Error al resolver la disputa') }
  }

  return (
    <div style={FONT}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Disputas</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} disputas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTabActivo(t.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all
              ${tabActivo === t.value
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between">
          {error}
          <button onClick={retry} className="underline text-xs">Reintentar</button>
        </div>
      )}

      {/* Grid de disputas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse space-y-3">
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
              <div className="flex gap-2 pt-2">
                <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
                <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : disputas.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <PackageSearch className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm font-medium">No hay disputas en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disputas.map(d => (
            <DisputaCard
              key={d.id}
              disputa={d}
              onTomar={handleTomar}
              onVer={setVerModal}
              onResolver={setResolverModal}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!resolverModal}
        title={`Resolver disputa — Pedido #${resolverModal?.idPedido}`}
        message="Describe la resolución para esta disputa. Ambas partes podrán ver esta decisión."
        icon={AlertTriangle}
        confirmLabel="Resolver"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        requireMotivo
        motivoLabel="Resolución (obligatorio)"
        loading={actionLoading}
        onConfirm={handleResolver}
        onCancel={() => setResolverModal(null)}
      />
    </div>
  )
}
