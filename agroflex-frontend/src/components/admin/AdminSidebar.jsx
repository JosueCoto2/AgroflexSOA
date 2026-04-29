import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BadgeCheck, Package, ShoppingBag, AlertTriangle, TrendingUp, LogOut, X, Activity, Megaphone } from 'lucide-react'
import { ROUTES } from '../../routes/routeConfig'
import AgroFlexLogo from '../common/Logo/AgroFlexLogo'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: ROUTES.ADMIN_DASHBOARD,     end: true },
  { label: 'Usuarios',      icon: Users,           to: ROUTES.ADMIN_USUARIOS },
  { label: 'Insignias',     icon: BadgeCheck,      to: ROUTES.ADMIN_INSIGNIAS,     badge: 'insignias' },
  { label: 'Catálogo',      icon: Package,         to: ROUTES.ADMIN_CATALOGO },
  { label: 'Pedidos',       icon: ShoppingBag,     to: ROUTES.ADMIN_PEDIDOS },
  { label: 'Transacciones', icon: TrendingUp,      to: ROUTES.ADMIN_TRANSACCIONES },
  { label: 'Disputas',      icon: AlertTriangle,   to: ROUTES.ADMIN_DISPUTAS,      badge: 'disputas' },
  { label: 'Salud sistema', icon: Activity,         to: ROUTES.ADMIN_HEALTH },
  { label: 'Broadcast',     icon: Megaphone,        to: ROUTES.ADMIN_BROADCAST },
]

export default function AdminSidebar({ onClose, badges = {} }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside className="h-full w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <AgroFlexLogo size="md" variant="light" />
        <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-green-600/20 text-green-400 rounded-md border border-green-600/30">
          Admin
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-slate-500 hover:text-white transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, icon: Icon, to, end, badge }) => {
          const badgeCount = badge ? badges[badge] : 0
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-lime-500/15 text-lime-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
                  {badgeCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
