import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu, X, Bell, User } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../routes/routeConfig'
import LogoutButton from '../../common/LogoutButton/LogoutButton'
import AgroFlexLogo from '../../common/Logo/AgroFlexLogo'

/**
 * Shell compartido para todos los dashboards.
 *
 * Props:
 *  - navItems: Array<{ label, icon, to, end? }>
 */
export default function DashboardLayout({ navItems = [] }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const initials = user?.nombre
    ? user.nombre.charAt(0).toUpperCase() + (user?.apellidos?.charAt(0) ?? '').toUpperCase()
    : 'U'

  return (
    <div
      className="min-h-screen bg-slate-50 flex"
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {/* ── Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 w-64 bg-slate-900 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <AgroFlexLogo size="md" variant="light" />
          <button
            className="ml-auto lg:hidden text-slate-500 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(({ label, icon: Icon, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-lime-500/15 text-lime-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Parte inferior: perfil + logout */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
          <NavLink
            to={ROUTES.PROFILE}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? 'bg-lime-500/15 text-lime-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <User className="w-4 h-4 flex-shrink-0" />
            Mi Perfil
          </NavLink>

          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      {/* ── Área principal */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm h-16 flex items-center px-4 sm:px-6 gap-3">
          {/* Botón hamburger (solo móvil) */}
          <button
            className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notificaciones */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-lime-500 border-2 border-white" />
          </button>

          {/* Chip de usuario */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-xl bg-green-700 flex items-center justify-center text-xs font-bold text-white select-none">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.nombre ?? 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 leading-tight">{user?.correo ?? ''}</p>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
