/**
 * NotificacionesPage — Bandeja de notificaciones del usuario (/notificaciones).
 *
 * Flujo SOA: NotificacionesPage → notificationsApi → notifications-service (8088)
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, Loader2, AlertCircle,
  ShoppingCart, Package, CreditCard, QrCode, ShieldCheck, Info,
} from 'lucide-react'
import notificationsApi from '../../api/notificationsApi'
import { useNotificacionesSSE } from '../../hooks/useNotificacionesSSE'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

// ── Icono y color por categoría ────────────────────────────────────────────
const CATEGORIA_META = {
  orden_nueva:       { icon: ShoppingCart, color: 'bg-sky-50 text-sky-600' },
  orden_actualizada: { icon: Package,      color: 'bg-amber-50 text-amber-600' },
  pago:              { icon: CreditCard,   color: 'bg-green-50 text-green-600' },
  qr:                { icon: QrCode,       color: 'bg-violet-50 text-violet-600' },
  insignia:          { icon: ShieldCheck,  color: 'bg-teal-50 text-teal-600' },
}

function getMeta(categoria) {
  return CATEGORIA_META[categoria] ?? { icon: Info, color: 'bg-slate-100 text-slate-500' }
}

function formatFecha(iso) {
  if (!iso) return ''
  const d      = new Date(iso)
  const diffMs = Date.now() - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1)  return 'Ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)   return `hace ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7)    return `hace ${diffD} día${diffD > 1 ? 's' : ''}`
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

// ── Componente principal ───────────────────────────────────────────────────
export default function NotificacionesPage() {
  const navigate = useNavigate()
  const [notifs,      setNotifs]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [marcando,    setMarcando]    = useState(false)
  const [page,        setPage]        = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [cargandoMas, setCargandoMas] = useState(false)

  // Recibir nuevas notificaciones en tiempo real vía SSE
  const { nuevaNotif } = useNotificacionesSSE()
  useEffect(() => {
    if (!nuevaNotif) return
    setNotifs(prev => {
      // Evitar duplicados
      if (prev.some(n => n.idNotif === nuevaNotif.idNotif)) return prev
      return [nuevaNotif, ...prev]
    })
  }, [nuevaNotif])

  const cargar = useCallback(async (pg = 0, acumular = false) => {
    pg === 0 ? setLoading(true) : setCargandoMas(true)
    setError(null)
    try {
      const res = await notificationsApi.getMisNotificaciones(pg, 20)
      const { content, totalPages: tp } = res.data
      setNotifs(prev => acumular ? [...prev, ...(content ?? [])] : (content ?? []))
      setTotalPages(tp ?? 1)
      setPage(pg)
    } catch {
      setError('No se pudieron cargar las notificaciones.')
    } finally {
      setLoading(false)
      setCargandoMas(false)
    }
  }, [])

  useEffect(() => { cargar(0) }, [cargar])

  async function handleMarcarTodas() {
    setMarcando(true)
    try {
      await notificationsApi.marcarTodasLeidas()
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })))
    } catch {
      // silencioso — la lectura es best-effort
    } finally {
      setMarcando(false)
    }
  }

  async function handleMarcarUna(idNotif) {
    try {
      await notificationsApi.marcarLeida(idNotif)
      setNotifs(prev =>
        prev.map(n => n.idNotif === idNotif ? { ...n, leida: true } : n)
      )
    } catch {
      // silencioso
    }
  }

  function handleClickNotif(n) {
    if (!n.leida) handleMarcarUna(n.idNotif)
    // Navegar a la URL embebida en datosExtra si existe
    if (n.datosExtra) {
      try {
        const extra = typeof n.datosExtra === 'string' ? JSON.parse(n.datosExtra) : n.datosExtra
        if (extra?.url) {
          navigate(extra.url)
          return
        }
      } catch {
        // datosExtra no es JSON válido — ignorar
      }
    }
  }

  const noLeidas = notifs.filter(n => !n.leida).length
  const hayMas   = page + 1 < totalPages

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* ── Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">Notificaciones</h1>
            {noLeidas > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {noLeidas}
              </span>
            )}
          </div>
          {noLeidas > 0 && (
            <button
              onClick={handleMarcarTodas}
              disabled={marcando}
              className="flex items-center gap-1.5 text-sm font-semibold text-verde-600 hover:text-verde-700 transition-colors disabled:opacity-60"
            >
              {marcando
                ? <Loader2 size={14} className="animate-spin" />
                : <CheckCheck size={15} />}
              Marcar todas
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

        {/* ── Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => cargar(0)} className="ml-auto underline text-xs">
              Reintentar
            </button>
          </div>
        )}

        {/* ── Cargando */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-100 flex items-center justify-center py-16">
            <Loader2 size={28} className="text-verde-500 animate-spin" />
          </div>
        )}

        {/* ── Lista vacía */}
        {!loading && !error && notifs.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <Bell size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="font-bold text-slate-500">Sin notificaciones</p>
            <p className="text-slate-400 text-sm mt-1">
              Aquí verás tus alertas de pedidos, pagos y más
            </p>
          </div>
        )}

        {/* ── Lista */}
        {!loading && notifs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
            {notifs.map(n => {
              const { icon: Icon, color } = getMeta(n.categoria)
              return (
                <div
                  key={n.idNotif}
                  onClick={() => handleClickNotif(n)}
                  className={`flex items-start gap-3 px-4 py-4 transition-colors cursor-pointer ${
                    n.leida
                      ? 'bg-white hover:bg-slate-50/60'
                      : 'bg-sky-50/40 hover:bg-sky-50/70'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={17} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.leida ? 'text-slate-600' : 'font-semibold text-slate-800'}`}>
                      {n.titulo}
                    </p>
                    {n.cuerpo && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {n.cuerpo}
                      </p>
                    )}
                    <p className="text-xs text-slate-300 mt-1">{formatFecha(n.createdAt)}</p>
                  </div>

                  {!n.leida && (
                    <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Cargar más */}
        {hayMas && !loading && (
          <button
            onClick={() => cargar(page + 1, true)}
            disabled={cargandoMas}
            className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {cargandoMas
              ? <><Loader2 size={15} className="animate-spin" /> Cargando…</>
              : 'Ver más'}
          </button>
        )}

      </div>
    </div>
  )
}
