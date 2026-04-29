/**
 * ReputationPage — Página de reputación del usuario autenticado (/resenas).
 *
 * Muestra el promedio de calificación, total de reseñas recibidas
 * y el historial completo usando ReseñasWidget.
 */
import { useState, useEffect } from 'react'
import { Star, TrendingUp, MessageSquare, ShieldCheck } from 'lucide-react'
import useAuthStore        from '../../store/authStore'
import usersApi            from '../../api/usersApi'
import ReseñasWidget       from '../../components/shared/ReseñasWidget'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

export default function ReputationPage() {
  const { user } = useAuthStore()

  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.idUsuario) return
    usersApi.getReseñas(user.idUsuario, 0, 100)
      .then(({ data }) => {
        const reseñas = data.content ?? []
        if (reseñas.length === 0) { setResumen({ promedio: 0, total: 0 }); return }
        const promedio = reseñas.reduce((s, r) => s + r.puntuacion, 0) / reseñas.length
        setResumen({ promedio: promedio.toFixed(1), total: data.totalElements ?? reseñas.length })
      })
      .catch(() => setResumen({ promedio: 0, total: 0 }))
      .finally(() => setLoading(false))
  }, [user?.idUsuario])

  const estrellaColor = (n) =>
    resumen && resumen.promedio >= n
      ? 'text-amber-400 fill-amber-400'
      : 'text-slate-200 fill-slate-200'

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* ── Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-slate-800">Mi Reputación</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Calificaciones que otros usuarios dejaron sobre ti
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── Tarjeta resumen */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-slate-100 rounded-xl w-1/3 mx-auto" />
              <div className="h-4 bg-slate-100 rounded w-1/4 mx-auto" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* Promedio grande */}
              <div className="flex flex-col items-center">
                <span className="text-5xl font-extrabold text-slate-800 leading-none">
                  {resumen?.promedio > 0 ? resumen.promedio : '—'}
                </span>
                <span className="text-xs text-slate-400 mt-1">de 5.0</span>
              </div>

              {/* Estrellas visuales */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={22}
                    className={`transition-colors ${estrellaColor(n)}`}
                  />
                ))}
              </div>

              {/* Total */}
              <p className="text-sm text-slate-500">
                {resumen?.total > 0
                  ? `Basado en ${resumen.total} reseña${resumen.total !== 1 ? 's' : ''}`
                  : 'Aún no tienes reseñas'}
              </p>
            </div>
          )}
        </div>

        {/* ── Métricas rápidas */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Star,
              label: 'Promedio',
              valor: loading ? '…' : (resumen?.promedio > 0 ? resumen.promedio : '—'),
              color: 'bg-amber-50 text-amber-600',
            },
            {
              icon: MessageSquare,
              label: 'Reseñas',
              valor: loading ? '…' : (resumen?.total ?? 0),
              color: 'bg-blue-50 text-blue-600',
            },
            {
              icon: ShieldCheck,
              label: 'Verificado',
              valor: user?.verificado ? 'Sí' : 'No',
              color: user?.verificado ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400',
            },
          ].map(({ icon: Icon, label, valor, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={16} />
              </div>
              <span className="text-base font-bold text-slate-800">{valor}</span>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Lista de reseñas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-600" />
            <h2 className="text-sm font-bold text-slate-700">Historial de reseñas</h2>
          </div>

          {user?.idUsuario
            ? <ReseñasWidget idUsuario={user.idUsuario} />
            : <p className="text-xs text-slate-400">Inicia sesión para ver tus reseñas.</p>
          }
        </div>

      </div>
    </div>
  )
}
