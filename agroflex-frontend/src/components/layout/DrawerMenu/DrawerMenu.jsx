import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Settings, HelpCircle, LogOut, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { getMenuByRole } from '../../../utils/menuConfig'
import { ROUTES } from '../../../routes/routeConfig'

const UserAvatar = ({ user, size = 64 }) => {
  const initials = user?.nombre
    ? user.nombre.charAt(0).toUpperCase() + (user?.apellidos?.charAt(0) ?? '').toUpperCase()
    : 'U'
  return (
    <div
      className="rounded-fab flex items-center justify-center text-xl font-bold text-white shrink-0 select-none"
      style={{ width: size, height: size, background: 'rgba(255,255,255,0.20)', fontFamily: 'Syne, sans-serif' }}
    >
      {initials}
    </div>
  )
}

const ColapsableItem = ({ label, icon: Icon }) => {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="flex items-center gap-3 p-3 rounded-card hover:bg-campo-50 w-full transition-colors min-h-[44px]"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#D8F5D0' }}>
        <Icon size={16} style={{ color: '#1F6B14' }} />
      </div>
      <span className="text-sm text-campo-600 flex-1 text-left">{label}</span>
      {open
        ? <ChevronUp size={16} className="text-campo-400" />
        : <ChevronDown size={16} className="text-campo-400" />}
    </button>
  )
}

const DrawerMenu = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const menuItems = getMenuByRole(user?.roles)

  return (
    <>
      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`
          fixed left-0 top-0 h-full z-50
          w-72 bg-white
          transform transition-transform duration-300 ease-out
          overflow-y-auto shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header — green background */}
        <div style={{ background: '#3BAF2A' }} className="relative p-4 pt-10 pb-5">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="absolute top-3 right-3 p-1 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px] transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <X size={20} />
          </button>

          {isAuthenticated ? (
            <>
              <UserAvatar user={user} size={56} />
              <h2
                className="mt-3 text-lg font-bold text-white"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {user?.nombre} {user?.apellidos}
              </h2>
              {user?.roles?.length > 0 && (
                <p
                  className="text-sm mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.70)', fontFamily: 'Inter, sans-serif' }}
                >
                  {user.roles[0]}
                </p>
              )}
              {user?.puntuacionRep != null && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white/80 text-sm">★ {user.puntuacionRep}</span>
                  {user?.validado && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(255,255,255,0.20)', color: '#fff' }}
                    >
                      ✓ Verificado
                    </span>
                  )}
                </div>
              )}
              <Link
                to={ROUTES.PERFIL}
                onClick={onClose}
                className="text-white/80 text-sm font-semibold mt-2 block hover:text-white transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Ver mi perfil →
              </Link>
            </>
          ) : (
            <>
              <p
                className="font-bold text-white mb-3"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Únete a AgroFlex
              </p>
              <Link
                to={ROUTES.LOGIN}
                onClick={onClose}
                className="block w-full text-center text-white rounded-btn py-2 px-4 mb-2 transition-colors min-h-[44px] flex items-center justify-center font-semibold"
                style={{
                  border: '1px solid rgba(255,255,255,0.30)',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Iniciar sesión
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={onClose}
                className="block w-full text-center font-semibold rounded-btn py-2 px-4 transition-colors min-h-[44px] flex items-center justify-center"
                style={{
                  background: '#fff',
                  color: '#3BAF2A',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Registrarse gratis
              </Link>
            </>
          )}
        </div>

        {/* Separator */}
        <div className="h-px mx-4" style={{ borderTop: '1px solid #EAF9E4' }} />

        {/* Grid de accesos rápidos */}
        <div className="p-4 grid grid-cols-2 gap-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className="rounded-card p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform"
              style={{ background: '#F6FDF4' }}
              onMouseEnter={e => e.currentTarget.style.background = '#EAF9E4'}
              onMouseLeave={e => e.currentTarget.style.background = '#F6FDF4'}
            >
              <div
                className="w-10 h-10 rounded-chip flex items-center justify-center"
                style={{ background: '#D8F5D0' }}
              >
                <Icon size={20} style={{ color: '#1F6B14' }} />
              </div>
              <span
                className="text-xs text-center leading-tight font-medium"
                style={{ color: '#4A7A40', fontFamily: 'Inter, sans-serif' }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px mx-4" style={{ borderTop: '1px solid #EAF9E4' }} />

        {/* Sección inferior */}
        <div className="p-4 flex flex-col gap-1">
          <ColapsableItem label="Configuración y privacidad" icon={Settings} />
          <ColapsableItem label="Ayuda y soporte" icon={HelpCircle} />
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => { logout(); onClose(); navigate(ROUTES.HOME) }}
              className="flex items-center gap-3 p-3 rounded-card w-full transition-colors min-h-[44px]"
              style={{ color: '#ef4444' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FEE2E2' }}>
                <LogOut size={16} style={{ color: '#ef4444' }} />
              </div>
              <span className="text-sm font-semibold">Cerrar sesión</span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default DrawerMenu
