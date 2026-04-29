/**
 * DashboardSupplier — Dashboard del rol PROVEEDOR.
 */
import { Link } from 'react-router-dom'
import {
  Package, ShoppingBag, TrendingUp, Star,
  Plus, ArrowRight, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES }  from '../../routes/routeConfig'

const colorMap = {
  verde: 'bg-verde-50  text-verde-600',
  tinta: 'bg-tinta-100 text-tinta-600',
  ambar: 'bg-ambar-50  text-ambar-500',
  blue:  'bg-blue-50   text-blue-600',
}

const stats = [
  { label: 'Suministros activos', value: '0',  icon: Package,      color: 'verde', note: 'Sin suministros publicados' },
  { label: 'Ventas del mes',      value: '$0', icon: TrendingUp,   color: 'tinta', note: 'Próximamente' },
  { label: 'Pedidos pendientes',  value: '0',  icon: ClipboardList, color: 'ambar', note: 'Sin pedidos por atender' },
  { label: 'Mi reputación',       value: '—',  icon: Star,         color: 'blue',  note: 'Sin calificaciones aún' },
]

const MOCK_SUMINISTROS = []

export default function DashboardSupplier() {
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
  })

  const quickActions = [
    {
      label:   'Publicar suministro',
      desc:    'Agrega un insumo o producto al catálogo',
      icon:    Plus,
      to:      `${ROUTES.SUPPLIER_LOTS_NEW}?type=insumos`,
      primary: true,
    },
    {
      label:   'Explorar catálogo',
      desc:    'Cosechas, insumos y más',
      icon:    ShoppingBag,
      to:      ROUTES.CATALOG,
      primary: false,
    },
    {
      label:   'Pedidos recibidos',
      desc:    'Revisa las órdenes de tus clientes',
      icon:    Package,
      to:      ROUTES.SUPPLIER_ORDERS,
      primary: false,
    },
  ]

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 py-6">

      <section className="rounded-[32px] bg-gradient-to-r from-emerald-800 via-emerald-700 to-lime-500 p-8 text-white shadow-[0_30px_80px_rgba(22,163,74,0.2)] overflow-hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/90 mb-2">
              Mi tienda
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tu espacio de insumos listo para vender
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-emerald-100/90 leading-7">
              Administra tu catálogo, recibe pedidos y crea confianza con compradores.
              Esta vista te ayuda a mantener todo claro y activo desde un solo lugar.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-card backdrop-blur-sm">
            {today} · <span className="text-emerald-100">Proveedor</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color, note }) => (
            <div key={label} className="rounded-[28px] bg-white/10 border border-white/15 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
              <div className={`inline-flex items-center justify-center rounded-2xl p-3 mb-4 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-100/90">{label}</p>
              <p className="mt-1 text-xs text-emerald-100/70">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-8">
          <section className="space-y-4 rounded-[28px] bg-white border border-slate-200 p-6 shadow-card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-tinta-900">Acciones rápidas</h2>
                <p className="text-sm text-slate-500">Todo lo esencial para publicar y atender pedidos.</p>
              </div>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                Preparado para vender
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {quickActions.map(({ label, desc, icon: Icon, to, primary }) => (
                <Link
                  key={to}
                  to={to}
                  className={[
                    'group block rounded-[24px] border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                    primary
                      ? 'border-emerald-100 bg-emerald-50 text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-900',
                  ].join(' ')}
                >
                  <div className={['inline-flex h-11 w-11 items-center justify-center rounded-2xl mb-4 shadow-sm', primary ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'].join(' ')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">{label}</p>
                  <p className="text-sm text-slate-500 leading-6">{desc}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-card">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-tinta-900">Mis suministros activos</h2>
                <p className="text-sm text-slate-500">La lista se actualiza cuando publiques productos.</p>
              </div>
              <Link
                to={ROUTES.SUPPLIER_LOTS}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Ver todos
              </Link>
            </div>

            {MOCK_SUMINISTROS.length === 0 ? (
              <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-lg font-semibold text-tinta-900 mb-2">Tu tienda aún espera sus primeros productos</p>
                <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6">
                  Publicar tu primer suministro te ayuda a aparecer en búsquedas de compradores y a comenzar a recibir pedidos rápido.
                </p>
                <Link
                  to={ROUTES.SUPPLIER_LOTS_NEW}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                  Publicar primer suministro
                </Link>
              </div>
            ) : (
              <SuministrosTable suministros={MOCK_SUMINISTROS} />
            )}
          </section>

          <section className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-card">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-tinta-900">Pedidos recientes</h2>
                <p className="text-sm text-slate-500">Controla tu flujo de ventas desde aquí.</p>
              </div>
              <Link
                to={ROUTES.SUPPLIER_ORDERS}
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Ver todos
              </Link>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-tinta-500 shadow-sm">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-tinta-900 mb-2">Aún no hay pedidos</p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Cuando un comprador solicite uno de tus suministros, aparecerá aquí con todos los detalles para que puedas atenderlo rápido.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Consejo</p>
            <h2 className="text-lg font-semibold text-tinta-900 mb-2">Haz que tu tienda destaque</h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Publica descripciones claras y fotos reales de tus insumos.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Actualiza precio y stock para aparecer en búsquedas recientes.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Responde rápido a pedidos para ganar reputación y confianza.
              </li>
            </ul>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-emerald-900 to-slate-900 p-6 text-white shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10">
                <ShoppingBag className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/90">Todo listo</p>
                <p className="text-xl font-bold">Tu tienda puede crecer mucho más</p>
              </div>
            </div>
            <p className="text-sm text-emerald-100 leading-6">
              Aprovecha el catálogo para llegar a más productores y publica insumos que resuelvan necesidades concretas de la región.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SuministrosTable({ suministros }) {
  const estadoBadge = {
    activo:  'bg-verde-100 text-verde-700',
    pausado: 'bg-ambar-100 text-ambar-700',
    agotado: 'bg-tinta-100 text-tinta-500',
  }

  return (
    <div className="bg-white rounded-card border border-tinta-100 shadow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-tinta-100 text-xs text-tinta-400 uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-semibold">Suministro</th>
            <th className="text-right px-4 py-3 font-semibold">Precio</th>
            <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">Stock</th>
            <th className="text-center px-4 py-3 font-semibold">Estado</th>
          </tr>
        </thead>
        <tbody>
          {suministros.map((s) => (
            <tr key={s.id} className="border-b border-tinta-50 hover:bg-tinta-50 transition-colors">
              <td className="px-4 py-3 font-medium text-tinta-800 truncate max-w-[200px]">{s.nombre}</td>
              <td className="px-4 py-3 text-right text-verde-600 font-bold font-display">${s.precio}/{s.unidad}</td>
              <td className="px-4 py-3 text-right text-tinta-500 hidden sm:table-cell">{s.stock} {s.unidad}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-chip ${estadoBadge[s.estado] ?? estadoBadge.activo}`}>
                  {s.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
