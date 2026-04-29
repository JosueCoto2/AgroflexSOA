/**
 * TransactionsPage — Resumen financiero y transacciones de la plataforma.
 *
 * Muestra métricas de ingresos, desglose por estado de pago y tabla de pedidos.
 * Flujo SOA: → adminService.getPedidosAdmin() → admin-service (8089)
 */
import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, DollarSign, Lock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react'
import { adminService } from '../../services/adminService'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const ESTADO_META = {
  PENDIENTE:    { label: 'Pendiente',     color: 'bg-slate-100 text-slate-500' },
  RETENIDO:     { label: 'En escrow',     color: 'bg-blue-100 text-blue-600' },
  EN_CAMINO:    { label: 'En camino',     color: 'bg-orange-100 text-orange-600' },
  ENTREGA_PEND: { label: 'Entrega pend.', color: 'bg-purple-100 text-purple-600' },
  COMPLETADO:   { label: 'Completado',    color: 'bg-green-100 text-green-700' },
  CANCELADO:    { label: 'Cancelado',     color: 'bg-red-100 text-red-500' },
}

function formatMXN(val) {
  if (!val && val !== 0) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try { return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

// ── Tarjeta de métrica financiera ──────────────────────────────────────────
function FinancialCard({ title, value, subtitle, icon: Icon, colorClass, loading }) {
  return (
    <div className={`rounded-2xl p-5 shadow-card ${colorClass}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <Icon size={16} className="text-slate-400" />
      </div>
      {loading
        ? <div className="h-7 w-24 bg-white/50 rounded-lg animate-pulse" />
        : <p className="text-2xl font-bold text-slate-800">{value}</p>}
      {subtitle && !loading && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function TransactionsPage() {
  const [pedidos,  setPedidos]  = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [estado,   setEstado]   = useState('')
  const [page,     setPage]     = useState(0)
  const [expanded, setExpanded] = useState(null)
  const SIZE = 25

  async function cargar(pg = 0, est = estado) {
    setLoading(true)
    setError(null)
    try {
      const params = { page: pg, size: SIZE }
      if (est) params.estado = est
      const data = await adminService.getPedidosAdmin(params)
      setPedidos(data.content ?? [])
      setTotal(data.totalElements ?? 0)
      setPage(pg)
    } catch {
      setError('No se pudieron cargar las transacciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar(0, '') }, [])

  function handleFiltro(est) {
    setEstado(est)
    cargar(0, est)
  }

  // Métricas derivadas de la página actual (aproximación visual)
  const metricas = useMemo(() => {
    const completados  = pedidos.filter(p => p.estado === 'COMPLETADO')
    const enEscrow     = pedidos.filter(p => ['RETENIDO', 'EN_CAMINO', 'ENTREGA_PEND'].includes(p.estado))
    const cancelados   = pedidos.filter(p => p.estado === 'CANCELADO')
    const sumaComp     = completados.reduce((s, p) => s + (p.monto ?? 0), 0)
    const sumaEscrow   = enEscrow.reduce((s, p) => s + (p.monto ?? 0), 0)
    return { completados: completados.length, enEscrow: enEscrow.length, cancelados: cancelados.length, sumaComp, sumaEscrow }
  }, [pedidos])

  const totalPages = Math.ceil(total / SIZE)

  return (
    <div style={FONT}>

      {/* ── Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Transacciones</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} pedidos en el sistema</p>
        </div>
        <button
          onClick={() => cargar(page, estado)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle size={14} />{error}</span>
          <button onClick={() => cargar(0)} className="text-xs underline">Reintentar</button>
        </div>
      )}

      {/* ── Métricas financieras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <FinancialCard
          title="Total pedidos"
          value={total}
          subtitle="en la plataforma"
          icon={TrendingUp}
          colorClass="bg-slate-50"
          loading={loading}
        />
        <FinancialCard
          title="Completados"
          value={formatMXN(metricas.sumaComp)}
          subtitle={`${metricas.completados} pedidos en esta página`}
          icon={CheckCircle}
          colorClass="bg-green-50"
          loading={loading}
        />
        <FinancialCard
          title="En escrow"
          value={formatMXN(metricas.sumaEscrow)}
          subtitle={`${metricas.enEscrow} pedidos retenidos`}
          icon={Lock}
          colorClass="bg-blue-50"
          loading={loading}
        />
        <FinancialCard
          title="Cancelados"
          value={metricas.cancelados}
          subtitle="en esta página"
          icon={XCircle}
          colorClass="bg-red-50"
          loading={loading}
        />
      </div>

      {/* ── Filtros por estado */}
      <div className="bg-white rounded-2xl shadow-card p-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {[{ value: '', label: 'Todos' }, ...Object.entries(ESTADO_META).map(([v, m]) => ({ value: v, label: m.label }))].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFiltro(opt.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                estado === opt.value
                  ? 'bg-verde-500 text-white border-verde-500'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Comprador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 hidden md:table-cell">Vendedor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 w-8" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center py-12 text-slate-400">
                      <DollarSign className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm">No hay transacciones con ese filtro</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pedidos.map(p => (
                  <>
                    <tr
                      key={p.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">#{p.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{p.compradorNombre ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 hidden md:table-cell">{p.vendedorNombre ?? '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">{formatMXN(p.monto)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ESTADO_META[p.estado]?.color ?? 'bg-slate-100 text-slate-500'}`}>
                          {ESTADO_META[p.estado]?.label ?? p.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{formatDate(p.fecha)}</td>
                      <td className="px-4 py-2 text-slate-400">
                        {expanded === p.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>
                    {expanded === p.id && (
                      <tr key={`${p.id}-detail`} className="bg-slate-50">
                        <td colSpan={7} className="px-6 py-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-1 text-xs text-slate-500">
                            <span><b className="text-slate-600">Comprador:</b> {p.compradorNombre ?? '—'}</span>
                            <span><b className="text-slate-600">Vendedor:</b> {p.vendedorNombre ?? '—'}</span>
                            <span><b className="text-slate-600">Producto:</b> {p.productoNombre ?? '—'}</span>
                            <span><b className="text-slate-600">Monto:</b> {formatMXN(p.monto)}</span>
                            <span><b className="text-slate-600">Estado:</b> {ESTADO_META[p.estado]?.label ?? p.estado}</span>
                            <span><b className="text-slate-600">Fecha:</b> {formatDate(p.fecha)}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => cargar(page - 1, estado)}
                disabled={page === 0 || loading}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Anterior
              </button>
              <button
                onClick={() => cargar(page + 1, estado)}
                disabled={page + 1 >= totalPages || loading}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
