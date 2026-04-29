import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingBag, QrCode, BadgeCheck,
  TrendingUp, ChevronRight, Sprout, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routeConfig'

const MOCK_PEDIDOS = []

const FILTER_CHIPS = ['Todos', 'Pendientes', 'En camino', 'Completados']

function estadoBadge(estado) {
  switch (estado) {
    case 'PENDIENTE':       return { cls: 'bg-ambar-100 text-ambar-700',   label: 'Pendiente' }
    case 'EN_CAMINO':       return { cls: 'bg-info-50 text-info-600',       label: 'En camino' }
    case 'COMPLETADO':      return { cls: 'bg-verde-100 text-verde-600',    label: 'Completado' }
    case 'LISTO_ENTREGA':   return { cls: 'bg-verde-400 text-white',        label: 'Listo entrega' }
    default:                return { cls: 'bg-campo-100 text-campo-500',    label: estado }
  }
}

export default function DashboardBuyer() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState('Todos')

  const stats = {
    pendientes:   MOCK_PEDIDOS.filter(p => p.estado === 'PENDIENTE' || p.estado === 'LISTO_ENTREGA').length,
    enCamino:     MOCK_PEDIDOS.filter(p => p.estado === 'EN_CAMINO').length,
    completados:  MOCK_PEDIDOS.filter(p => p.estado === 'COMPLETADO').length,
  }

  const filteredPedidos = activeFilter === 'Todos'
    ? MOCK_PEDIDOS
    : MOCK_PEDIDOS.filter(p => {
        if (activeFilter === 'Pendientes')   return p.estado === 'PENDIENTE' || p.estado === 'LISTO_ENTREGA'
        if (activeFilter === 'En camino')    return p.estado === 'EN_CAMINO'
        if (activeFilter === 'Completados')  return p.estado === 'COMPLETADO'
        return true
      })

  return (
    <div className="bg-campo-50 min-h-screen pt-14 pb-24">

      {/* ── HERO */}
      <div className="bg-verde-400 px-4 py-5">
        <h1 className="text-2xl font-black text-white font-display leading-tight mb-1">
          Mis compras
        </h1>
        <p className="text-sm text-white/70 font-sans mb-4">
          {MOCK_PEDIDOS.length} pedidos en total
        </p>

        {/* Mini stats */}
        <div className="flex gap-2">
          {[
            { label: 'Pendientes', value: stats.pendientes },
            { label: 'En camino',  value: stats.enCamino },
            { label: 'Completadas', value: stats.completados },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex-1 bg-white/15 rounded-chip px-2 py-2 text-center"
            >
              <p className="text-lg font-black text-white font-display leading-none">{value}</p>
              <p className="text-[10px] text-white/70 font-sans mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Arch transition */}
      <div className="bg-campo-50 rounded-tl-3xl rounded-tr-3xl -mt-4 relative z-10">

        {/* ── Filter chips */}
        <div className="px-4 pt-4 pb-1 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={[
                  'px-3 py-1.5 rounded-chip text-xs font-semibold font-sans transition-all whitespace-nowrap',
                  activeFilter === chip
                    ? 'bg-verde-400 text-white shadow-btn'
                    : 'bg-white text-campo-500 border border-campo-100 shadow-card',
                ].join(' ')}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* ── Pedidos list */}
        <div className="mx-4 mt-4">
          {filteredPedidos.length === 0 ? (
            <div className="flex flex-col items-center text-center py-12">
              <ShoppingBag className="w-12 h-12 text-verde-200 mb-3" />
              <p className="text-base font-bold text-campo-700 font-display mb-1">
                Aún no tienes compras
              </p>
              <p className="text-xs text-campo-400 font-sans mb-5 max-w-[220px]">
                Explora el catálogo y realiza tu primer pedido.
              </p>
              <Link
                to={ROUTES.CATALOG}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-verde-400 hover:bg-verde-500 text-white text-sm font-bold rounded-btn shadow-btn transition-all active:scale-95 font-sans"
              >
                <ShoppingBag className="w-4 h-4" />
                Explorar catálogo
              </Link>
            </div>
          ) : (
            filteredPedidos.map((pedido) => {
              const badge = estadoBadge(pedido.estado)
              const isListoEntrega = pedido.estado === 'LISTO_ENTREGA'
              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-card mb-3 p-3 flex items-center gap-3 shadow-card border border-campo-100"
                >
                  {/* Status icon */}
                  <div className="w-11 h-11 rounded-card bg-campo-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-campo-400" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-campo-700 font-display truncate">
                      Pedido #{pedido.id}
                    </p>
                    <p className="text-xs text-campo-400 font-sans mt-0.5 truncate">
                      {pedido.fecha
                        ? new Date(pedido.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                        : '—'}
                    </p>
                  </div>
                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-badge ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <p className="text-sm font-black text-verde-500 font-display">
                      ${pedido.total ?? '0'}
                    </p>
                    {isListoEntrega && (
                      <Link
                        to={ROUTES.QR_SCANNER}
                        className="flex items-center gap-1 px-2 py-1 bg-verde-400 text-white text-[10px] font-bold rounded-badge animate-pulse-g transition-all active:scale-95 font-sans"
                      >
                        <QrCode className="w-3 h-3" />
                        Escanear QR
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Quick actions */}
        <div className="bg-white mx-4 rounded-card p-4 mb-3 shadow-card border border-campo-100">
          <p className="text-[10px] font-bold text-campo-400 uppercase tracking-widest mb-3 font-sans">
            Acciones rápidas
          </p>
          <div className="flex flex-col gap-1">
            {[
              { label: 'Explorar catálogo',  desc: 'Busca cosechas disponibles',         icon: ShoppingBag,  to: ROUTES.CATALOG },
              { label: 'Mis pedidos',        desc: 'Revisa el estado de tus compras',     icon: Package,      to: ROUTES.ORDERS },
              { label: 'Escanear QR',        desc: 'Valida una entrega con código QR',    icon: QrCode,       to: ROUTES.QR_SCANNER },
              { label: 'Mis estadísticas',   desc: 'Historial de compras y gastos',        icon: TrendingUp,   to: ROUTES.ORDERS },
            ].map(({ label, desc, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 py-2.5 transition-all active:scale-[0.98]"
              >
                <div className="w-8 h-8 rounded-chip bg-campo-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-campo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-campo-700 font-sans">{label}</p>
                  <p className="text-xs text-campo-400 font-sans truncate">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-campo-300 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── CTA Vender */}
        <div className="mx-4 mb-4 bg-gradient-to-br from-campo-600 to-verde-500 rounded-card p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-white/15 rounded-fab flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white font-display">¿Quieres vender en AgroFlex?</p>
            <p className="text-xs text-white/70 mt-0.5 leading-snug font-sans">Solicita tu insignia de productor</p>
          </div>
          <Link
            to={ROUTES.VERIFY_BADGE}
            className="shrink-0 flex items-center gap-1 px-3 py-2 bg-white text-verde-600 text-xs font-bold rounded-btn transition-all active:scale-95 font-sans"
          >
            Solicitar
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  )
}
