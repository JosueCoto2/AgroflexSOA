import { useState } from 'react'
import { ShoppingBag, AlertTriangle, PackageSearch, Download, RotateCcw } from 'lucide-react'
import { useAdminPedidos } from '../../hooks/useAdminPedidos'
import { useToast } from '../../components/admin/ToastNotification'
import ConfirmModal from '../../components/admin/ConfirmModal'
import { adminService } from '../../services/adminService'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const ESTADO_BADGE = {
  PENDIENTE:      'bg-slate-100 text-slate-500',
  RETENIDO:       'bg-blue-100 text-blue-600',
  EN_CAMINO:      'bg-orange-100 text-orange-600',
  ENTREGA_PEND:   'bg-purple-100 text-purple-600',
  COMPLETADO:     'bg-green-100 text-green-600',
  CANCELADO:      'bg-red-100 text-red-600',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try { return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

function formatPrice(price) {
  if (!price) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

export default function AdminPedidos() {
  const { pedidos, total, loading, error, filtros, setFiltros, retry, intervenir, actionLoading } = useAdminPedidos()
  const { toast } = useToast()
  const [intervModal,    setIntervModal]    = useState(null)
  const [reembolsoModal, setReembolsoModal] = useState(null)
  const [accion,         setAccion]         = useState('LIBERAR_PAGO')
  const [exportLoading,  setExportLoading]  = useState(false)
  const [reembolsoLoad,  setReembolsoLoad]  = useState(false)

  const handleExportarCsv = async () => {
    setExportLoading(true)
    try {
      const blob = await adminService.exportarPedidosCsv()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'pedidos_agroflex.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV descargado')
    } catch { toast.error('Error al exportar') }
    finally { setExportLoading(false) }
  }

  const handleReembolso = async (motivo) => {
    setReembolsoLoad(true)
    try {
      await adminService.reembolsarPedido(reembolsoModal.id, motivo)
      toast.success(`Reembolso iniciado para pedido #${reembolsoModal.id}`)
      setReembolsoModal(null)
      retry()
    } catch { toast.error('Error al iniciar reembolso') }
    finally { setReembolsoLoad(false) }
  }

  const handleIntervenir = async (motivo) => {
    try {
      await intervenir(intervModal.id, accion, motivo)
      toast.success(`Intervención aplicada: ${accion}`)
      setIntervModal(null)
    } catch { toast.error('Error al intervenir en el pedido') }
  }

  return (
    <div style={FONT}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pedidos</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} pedidos en el sistema</p>
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
        <select
          value={filtros.estado}
          onChange={e => setFiltros({ estado: e.target.value })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-slate-700"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="RETENIDO">Retenido</option>
          <option value="EN_CAMINO">En camino</option>
          <option value="COMPLETADO">Completado</option>
          <option value="CANCELADO">Cancelado</option>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Comprador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Vendedor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 animate-pulse">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded" /></td>)}
                  </tr>
                ))
              ) : pedidos.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="flex flex-col items-center py-12 text-slate-400">
                    <PackageSearch className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">No hay pedidos</p>
                  </div>
                </td></tr>
              ) : (
                pedidos.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">#{p.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{p.compradorNombre ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{p.vendedorNombre ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatPrice(p.monto)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ESTADO_BADGE[p.estado] ?? ESTADO_BADGE.PENDIENTE}`}>
                        {p.estado ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(p.fecha)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {['RETENIDO', 'EN_CAMINO', 'ENTREGA_PEND'].includes(p.estado) && (
                          <button
                            onClick={() => setIntervModal(p)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-lg transition-all"
                          >
                            Intervenir
                          </button>
                        )}
                        {['RETENIDO', 'CANCELADO'].includes(p.estado) && (
                          <button
                            onClick={() => setReembolsoModal(p)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reembolsar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal intervención */}
      {intervModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIntervModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-up p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">Intervenir en pedido #{intervModal.id}</h3>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Acción administrativa</label>
              <select
                value={accion}
                onChange={e => setAccion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-slate-700"
              >
                <option value="LIBERAR_PAGO">Liberar pago al vendedor</option>
                <option value="REEMBOLSAR">Reembolsar al comprador</option>
                <option value="CANCELAR">Cancelar pedido</option>
              </select>
            </div>
            <ConfirmModal
              open
              title="Confirmar intervención"
              message="Esta es una acción administrativa. Asegúrate de que es la acción correcta."
              icon={AlertTriangle}
              confirmLabel="Confirmar"
              confirmClass="bg-orange-500 hover:bg-orange-600 text-white"
              requireMotivo
              motivoLabel="Motivo de la intervención (obligatorio)"
              loading={actionLoading}
              onConfirm={handleIntervenir}
              onCancel={() => setIntervModal(null)}
            />
          </div>
        </div>
      )}
      {/* Modal reembolso */}
      <ConfirmModal
        open={!!reembolsoModal}
        title={`Reembolso — Pedido #${reembolsoModal?.id ?? ''}`}
        message={`¿Confirmas iniciar el reembolso para el pedido #${reembolsoModal?.id ?? ''}? Esta acción se procesará con Stripe.`}
        icon={RotateCcw}
        confirmLabel="Iniciar reembolso"
        confirmClass="bg-blue-600 hover:bg-blue-700 text-white"
        requireMotivo
        motivoLabel="Motivo del reembolso (obligatorio)"
        loading={reembolsoLoad}
        onConfirm={handleReembolso}
        onCancel={() => setReembolsoModal(null)}
      />
    </div>
  )
}
