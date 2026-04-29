import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { getMenuByRole } from '../../../utils/menuConfig'
import { ROUTES } from '../../../routes/routeConfig'

const LeftSidebar = () => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()
  const menuItems = getMenuByRole(user?.roles)

  const initials = user?.nombre
    ? user.nombre.charAt(0).toUpperCase() + (user?.apellidos?.charAt(0) ?? '').toUpperCase()
    : 'U'

  return (
    <div className="flex flex-col h-full py-5 px-3">

      {/* Perfil del usuario */}
      {isAuthenticated && (
        <Link
          to={ROUTES.PROFILE}
          className="flex items-center gap-3 p-2.5 rounded-card hover:bg-white/5 transition-all mb-5 group"
        >
          <div className="w-10 h-10 rounded-fab bg-verde-400 flex items-center justify-center text-sm font-bold text-white shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate group-hover:text-verde-300 transition-colors leading-tight">
              {user?.nombre} {user?.apellidos}
            </p>
            <p className="text-xs text-white/50 truncate mt-0.5">{user?.correo ?? 'Mi perfil'}</p>
          </div>
        </Link>
      )}

      <div className="h-px bg-tinta-700 mb-3" />

      {/* Items de menú */}
      <nav className="flex-1 flex flex-col gap-0.5">
        {menuItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/')
          return (
            <Link
              key={path}
              to={path}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-card transition-all border-l-2',
                isActive
                  ? 'bg-verde-400/10 text-verde-300 border-verde-400'
                  : 'text-white/55 hover:bg-white/5 hover:text-white/90 border-transparent',
              ].join(' ')}
            >
              <Icon size={17} className="shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="h-px bg-tinta-700 mt-3 mb-4" />

      <p className="text-xs text-white/30 px-3 leading-relaxed">
        AgroFlex © {new Date().getFullYear()}
        <br />
        <span className="hover:text-white/60 cursor-pointer transition-colors">Términos</span>
        {' · '}
        <span className="hover:text-white/60 cursor-pointer transition-colors">Privacidad</span>
      </p>
    </div>
  )
}

export default LeftSidebar
