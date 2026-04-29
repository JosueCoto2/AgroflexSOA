import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../routes/routeConfig'
import AgroFlexLogo from '../Logo/AgroFlexLogo'

/**
 * Botón de cerrar sesión con modal de confirmación.
 *
 * Props:
 *  - variant: 'button' (default) | 'icon' | 'menu-item' | 'sidebar'
 *    · button    → botón con texto y ícono (ideal para header)
 *    · icon      → solo ícono con tooltip (ideal para navbar compacta)
 *    · menu-item → ítem de menú dropdown (fondo transparente, ancho completo)
 *    · sidebar   → ítem de sidebar oscuro (texto rojo claro, hover sutil)
 */
export default function LogoutButton({ variant = 'button' }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  // ── Variante: solo ícono
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <ConfirmModal
          show={showModal}
          user={user}
          onConfirm={handleLogout}
          onCancel={() => setShowModal(false)}
        />
      </>
    )
  }

  // ── Variante: sidebar oscuro
  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <ConfirmModal
          show={showModal}
          user={user}
          onConfirm={handleLogout}
          onCancel={() => setShowModal(false)}
        />
      </>
    )
  }

  // ── Variante: ítem de menú dropdown
  if (variant === 'menu-item') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors rounded-card"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
        <ConfirmModal
          show={showModal}
          user={user}
          onConfirm={handleLogout}
          onCancel={() => setShowModal(false)}
        />
      </>
    )
  }

  // ── Variante: botón completo (default)
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>
      <ConfirmModal
        show={showModal}
        user={user}
        onConfirm={handleLogout}
        onCancel={() => setShowModal(false)}
      />
    </>
  )
}

// ── Modal de confirmación interno
function ConfirmModal({ show, user, onConfirm, onCancel }) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card del modal */}
      <div
        className="relative w-full max-w-sm bg-tinta-800 border border-tinta-700 rounded-card shadow-2xl p-6 z-10"
      >
        {/* Botón cerrar */}
        <button
          onClick={onCancel}
          aria-label="Cancelar"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-chip text-tinta-500 hover:text-tinta-200 hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo confirmación */}
        <div className="flex items-center justify-center mb-4">
          <AgroFlexLogo size="sm" variant="light" showText />
        </div>

        {/* Ícono */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6 text-red-500" />
        </div>

        {/* Texto */}
        <h2
          id="logout-title"
          className="text-lg font-bold text-white mb-1 font-display"
        >
          ¿Cerrar sesión?
        </h2>
        {user?.nombre && (
          <p className="text-sm text-tinta-400 mb-5">
            Vas a salir de la cuenta de{' '}
            <span className="font-semibold text-tinta-200">{user.nombre}</span>.
          </p>
        )}
        {!user?.nombre && (
          <p className="text-sm text-tinta-400 mb-5">
            Se cerrará tu sesión actual en AgroFlex.
          </p>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-tinta-300 border border-tinta-600 rounded-btn hover:bg-white/5 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
