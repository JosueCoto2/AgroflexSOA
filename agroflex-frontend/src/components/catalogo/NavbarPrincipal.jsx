/**
 * NavbarPrincipal — Navbar del marketplace (catálogo).
 * Props: { onSearch }
 */
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Bell, ShoppingCart, ChevronDown,
  User, LayoutDashboard, LogOut, X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routeConfig'
import LogoutButton from '../common/LogoutButton/LogoutButton'
import AgroFlexLogo from '../common/Logo/AgroFlexLogo'

const ROL_LABELS = {
  PRODUCTOR:   { label: 'Productor',   color: 'bg-verde-600' },
  INVERNADERO: { label: 'Invernadero', color: 'bg-teal-600' },
  PROVEEDOR:   { label: 'Proveedor',   color: 'bg-blue-600' },
  EMPAQUE:     { label: 'Empaque',     color: 'bg-ambar-600' },
  COMPRADOR:   { label: 'Comprador',   color: 'bg-tinta-600' },
  ADMIN:       { label: 'Admin',       color: 'bg-red-600' },
}

const getRolPrincipal = (roles = []) => {
  const priority = ['ADMIN', 'PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'EMPAQUE', 'COMPRADOR']
  for (const r of priority) {
    if (roles.includes(r)) return ROL_LABELS[r] ?? { label: r, color: 'bg-tinta-600' }
  }
  return { label: 'Usuario', color: 'bg-tinta-500' }
}

const getDashboardRoute = (roles = []) => {
  if (roles.includes('ADMIN'))                                    return ROUTES.ADMIN_DASHBOARD
  if (roles.includes('PRODUCTOR') || roles.includes('INVERNADERO')) return ROUTES.PRODUCER_DASHBOARD
  if (roles.includes('PROVEEDOR'))                               return ROUTES.SUPPLIER_DASHBOARD
  return ROUTES.BUYER_DASHBOARD
}

export default function NavbarPrincipal({ onSearch }) {
  const { user, roles, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery]           = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef  = useRef(null)
  const inputRef = useRef(null)

  const rolInfo = getRolPrincipal(roles)
  const initials = user?.nombre
    ? user.nombre.charAt(0).toUpperCase() + (user?.apellidos?.charAt(0) ?? '').toUpperCase()
    : 'U'

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(query.trim())
  }

  const handleClearSearch = () => {
    setQuery('')
    onSearch?.('')
    inputRef.current?.focus()
  }

  return (
    <header className="sticky top-0 z-20 bg-tinta-900 border-b border-tinta-700 h-16 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-3">

        {/* ── Logo */}
        <Link
          to={isAuthenticated ? getDashboardRoute(roles) : ROUTES.HOME}
          className="flex-shrink-0"
        >
          <AgroFlexLogo size="md" variant="light" />
        </Link>

        {/* ── Barra de búsqueda central */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tinta-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos, municipio, vendedor..."
              className="
                w-full pl-10 pr-10 py-2.5 text-sm
                bg-tinta-800 border border-tinta-700 rounded-card
                text-tinta-100 placeholder-tinta-500
                outline-none transition-all
                focus:bg-tinta-700 focus:border-verde-500 focus:ring-2 focus:ring-verde-500/20
              "
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tinta-500 hover:text-tinta-300 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* ── Acciones derechas */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Notificaciones */}
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative w-9 h-9 flex items-center justify-center rounded-card text-tinta-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-verde-400 border-2 border-tinta-900" />
          </button>

          {/* Carrito */}
          {isAuthenticated && (
            <button
              type="button"
              aria-label="Carrito de compras"
              className="relative w-9 h-9 flex items-center justify-center rounded-card text-tinta-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          )}

          {/* ── Sin sesión: botones Entrar / Registrarse */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                className="px-3 py-1.5 text-sm font-semibold text-tinta-300 hover:text-white hover:bg-white/10 rounded-card transition-all"
              >
                Iniciar sesión
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-3 py-1.5 text-sm font-semibold text-white bg-verde-400 hover:bg-verde-500 rounded-btn transition-all"
              >
                Registrarse
              </Link>
            </div>
          ) : (
            /* ── Con sesión: avatar + menú */
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(prev => !prev)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-card hover:bg-white/10 transition-all"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-fab bg-verde-400 flex items-center justify-center text-xs font-bold text-white select-none overflow-hidden flex-shrink-0">
                  {user?.fotoPerfil
                    ? <img src={user.fotoPerfil} alt={user?.nombre} className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-tinta-100 leading-tight">
                      {user?.nombre ?? 'Usuario'}
                    </p>
                    <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-chip ${rolInfo.color}`}>
                      {rolInfo.label}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`hidden md:block w-3 h-3 text-tinta-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-tinta-800 rounded-card shadow-xl border border-tinta-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-tinta-700">
                    <p className="text-sm font-bold text-white">{user?.nombre ?? 'Usuario'}</p>
                    <p className="text-xs text-tinta-400 truncate">{user?.correo ?? ''}</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    <MenuLink
                      icon={LayoutDashboard}
                      label="Dashboard"
                      to={getDashboardRoute(roles)}
                      onClick={() => setShowUserMenu(false)}
                    />
                    <MenuLink
                      icon={User}
                      label="Mi Perfil"
                      to={ROUTES.PROFILE}
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="border-t border-tinta-700 my-1" />
                    <LogoutButton variant="menu-item" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

function MenuLink({ icon: Icon, label, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 text-sm text-tinta-300 hover:bg-white/5 hover:text-white rounded-card transition-colors"
    >
      <Icon className="w-4 h-4 text-tinta-500" />
      {label}
    </Link>
  )
}
