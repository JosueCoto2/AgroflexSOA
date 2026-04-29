/**
 * MisPedidos — Pantalla de pedidos del usuario (/mis-pedidos).
 *
 * Muestra tabs "Como Comprador" / "Como Vendedor" según el rol.
 * Flujo SOA: MisPedidos → usePedidos → pedidoService → axiosClient → order-service
 */
import { PackageSearch, AlertCircle, RefreshCw } from 'lucide-react'
import { usePedidos }      from '../../hooks/usePedidos'
import TabsPedidos         from '../../components/pedidos/TabsPedidos'
import FiltroPedidos       from '../../components/pedidos/FiltroPedidos'
import OrdenCard           from '../../components/pedidos/OrdenCard'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

export default function MisPedidos() {
  const {
    pedidos,
    loading,
    error,
    filtros,
    setFiltros,
    tabActivo,
    setTabActivo,
    retry,
  } = usePedidos()

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* ── Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-bold text-slate-800 mb-3">Mis Pedidos</h1>
          <TabsPedidos activo={tabActivo} onChange={setTabActivo} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* ── Filtros */}
        <FiltroPedidos filtros={filtros} onChange={setFiltros} />

        {/* ── Loading */}
        {loading && <SkeletonList />}

        {/* ── Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-2">No se pudieron cargar los pedidos</p>
            <p className="text-xs text-slate-400 mb-5 max-w-xs">{error}</p>
            <button
              onClick={retry}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* ── Empty */}
        {!loading && !error && pedidos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <PackageSearch className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              Aún no tienes pedidos
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              {tabActivo === 'comprador'
                ? 'Cuando hagas un pedido en el catálogo aparecerá aquí.'
                : 'Cuando recibas un pedido de un comprador aparecerá aquí.'}
            </p>
          </div>
        )}

        {/* ── Lista de órdenes */}
        {!loading && !error && pedidos.length > 0 && (
          <div className="space-y-3">
            {pedidos.map(orden => (
              <OrdenCard key={orden.id} orden={orden} tabActivo={tabActivo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-3 bg-slate-100 rounded w-20" />
            <div className="h-5 bg-slate-100 rounded-lg w-28" />
          </div>
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="w-16 space-y-1.5">
              <div className="h-4 bg-slate-100 rounded" />
              <div className="h-3 bg-slate-100 rounded w-2/3 ml-auto" />
            </div>
          </div>
          <div className="mt-4 h-10 bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  )
}
