import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf, ShoppingBag, Package, TrendingUp,
  Plus, ClipboardList, ChevronRight, Sprout,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES }  from '../../routes/routeConfig'

const MOCK_LOTES = []

const FILTER_CHIPS = ['Todas', 'Disponibles', 'Reservadas', 'En escrow']

const CAT_GRADIENTS = {
  default: 'from-verde-100 to-verde-200',
  grain:   'from-ambar-50 to-ambar-100',
  veggie:  'from-campo-100 to-campo-200',
}

const LOTE_EMOJIS = ['🌽', '🥬', '🍅', '🌾', '🥕', '🫑']

function estadoBadge(estado) {
  switch (estado) {
    case 'DISPONIBLE': return { cls: 'bg-verde-100 text-verde-600', label: 'Disponible' }
    case 'RESERVADO':  return { cls: 'bg-ambar-100 text-ambar-700', label: 'Reservado' }
    case 'EN_ESCROW':  return { cls: 'bg-info-50 text-info-600',    label: 'En escrow' }
    default:           return { cls: 'bg-campo-100 text-campo-500', label: estado }
  }
}

export default function DashboardProducer() {
  const { user, roles } = useAuth()
  const rolLabel = roles?.includes('INVERNADERO') ? 'Invernadero' : 'Productor'
  const [activeFilter, setActiveFilter] = useState('Todas')

  // Stats derived from MOCK_LOTES (keep identical logic, just counted inline)
  const stats = {
    disponibles: MOCK_LOTES.filter(l => l.estado === 'DISPONIBLE').length,
    reservadas:  MOCK_LOTES.filter(l => l.estado === 'RESERVADO').length,
    enTransito:  MOCK_LOTES.filter(l => l.estado === 'EN_ESCROW').length,
  }

  const filteredLotes = activeFilter === 'Todas'
    ? MOCK_LOTES
    : MOCK_LOTES.filter(l => {
        if (activeFilter === 'Disponibles') return l.estado === 'DISPONIBLE'
        if (activeFilter === 'Reservadas')  return l.estado === 'RESERVADO'
        if (activeFilter === 'En escrow')   return l.estado === 'EN_ESCROW'
        return true
      })

  return (
    <div className="bg-campo-50 min-h-screen pt-14 pb-24">

      {/* ── HERO */}
      <div className="bg-gradient-to-r from-verde-700 via-verde-500 to-lime-400 px-4 py-6 shadow-xl">
        <p className="text-xs font-semibold text-white/80 uppercase tracking-widest mb-0.5 font-sans">
          {rolLabel}
        </p>
        <h1 className="text-2xl font-black text-white font-display leading-tight mb-1">
          Mis cosechas
        </h1>
        <p className="text-sm text-white/70 font-sans mb-4">
          {MOCK_LOTES.length} publicaciones activas
        </p>

        {/* Mini stats */}
        <div className="flex gap-2">
          {[
            { label: 'Disponibles', value: stats.disponibles },
            { label: 'Reservadas',  value: stats.reservadas },
            { label: 'En tránsito', value: stats.enTransito },
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

        {/* ── Publish button */}
        <div className="px-4 mt-4 mb-4">
          <Link
            to={ROUTES.PRODUCER_LOTS}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-lime-400 via-verde-500 to-verde-700 text-white font-bold text-sm rounded-btn shadow-2xl transition-transform hover:-translate-y-0.5 active:scale-95 font-sans"
          >
            <Plus className="w-4 h-4" />
            Publicar nueva cosecha
          </Link>
        </div>

        {/* ── Lotes list */}
        <div className="mx-4">
          {filteredLotes.length === 0 ? (
            <div className="flex flex-col items-center text-center py-12">
              <Sprout className="w-12 h-12 text-verde-200 mb-3" />
              <p className="text-base font-bold text-campo-700 font-display mb-1">
                Aún no tienes cosechas
              </p>
              <p className="text-xs text-campo-400 font-sans mb-5 max-w-[220px]">
                Publica tu primera cosecha y empieza a recibir pedidos de compradores.
              </p>
              <Link
                to={ROUTES.PRODUCER_LOTS}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-lime-400 via-verde-500 to-verde-700 text-white text-sm font-bold rounded-btn shadow-2xl transition-transform hover:-translate-y-0.5 active:scale-95 font-sans"
              >
                <Plus className="w-4 h-4" />
                Publicar primer lote
              </Link>
            </div>
          ) : (
            filteredLotes.map((lote, i) => {
              const badge  = estadoBadge(lote.estado)
              const emoji  = LOTE_EMOJIS[i % LOTE_EMOJIS.length]
              const grad   = Object.values(CAT_GRADIENTS)[i % 3]
              return (
                <div
                  key={lote.id}
                  className="bg-white/90 rounded-card mb-3 p-3 flex items-center gap-3 shadow-lg border border-green-100 hover:shadow-xl hover:border-verde-200 transition-all"
                >
                  {/* Emoji icon */}
                  <div className={`w-11 h-11 rounded-card bg-gradient-to-br ${grad} flex items-center justify-center text-xl shrink-0`}>
                    {emoji}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-campo-700 font-display truncate">{lote.nombre}</p>
                    <p className="text-xs text-campo-400 font-sans mt-0.5 truncate">
                      {lote.stock} {lote.unidad} disponibles
                    </p>
                  </div>
                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-badge ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <p className="text-sm font-black text-verde-500 font-display">
                      ${lote.precio}/{lote.unidad}
                    </p>
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
              { label: 'Publicar nuevo lote',  desc: 'Agrega una cosecha al catálogo',       icon: Plus,          to: ROUTES.PRODUCER_LOTS },
              { label: 'Explorar catálogo',    desc: 'Cosechas, suministros y más',           icon: ShoppingBag,   to: ROUTES.CATALOG },
              { label: 'Pedidos recibidos',    desc: 'Revisa las órdenes de tus compradores', icon: Package,       to: ROUTES.PRODUCER_ORDERS },
              { label: 'Mis estadísticas',     desc: 'Ventas, tendencias y rendimiento',      icon: TrendingUp,    to: ROUTES.PRODUCER_STATS },
            ].map(({ label, desc, icon: Icon, to }) => (
              <Link
                key={to}
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

        {/* ── Pedidos section */}
        <div className="mx-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-campo-400 uppercase tracking-widest font-sans">
              Pedidos recientes
            </p>
            <Link to={ROUTES.PRODUCER_ORDERS} className="text-xs text-verde-600 font-semibold hover:text-verde-700 font-sans">
              Ver todos
            </Link>
          </div>
          <div className="bg-white rounded-card border border-campo-100 shadow-card p-8 flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-campo-50 rounded-card flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-campo-300" />
            </div>
            <p className="text-sm font-semibold text-campo-600 font-sans mb-1">Sin pedidos recibidos</p>
            <p className="text-xs text-campo-400 font-sans max-w-[220px]">
              Cuando un comprador haga un pedido de tus lotes, aparecerá aquí.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
