import { useState } from 'react'
import { Search, Package, EyeOff, Eye, Trash2, MoreVertical, AlertTriangle, PackageSearch } from 'lucide-react'
import { useAdminCatalogo } from '../../hooks/useAdminCatalogo'
import { useToast } from '../../components/admin/ToastNotification'
import ConfirmModal from '../../components/admin/ConfirmModal'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

function formatPrice(price) {
  if (!price) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
}

export default function AdminCatalogo() {
  const { productos, total, loading, error, filtros, setFiltros, retry, eliminar, suspender, restaurar, actionLoading } = useAdminCatalogo()
  const { toast } = useToast()
  const [elimModal, setElimModal] = useState(null)
  const [suspModal, setSuspModal] = useState(null)
  const [menuOpen, setMenuOpen]   = useState(null)

  const handleEliminar = async (motivo) => {
    try {
      await eliminar(elimModal.id, motivo)
      toast.success('Producto eliminado')
      setElimModal(null)
    } catch { toast.error('Error al eliminar producto') }
  }

  const handleSuspender = async (motivo) => {
    try {
      await suspender(suspModal.id, motivo)
      toast.success('Producto suspendido')
      setSuspModal(null)
    } catch { toast.error('Error al suspender producto') }
  }

  const handleRestaurar = async (id) => {
    try {
      await restaurar(id)
      toast.success('Producto restaurado')
      setMenuOpen(null)
    } catch { toast.error('Error al restaurar producto') }
  }

  return (
    <div style={FONT}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Catálogo</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} productos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o vendedor..."
            value={filtros.buscar}
            onChange={e => setFiltros({ buscar: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
          />
        </div>
        <select
          value={filtros.tipo}
          onChange={e => setFiltros({ tipo: e.target.value })}
          className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30 bg-white text-slate-700"
        >
          <option value="">Todos los tipos</option>
          <option value="cosecha">Cosechas</option>
          <option value="suministro">Suministros</option>
        </select>
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

      {/* Grid de productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse">
              <div className="h-40 bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <PackageSearch className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-card overflow-hidden relative">
              {/* Imagen */}
              <div className="h-40 bg-slate-100 relative">
                {p.imagenPrincipal ? (
                  <img src={p.imagenPrincipal} alt={p.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                {!p.activo && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    Suspendido
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm font-semibold text-slate-800 truncate">{p.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{p.nombreVendedor}</p>
                <p className="text-sm font-bold text-green-700 mt-1">{formatPrice(p.precio)} / {p.unidad}</p>
              </div>

              {/* Menú acciones */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                  className="w-7 h-7 flex items-center justify-center bg-white/90 rounded-lg shadow text-slate-600 hover:text-slate-800 transition-all"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
                {menuOpen === p.id && (
                  <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-card border border-slate-100 overflow-hidden z-10">
                    {p.activo ? (
                      <button
                        onClick={() => { setSuspModal(p); setMenuOpen(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Suspender
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestaurar(p.id)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Restaurar
                      </button>
                    )}
                    <button
                      onClick={() => { setElimModal(p); setMenuOpen(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <ConfirmModal
        open={!!suspModal}
        title="Suspender producto"
        message={`¿Deseas suspender "${suspModal?.nombre}"? Dejará de aparecer en el catálogo.`}
        icon={EyeOff}
        confirmLabel="Suspender"
        confirmClass="bg-orange-500 hover:bg-orange-600 text-white"
        requireMotivo
        motivoLabel="Motivo de la suspensión"
        loading={actionLoading}
        onConfirm={handleSuspender}
        onCancel={() => setSuspModal(null)}
      />
      <ConfirmModal
        open={!!elimModal}
        title="Eliminar producto permanentemente"
        message={`⚠️ Esta acción es IRREVERSIBLE. Se eliminará "${elimModal?.nombre}" y no podrá recuperarse.`}
        icon={AlertTriangle}
        confirmLabel="Sí, eliminar"
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        requireMotivo
        motivoLabel="Motivo de eliminación (obligatorio)"
        loading={actionLoading}
        onConfirm={handleEliminar}
        onCancel={() => setElimModal(null)}
      />
    </div>
  )
}
