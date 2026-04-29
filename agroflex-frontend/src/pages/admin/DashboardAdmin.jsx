/**
 * DashboardAdmin — Panel principal del administrador.
 *
 * Muestra: métricas clave, desglose por rol, actividad reciente y accesos rápidos.
 * Flujo SOA: → adminService.getStats() → admin-service (8089)
 */
import { useNavigate } from 'react-router-dom'
import {
  Users, Package, BadgeCheck, AlertTriangle,
  ShoppingBag, TrendingUp, UserCheck, UserX,
  ArrowRight, RefreshCw,
} from 'lucide-react'
import { useAdminStats }   from '../../hooks/useAdminStats'
import MetricaCard         from '../../components/admin/MetricaCard'
import ActividadReciente   from '../../components/admin/ActividadReciente'
import { ROUTES }          from '../../routes/routeConfig'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

// ── Barra de progreso por rol ──────────────────────────────────────────────
const ROL_COLOR = {
  COMPRADOR:   'bg-sky-400',
  PRODUCTOR:   'bg-green-500',
  INVERNADERO: 'bg-teal-500',
  PROVEEDOR:   'bg-blue-500',
  ADMIN:       'bg-slate-400',
}

function RolBar({ rol, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span className="capitalize">{rol.toLowerCase()}</span>
        <span className="font-semibold text-slate-700">{count} <span className="font-normal text-slate-400">({pct}%)</span></span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${ROL_COLOR[rol] ?? 'bg-slate-300'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Acceso rápido ──────────────────────────────────────────────────────────
function AccesoRapido({ label, desc, to, icon: Icon, urgent }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:shadow-sm w-full ${
        urgent
          ? 'border-red-200 bg-red-50 hover:bg-red-100'
          : 'border-slate-100 bg-white hover:bg-slate-50'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        urgent ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
      }`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${urgent ? 'text-red-700' : 'text-slate-700'}`}>{label}</p>
        {desc && <p className="text-xs text-slate-400 truncate">{desc}</p>}
      </div>
      <ArrowRight size={14} className="text-slate-300 flex-shrink-0" />
    </button>
  )
}

// ── Componente principal ───────────────────────────────────────────────────
export default function DashboardAdmin() {
  const { stats, actividad, loading, error, retry } = useAdminStats()
  const navigate = useNavigate()

  const totalUsuarios = stats?.usuarios?.total ?? 0
  const porRol        = stats?.usuarios?.porRol ?? {}
  const insigniasPend = stats?.insignias?.pendientes ?? 0
  const disputasAbier = stats?.disputas?.abiertas ?? 0

  return (
    <div style={FONT}>

      {/* ── Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Resumen general de la plataforma</p>
        </div>
        <button
          onClick={retry}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
          {error}
          <button onClick={retry} className="text-xs font-medium underline">Reintentar</button>
        </div>
      )}

      {/* ── 4 métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricaCard title="Total usuarios" value={stats?.usuarios?.total} icon={Users} color="blue" loading={loading}>
          {stats?.usuarios && (
            <>
              <div className="flex justify-between"><span>Activos</span><span className="font-semibold text-green-600">{stats.usuarios.activos}</span></div>
              <div className="flex justify-between"><span>Suspendidos</span><span className="font-semibold text-red-500">{stats.usuarios.suspendidos}</span></div>
              <div className="flex justify-between"><span>Nuevos este mes</span><span className="font-semibold">{stats.usuarios.nuevosEsteMes}</span></div>
            </>
          )}
        </MetricaCard>

        <MetricaCard title="Productos publicados" value={stats?.productos?.total} icon={Package} color="green" loading={loading}>
          {stats?.productos && (
            <>
              <div className="flex justify-between"><span>Cosechas</span><span className="font-semibold">{stats.productos.cosechas}</span></div>
              <div className="flex justify-between"><span>Suministros</span><span className="font-semibold">{stats.productos.suministros}</span></div>
              <div className="flex justify-between"><span>Publicados hoy</span><span className="font-semibold text-green-600">{stats.productos.publicadosHoy}</span></div>
            </>
          )}
        </MetricaCard>

        <MetricaCard
          title="Insignias pendientes"
          value={insigniasPend}
          icon={BadgeCheck}
          color={insigniasPend > 0 ? 'orange' : 'green'}
          loading={loading}
          cta={insigniasPend > 0 ? (
            <button
              onClick={() => navigate(ROUTES.ADMIN_INSIGNIAS)}
              className="w-full py-1.5 text-xs font-bold text-orange-600 border border-orange-300 hover:bg-orange-50 rounded-lg transition-all"
            >
              Revisar ahora
            </button>
          ) : null}
        >
          {stats?.insignias && (
            <>
              <div className="flex justify-between"><span>Aprobadas este mes</span><span className="font-semibold text-green-600">{stats.insignias.aprobadasEsteMes}</span></div>
              <div className="flex justify-between"><span>Rechazadas este mes</span><span className="font-semibold text-red-500">{stats.insignias.rechazadasEsteMes}</span></div>
            </>
          )}
        </MetricaCard>

        <MetricaCard
          title="Disputas abiertas"
          value={disputasAbier}
          icon={AlertTriangle}
          color={disputasAbier > 0 ? 'red' : 'green'}
          loading={loading}
          cta={disputasAbier > 0 ? (
            <button
              onClick={() => navigate(ROUTES.ADMIN_DISPUTAS)}
              className="w-full py-1.5 text-xs font-bold text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-all"
            >
              Ver disputas
            </button>
          ) : null}
        >
          {stats?.disputas && (
            <>
              <div className="flex justify-between"><span>En revisión</span><span className="font-semibold text-orange-500">{stats.disputas.enRevision}</span></div>
              <div className="flex justify-between"><span>Resueltas este mes</span><span className="font-semibold text-green-600">{stats.disputas.resueltasEsteMes}</span></div>
            </>
          )}
        </MetricaCard>
      </div>

      {/* ── Fila inferior: desglose + accesos rápidos + actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Desglose de usuarios por rol */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700">Usuarios por rol</h2>
            <button
              onClick={() => navigate(ROUTES.ADMIN_USUARIOS)}
              className="text-xs font-semibold text-verde-600 hover:text-verde-700 flex items-center gap-1"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-1.5 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(porRol)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([rol, count]) => (
                  <RolBar key={rol} rol={rol} count={count} total={totalUsuarios} />
                ))}
              {Object.keys(porRol).length === 0 && (
                <p className="text-xs text-slate-400">Sin datos</p>
              )}
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Accesos rápidos</h2>
          <div className="space-y-2">
            <AccesoRapido
              label="Revisar insignias"
              desc={insigniasPend > 0 ? `${insigniasPend} solicitudes pendientes` : 'Sin pendientes'}
              to={ROUTES.ADMIN_INSIGNIAS}
              icon={BadgeCheck}
              urgent={insigniasPend > 0}
            />
            <AccesoRapido
              label="Gestionar disputas"
              desc={disputasAbier > 0 ? `${disputasAbier} disputas abiertas` : 'Sin disputas'}
              to={ROUTES.ADMIN_DISPUTAS}
              icon={AlertTriangle}
              urgent={disputasAbier > 0}
            />
            <AccesoRapido label="Pedidos" desc="Ver todos los pedidos" to={ROUTES.ADMIN_PEDIDOS} icon={ShoppingBag} />
            <AccesoRapido label="Catálogo" desc="Gestionar productos" to={ROUTES.ADMIN_CATALOGO} icon={Package} />
            <AccesoRapido label="Transacciones" desc="Resumen financiero" to={ROUTES.ADMIN_TRANSACCIONES} icon={TrendingUp} />
            <AccesoRapido label="Usuarios" desc="Gestión completa" to={ROUTES.ADMIN_USUARIOS} icon={Users} />
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Actividad reciente</h2>
          <ActividadReciente actividad={actividad} loading={loading} />
        </div>

      </div>
    </div>
  )
}
