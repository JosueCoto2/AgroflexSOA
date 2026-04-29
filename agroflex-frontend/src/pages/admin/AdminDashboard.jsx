import { Users, Package, BadgeCheck, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminStats } from '../../hooks/useAdminStats'
import MetricaCard from '../../components/admin/MetricaCard'
import ActividadReciente from '../../components/admin/ActividadReciente'
import { ROUTES } from '../../routes/routeConfig'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

export default function AdminDashboard() {
  const { stats, actividad, loading, error, retry } = useAdminStats()
  const navigate = useNavigate()

  return (
    <div style={FONT}>
      <h1 className="text-xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center justify-between">
          {error}
          <button onClick={retry} className="text-xs font-medium underline">Reintentar</button>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {/* Usuarios */}
        <MetricaCard
          title="Total usuarios"
          value={stats?.usuarios?.total}
          icon={Users}
          color="blue"
          loading={loading}
        >
          {stats?.usuarios?.porRol && Object.entries(stats.usuarios.porRol)
            .filter(([, v]) => v > 0)
            .map(([rol, count]) => (
              <div key={rol} className="flex justify-between">
                <span>{rol}</span><span className="font-semibold">{count}</span>
              </div>
            ))}
        </MetricaCard>

        {/* Productos */}
        <MetricaCard
          title="Productos publicados"
          value={stats?.productos?.total}
          icon={Package}
          color="green"
          loading={loading}
        >
          {stats?.productos && (
            <>
              <div className="flex justify-between"><span>Cosechas</span><span className="font-semibold">{stats.productos.cosechas}</span></div>
              <div className="flex justify-between"><span>Suministros</span><span className="font-semibold">{stats.productos.suministros}</span></div>
            </>
          )}
        </MetricaCard>

        {/* Insignias */}
        <MetricaCard
          title="Insignias pendientes"
          value={stats?.insignias?.pendientes}
          icon={BadgeCheck}
          color={stats?.insignias?.pendientes > 0 ? 'orange' : 'green'}
          loading={loading}
          cta={stats?.insignias?.pendientes > 0 ? (
            <button
              onClick={() => navigate(ROUTES.ADMIN_INSIGNIAS)}
              className="w-full py-1.5 text-xs font-bold text-orange-600 border border-orange-300 hover:bg-orange-50 rounded-lg transition-all"
            >
              Revisar ahora
            </button>
          ) : null}
        />

        {/* Disputas */}
        <MetricaCard
          title="Disputas abiertas"
          value={stats?.disputas?.abiertas}
          icon={AlertTriangle}
          color={stats?.disputas?.abiertas > 0 ? 'red' : 'green'}
          loading={loading}
          cta={stats?.disputas?.abiertas > 0 ? (
            <button
              onClick={() => navigate(ROUTES.ADMIN_DISPUTAS)}
              className="w-full py-1.5 text-xs font-bold text-red-600 border border-red-300 hover:bg-red-50 rounded-lg transition-all"
            >
              Ver disputas
            </button>
          ) : null}
        />
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Actividad reciente</h2>
        <ActividadReciente actividad={actividad} loading={loading} />
      </div>
    </div>
  )
}
