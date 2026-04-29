/**
 * AdminHealthMonitor — Estado en tiempo real de todos los microservicios AgroFlex.
 *
 * Consulta /api/admin/health que a su vez hace ping a /actuator/health de cada servicio.
 * Se refresca automáticamente cada 30 segundos.
 * Flujo SOA: → adminService.getHealth() → admin-service (8089) → todos los servicios
 */
import { useState, useEffect, useCallback } from 'react'
import { Activity, RefreshCw, CheckCircle, XCircle, AlertCircle, Wifi } from 'lucide-react'
import { adminService } from '../../services/adminService'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const ESTADO_META = {
  UP:       { label: 'Activo',    icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700' },
  DOWN:     { label: 'Caído',     icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',    badge: 'bg-red-100 text-red-600' },
  DEGRADED: { label: 'Degradado', icon: AlertCircle, color: 'text-amber-500',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700' },
  UNKNOWN:  { label: 'Desconocido', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-50', badge: 'bg-slate-100 text-slate-500' },
}

function getEstado(estado) {
  return ESTADO_META[estado] ?? ESTADO_META.UNKNOWN
}

function LatencyBar({ ms }) {
  const width = Math.min(100, (ms / 3000) * 100)
  const color  = ms < 500 ? 'bg-green-400' : ms < 1500 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="mt-2">
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${width}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-1">{ms}ms</p>
    </div>
  )
}

function ServicioCard({ servicio }) {
  const meta     = getEstado(servicio.estado)
  const IconComp = meta.icon

  return (
    <div className={`bg-white rounded-2xl shadow-card p-4 border-l-4 ${
      servicio.estado === 'UP'   ? 'border-green-400' :
      servicio.estado === 'DOWN' ? 'border-red-400'   : 'border-amber-400'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-800 truncate pr-2">{servicio.nombre}</h3>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${meta.badge}`}>
          {meta.label}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <IconComp className={`w-4 h-4 ${meta.color}`} />
        <p className="text-xs text-slate-500 truncate">{servicio.url}</p>
      </div>
      {servicio.latenciaMs != null && <LatencyBar ms={servicio.latenciaMs} />}
      {servicio.detalle && (
        <p className="text-xs text-red-400 mt-1 truncate" title={servicio.detalle}>
          {servicio.detalle}
        </p>
      )}
    </div>
  )
}

export default function AdminHealthMonitor() {
  const [servicios,  setServicios]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getHealth()
      setServicios(Array.isArray(data) ? data : [])
      setLastUpdate(new Date())
    } catch {
      setError('No se pudo conectar con el monitor de salud')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 30_000)
    return () => clearInterval(interval)
  }, [cargar])

  const activos   = servicios.filter(s => s.estado === 'UP').length
  const caidos    = servicios.filter(s => s.estado === 'DOWN').length
  const degradados = servicios.filter(s => s.estado === 'DEGRADED').length
  const sistemaOk = caidos === 0 && degradados === 0

  return (
    <div style={FONT}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sistemaOk ? 'bg-green-100' : 'bg-red-100'}`}>
            <Activity className={`w-5 h-5 ${sistemaOk ? 'text-green-600' : 'text-red-500'}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Monitor de servicios</h1>
            <p className="text-xs text-slate-400">
              {lastUpdate ? `Actualizado: ${lastUpdate.toLocaleTimeString('es-MX')}` : 'Cargando...'}
            </p>
          </div>
        </div>
        <button
          onClick={cargar}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 shadow-card"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">{servicios.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total servicios</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activos}</p>
          <p className="text-xs text-slate-400 mt-1">Activos</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{caidos}</p>
          <p className="text-xs text-slate-400 mt-1">Caídos</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{degradados}</p>
          <p className="text-xs text-slate-400 mt-1">Degradados</p>
        </div>
      </div>

      {/* Banner de estado general */}
      {!loading && servicios.length > 0 && (
        <div className={`mb-6 rounded-2xl p-4 flex items-center gap-3 ${sistemaOk ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <Wifi className={`w-5 h-5 ${sistemaOk ? 'text-green-600' : 'text-red-500'}`} />
          <p className={`text-sm font-semibold ${sistemaOk ? 'text-green-700' : 'text-red-600'}`}>
            {sistemaOk
              ? 'Todos los servicios operativos ✓'
              : `${caidos} servicio${caidos !== 1 ? 's' : ''} caído${caidos !== 1 ? 's' : ''} — revisión requerida`}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-sm text-red-600 flex justify-between items-center">
          {error}
          <button onClick={cargar} className="underline text-xs">Reintentar</button>
        </div>
      )}

      {/* Grid de servicios */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {servicios.map(s => (
            <ServicioCard key={s.nombre} servicio={s} />
          ))}
        </div>
      )}

      <p className="text-xs text-slate-300 text-center mt-6">
        Se actualiza automáticamente cada 30 segundos
      </p>
    </div>
  )
}
