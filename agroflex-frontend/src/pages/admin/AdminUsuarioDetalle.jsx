/**
 * AdminUsuarioDetalle — Vista completa de un usuario para el administrador.
 *
 * Muestra: datos personales, roles, estado, estadísticas, historial de actividad.
 * Permite: cambiar rol, suspender, activar.
 * Flujo SOA: → adminService → admin-service (8089)
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Phone, MapPin, Star, Package,
  ShoppingBag, Shield, UserX, UserCheck, RefreshCw, BadgeCheck,
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import { useToast } from '../../components/admin/ToastNotification'
import ConfirmModal from '../../components/admin/ConfirmModal'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const ROLES_DISPONIBLES = ['COMPRADOR', 'PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'EMPAQUE', 'ADMIN']

const ROL_COLOR = {
  PRODUCTOR:   'bg-green-100 text-green-700',
  INVERNADERO: 'bg-lime-100 text-lime-700',
  PROVEEDOR:   'bg-blue-100 text-blue-700',
  COMPRADOR:   'bg-slate-100 text-slate-600',
  EMPAQUE:     'bg-purple-100 text-purple-700',
  ADMIN:       'bg-red-100 text-red-700',
}

function formatDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return '—' }
}

function InfoFila({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-700 truncate">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, colorClass = 'text-slate-800' }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${colorClass}`}>{value ?? 0}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}

export default function AdminUsuarioDetalle() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { toast }    = useToast()

  const [usuario,       setUsuario]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [suspModal,  setSuspModal]  = useState(false)
  const [activModal, setActivModal] = useState(false)
  const [rolModal,   setRolModal]   = useState(false)
  const [nuevoRol,   setNuevoRol]   = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getUsuarioById(id)
      setUsuario(data)
      setNuevoRol(data.roles?.[0] ?? 'COMPRADOR')
    } catch {
      setError('No se pudo cargar el usuario')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const handleSuspender = async (motivo) => {
    setActionLoading(true)
    try {
      const updated = await adminService.suspenderUsuario(usuario.id, motivo)
      setUsuario(prev => ({ ...prev, ...updated }))
      toast.success('Usuario suspendido')
      setSuspModal(false)
    } catch { toast.error('Error al suspender usuario') }
    finally { setActionLoading(false) }
  }

  const handleActivar = async (motivo) => {
    setActionLoading(true)
    try {
      const updated = await adminService.activarUsuario(usuario.id, motivo)
      setUsuario(prev => ({ ...prev, ...updated }))
      toast.success('Usuario activado')
      setActivModal(false)
    } catch { toast.error('Error al activar usuario') }
    finally { setActionLoading(false) }
  }

  const handleCambiarRol = async () => {
    setActionLoading(true)
    try {
      const updated = await adminService.cambiarRolUsuario(usuario.id, nuevoRol)
      setUsuario(prev => ({ ...prev, ...updated }))
      toast.success(`Rol actualizado a ${nuevoRol}`)
      setRolModal(false)
    } catch { toast.error('Error al cambiar el rol') }
    finally { setActionLoading(false) }
  }

  if (loading) return (
    <div style={FONT} className="p-6 space-y-4">
      <div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card h-48 animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (error) return (
    <div style={FONT} className="p-6 text-center">
      <p className="text-red-500 mb-3">{error}</p>
      <button onClick={cargar} className="btn-primary px-4 py-2 text-sm rounded-xl bg-green-600 text-white">Reintentar</button>
    </div>
  )

  if (!usuario) return null

  const rolPrincipal = usuario.roles?.[0] ?? 'COMPRADOR'
  const initials = `${usuario.nombre?.charAt(0) ?? ''}${usuario.apellidos?.charAt(0) ?? ''}`.toUpperCase()

  return (
    <div style={FONT}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Detalle de usuario</h1>
          <p className="text-xs text-slate-400">ID #{usuario.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Columna izquierda: perfil + acciones */}
        <div className="space-y-4">
          {/* Card perfil */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-green-700 flex items-center justify-center text-xl font-bold text-white mb-3">
                {initials || '?'}
              </div>
              <h2 className="text-base font-bold text-slate-800">{usuario.nombre} {usuario.apellidos}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{usuario.correo}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ROL_COLOR[rolPrincipal] ?? ROL_COLOR.COMPRADOR}`}>
                  {rolPrincipal}
                </span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {usuario.activo ? 'Activo' : 'Suspendido'}
                </span>
                {usuario.validado && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-lime-100 text-lime-700 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verificado
                  </span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-2">
              <button
                onClick={() => setRolModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Cambiar rol
              </button>
              {usuario.activo ? (
                <button
                  onClick={() => setSuspModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Suspender cuenta
                </button>
              ) : (
                <button
                  onClick={() => setActivModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Activar cuenta
                </button>
              )}
              <button
                onClick={cargar}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar datos
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Actividad</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Productos" value={usuario.totalProductos} colorClass="text-green-600" />
              <StatCard label="Pedidos" value={usuario.totalPedidos} colorClass="text-blue-600" />
              <StatCard
                label="Reputación"
                value={usuario.puntuacionRep != null ? `${Number(usuario.puntuacionRep).toFixed(1)}★` : '—'}
                colorClass="text-amber-500"
              />
            </div>
          </div>
        </div>

        {/* ── Columna derecha: información detallada */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Información personal</h3>
            <InfoFila icon={User}  label="Nombre completo"    value={`${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`} />
            <InfoFila icon={Mail}  label="Correo electrónico" value={usuario.correo} />
            <InfoFila icon={Phone} label="Teléfono"           value={usuario.telefono} />
            <InfoFila icon={MapPin} label="Ubicación"
              value={[usuario.municipio, usuario.estadoRepublica].filter(Boolean).join(', ') || null} />
            <InfoFila icon={Star}  label="Fecha de registro"  value={formatDate(usuario.fechaRegistro)} />
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Roles asignados</h3>
            <div className="flex flex-wrap gap-2">
              {(usuario.roles ?? []).map(r => (
                <span key={r} className={`px-3 py-1 text-sm font-medium rounded-full ${ROL_COLOR[r] ?? 'bg-slate-100 text-slate-500'}`}>
                  {r}
                </span>
              ))}
              {(!usuario.roles || usuario.roles.length === 0) && (
                <p className="text-sm text-slate-400">Sin roles asignados</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              Resumen de actividad
            </h3>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-slate-400">Productos publicados</p>
                <p className="text-lg font-bold text-slate-800">{usuario.totalProductos ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Pedidos realizados</p>
                <p className="text-lg font-bold text-slate-800">{usuario.totalPedidos ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Puntuación</p>
                <p className="text-lg font-bold text-amber-500">
                  {usuario.puntuacionRep != null ? `${Number(usuario.puntuacionRep).toFixed(1)} ★` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
      {/* Cambiar rol */}
      {rolModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div style={FONT} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1">Cambiar rol</h3>
            <p className="text-sm text-slate-500 mb-4">Selecciona el nuevo rol para <strong>{usuario.nombre}</strong>.</p>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nuevo rol</label>
            <select
              value={nuevoRol}
              onChange={e => setNuevoRol(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 mb-4"
            >
              {ROLES_DISPONIBLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setRolModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarRol}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {actionLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={suspModal}
        title="Suspender usuario"
        message={`¿Deseas suspender la cuenta de ${usuario.nombre}? El usuario no podrá iniciar sesión.`}
        icon={UserX}
        confirmLabel="Suspender"
        confirmClass="bg-red-500 hover:bg-red-600 text-white"
        requireMotivo
        motivoLabel="Motivo de la suspensión"
        loading={actionLoading}
        onConfirm={handleSuspender}
        onClose={() => setSuspModal(false)}
      />

      <ConfirmModal
        open={activModal}
        title="Activar usuario"
        message={`¿Deseas reactivar la cuenta de ${usuario.nombre}?`}
        icon={UserCheck}
        confirmLabel="Activar"
        confirmClass="bg-green-600 hover:bg-green-700 text-white"
        loading={actionLoading}
        onConfirm={handleActivar}
        onClose={() => setActivModal(false)}
      />
    </div>
  )
}
