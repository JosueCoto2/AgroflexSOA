import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Plus, ChevronDown, LogOut, User, Settings, ScanLine, MapPin } from 'lucide-react'
import useAuthStore from '../../../store/authStore'

const getLinks = (roles = []) => {
  const rol = roles[0] || ''
  const base = [{ path: '/catalog', label: 'Catálogo' }]
  const mapa = { path: '/mapa', label: 'Mapa', icon: MapPin }

  if (rol.includes('PRODUCTOR') || rol.includes('INVERNADERO')) return [
    ...base,
    { path: '/mis-cosechas', label: 'Mis cosechas' },
    { path: '/mis-pedidos',  label: 'Mis pedidos'  },
    mapa,
  ]
  if (rol.includes('COMPRADOR') || rol.includes('EMPAQUE')) return [
    ...base,
    { path: '/mis-compras', label: 'Mis compras' },
    mapa,
  ]
  if (rol.includes('PROVEEDOR')) return [
    ...base,
    { path: '/mi-tienda',   label: 'Mi tienda'   },
    { path: '/mis-pedidos', label: 'Mis pedidos' },
    mapa,
  ]
  return [...base, mapa]
}

const TopNavbar = ({ noLeidas = 0, nuevaNotif }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const roles  = user?.roles || []
  const links  = getLinks(roles)
  const nombre = user?.nombre || 'Usuario'
  const rol    = roles[0] || ''
  const inicial = nombre.charAt(0).toUpperCase()

  const esPub = rol.includes('PRODUCTOR') || rol.includes('INVERNADERO') || rol.includes('PROVEEDOR')

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/')
  }

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-[84px] bg-white/95 border-b border-campo-100 backdrop-blur-xl flex items-center px-4 lg:px-8 gap-3 shadow-[0_20px_50px_rgba(31,107,20,0.08)]"
    >
      {/* LOGO */}
      <Link to="/catalog" className="flex items-center gap-2 shrink-0 min-h-0">
        <img
          src="/images/logo.png"
          alt="AgroFlex"
          className="h-12 w-auto object-contain"
        />
      </Link>

      {/* LINKS — desktop */}
      {isAuthenticated && (
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {links.map(l => {
            const activo = pathname === l.path || pathname.startsWith(l.path + '/')
            const Icon = l.icon ?? null
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
                  activo
                    ? 'bg-campo-200 text-campo-700 font-semibold'
                    : 'text-campo-500 hover:bg-campo-100 hover:text-info hover:font-semibold'
                }`}
              >
                {Icon && <Icon size={13} />}
                {l.label}
              </Link>
            )
          })}
        </div>
      )}

      {/* SPACER */}
      <div className="flex-1 lg:flex-none" />

      {/* ACCIONES DERECHA */}
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          {/* Botón publicar */}
          {esPub && (
            <Link
              to="/publicar-lote"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-[14px] bg-gradient-to-r from-verde-600 to-ambar-400 shadow-[0_16px_32px_rgba(31,107,20,0.18)] hover:from-verde-700 hover:to-ambar-500 hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} strokeWidth={2.3} />
              Publicar
            </Link>
          )}

          {/* Botón escanear QR — todos los usuarios autenticados */}
          <Link
            to="/escanear-qr"
            className="w-9 h-9 bg-campo-50 rounded-[10px] flex items-center justify-center hover:bg-campo-100 transition-colors min-h-0"
            title="Escanear QR"
          >
            <ScanLine size={16} className="text-verde-500" />
          </Link>

          {/* Notificaciones */}
          <Link
            to="/notificaciones"
            className="relative w-9 h-9 bg-campo-50 rounded-[10px] flex items-center justify-center hover:bg-campo-100 transition-colors min-h-0"
            title={noLeidas > 0 ? `${noLeidas} notificaciones sin leer` : 'Notificaciones'}
          >
            <Bell size={16} className={noLeidas > 0 ? 'text-info' : 'text-campo-400'} />
            {noLeidas > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border border-white">
                {noLeidas > 99 ? '99+' : noLeidas}
              </span>
            )}
          </Link>

          {/* Avatar + dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-campo-50 rounded-[10px] px-2.5 py-1.5 hover:bg-campo-100 transition-colors min-h-0"
            >
              <div className="w-7 h-7 bg-campo-300 rounded-[8px] flex items-center justify-center font-display text-[11px] font-bold text-campo-700 overflow-hidden flex-shrink-0">
                {user?.fotoPerfil
                  ? <img src={user.fotoPerfil} alt={nombre} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                  : inicial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[12px] font-semibold text-campo-700 leading-none">{nombre}</p>
                <p className="text-[10px] text-campo-400 leading-none mt-0.5">
                  {rol.charAt(0) + rol.slice(1).toLowerCase()}
                </p>
              </div>
              <ChevronDown size={13} className="text-campo-400 hidden sm:block" />
            </button>

            {open && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] w-44 bg-white rounded-[14px] border border-campo-100 overflow-hidden z-50"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              >
                <Link
                  to="/perfil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-campo-600 font-medium hover:bg-campo-50 transition-colors"
                >
                  <User size={14} className="text-verde-400" />
                  Mi perfil
                </Link>
                <Link
                  to="/configuracion"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-campo-600 font-medium hover:bg-campo-50 transition-colors"
                >
                  <Settings size={14} className="text-campo-400" />
                  Configuración
                </Link>
                <div className="border-t border-campo-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-red-500 font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-2 rounded-[10px] text-[13px] font-semibold text-verde-500 border-2 border-verde-200 hover:border-verde-400 transition-colors min-h-0"
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="px-3 py-2 rounded-[10px] text-[13px] font-semibold bg-verde-400 text-white hover:bg-verde-500 transition-colors min-h-0"
            style={{ boxShadow: '0 3px 10px rgba(59,175,42,0.3)' }}
          >
            Regístrate
          </Link>
        </div>
      )}
    </nav>
  )
}

export default TopNavbar
