/**
 * ConfiguracionPage — Configuración de la cuenta (/configuracion).
 *
 * Secciones:
 *  - Seguridad: cambiar contraseña (redirige al flujo forgot-password)
 *  - Cuenta: cerrar sesión, borrar cuenta (con confirmación)
 *  - Acerca de: versión, soporte
 */
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Lock, LogOut, Trash2, ChevronRight,
  ShieldCheck, Info, AlertTriangle, X, Loader2,
  Mail,
} from 'lucide-react'
import useAuthStore    from '../../store/authStore'
import usersApi        from '../../api/usersApi'
import authApi         from '../../api/authApi'
import { ROUTES }      from '../../routes/routeConfig'

const FONT = { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }

const APP_VERSION = '1.0.0'

// ── Fila de opción reutilizable ────────────────────────────────────────────
const OpcionFila = ({ icon: Icon, label, sublabel, onClick, color = 'text-slate-700', chevron = true, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${color === 'text-red-600' ? 'hover:bg-red-50' : ''}`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
      color === 'text-red-600' ? 'bg-red-50' : 'bg-slate-100'
    }`}>
      <Icon size={16} className={color} />
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className={`text-sm font-semibold ${color}`}>{label}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
    {chevron && <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />}
  </button>
)

// ── Modal de confirmación genérico ─────────────────────────────────────────
const ModalConfirmar = ({ titulo, descripcion, labelConfirmar, peligroso, onConfirmar, onCancelar, cargando }) => (
  <div
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={e => e.target === e.currentTarget && onCancelar()}
  >
    <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-5 space-y-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${peligroso ? 'bg-red-50' : 'bg-amber-50'}`}>
          <AlertTriangle size={24} className={peligroso ? 'text-red-500' : 'text-amber-500'} />
        </div>
        <h3 className="text-base font-bold text-slate-800 text-center">{titulo}</h3>
        <p className="text-sm text-slate-500 text-center leading-relaxed">{descripcion}</p>
      </div>
      <div className="flex gap-2 px-5 pb-5">
        <button
          onClick={onCancelar}
          disabled={cargando}
          className="flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirmar}
          disabled={cargando}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 ${
            peligroso ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {cargando ? <Loader2 size={15} className="animate-spin" /> : null}
          {cargando ? 'Procesando…' : labelConfirmar}
        </button>
      </div>
    </div>
  </div>
)

// ── Página principal ────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [modal,    setModal]    = useState(null)   // 'logout' | 'delete'
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState(null)

  // Cerrar sesión
  const handleLogout = async () => {
    setCargando(true)
    try {
      logout()
      navigate(ROUTES.HOME)
    } finally {
      setCargando(false)
    }
  }

  // Eliminar cuenta
  const handleEliminarCuenta = async () => {
    if (!user?.idUsuario) return
    setCargando(true)
    setError(null)
    try {
      await usersApi.eliminarUsuario(user.idUsuario)
      logout()
      navigate(ROUTES.HOME)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'No se pudo eliminar la cuenta. Contacta soporte.'
      setError(msg)
      setModal(null)
    } finally {
      setCargando(false)
    }
  }

  // Cambiar contraseña → reutiliza el flujo de forgot-password con el correo ya rellenado
  const handleCambiarPass = () => {
    navigate(`${ROUTES.FORGOT_PASSWORD}?correo=${encodeURIComponent(user?.correo ?? '')}`)
  }

  return (
    <div style={FONT} className="min-h-screen bg-slate-50">

      {/* ── Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-slate-800">Configuración</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── Error global */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)}><X size={14} /></button>
          </div>
        )}

        {/* ── Cuenta */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
            Cuenta
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-verde-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-verde-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Correo electrónico</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.correo ?? '—'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Seguridad */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
            Seguridad
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
            <OpcionFila
              icon={Lock}
              label="Cambiar contraseña"
              sublabel="Recibirás un correo para restablecer tu contraseña"
              onClick={handleCambiarPass}
            />
            <OpcionFila
              icon={ShieldCheck}
              label="Verificar mi cuenta"
              sublabel="Solicita una insignia de vendedor verificado"
              onClick={() => navigate(ROUTES.VERIFY_BADGE)}
            />
          </div>
        </section>

        {/* ── Sesión */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
            Sesión
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
            <OpcionFila
              icon={LogOut}
              label="Cerrar sesión"
              sublabel="Salir de tu cuenta en este dispositivo"
              onClick={() => setModal('logout')}
            />
          </div>
        </section>

        {/* ── Zona peligrosa */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
            Zona peligrosa
          </p>
          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
            <OpcionFila
              icon={Trash2}
              label="Eliminar mi cuenta"
              sublabel="Esta acción es irreversible. Se borrarán todos tus datos."
              onClick={() => setModal('delete')}
              color="text-red-600"
            />
          </div>
        </section>

        {/* ── Acerca de */}
        <section>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
            Acerca de
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info size={15} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Versión</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{APP_VERSION}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={15} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Soporte</p>
                <p className="text-xs text-slate-400">soporte@agroflex.mx</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Modal cerrar sesión */}
      {modal === 'logout' && (
        <ModalConfirmar
          titulo="¿Cerrar sesión?"
          descripcion="Tendrás que volver a iniciar sesión para acceder a tu cuenta."
          labelConfirmar="Cerrar sesión"
          peligroso={false}
          cargando={cargando}
          onConfirmar={handleLogout}
          onCancelar={() => setModal(null)}
        />
      )}

      {/* ── Modal eliminar cuenta */}
      {modal === 'delete' && (
        <ModalConfirmar
          titulo="¿Eliminar tu cuenta?"
          descripcion="Se borrarán permanentemente tu perfil, datos e historial. Esta acción no se puede deshacer."
          labelConfirmar="Sí, eliminar"
          peligroso
          cargando={cargando}
          onConfirmar={handleEliminarCuenta}
          onCancelar={() => setModal(null)}
        />
      )}
    </div>
  )
}
