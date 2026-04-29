import { Link, useLocation } from 'react-router-dom'
import { ShoppingBasket, Sprout, Plus, Package, UserCircle, MapPin, Store } from 'lucide-react'
import useAuthStore from '../../../store/authStore'

const getTabs = (roles = []) => {
  const rol = roles[0] || ''

  if (rol.includes('PRODUCTOR') || rol.includes('INVERNADERO')) return [
    { path: '/catalog',       icon: ShoppingBasket, label: 'Catálogo' },
    { path: '/mis-cosechas',  icon: Sprout,          label: 'Mis lotes' },
    { path: '/publicar-lote', icon: Plus,             label: '',         isCenter: true },
    { path: '/mapa',          icon: MapPin,           label: 'Cerca'    },
    { path: '/perfil',        icon: UserCircle,       label: 'Perfil'   },
  ]
  if (rol.includes('COMPRADOR') || rol.includes('EMPAQUE')) return [
    { path: '/catalog',       icon: ShoppingBasket, label: 'Catálogo' },
    { path: '/mis-compras',   icon: Package,         label: 'Pedidos'  },
    { path: '/verify-badge',  icon: Plus,            label: '',         isCenter: true },
    { path: '/mapa',          icon: MapPin,           label: 'Cerca'    },
    { path: '/perfil',        icon: UserCircle,       label: 'Perfil'   },
  ]
  if (rol.includes('PROVEEDOR')) return [
    { path: '/catalog',       icon: ShoppingBasket, label: 'Catálogo' },
    { path: '/mi-tienda',     icon: Store,           label: 'Mi tienda'},
    { path: '/publicar-lote', icon: Plus,            label: '',         isCenter: true },
    { path: '/mapa',          icon: MapPin,           label: 'Cerca'    },
    { path: '/perfil',        icon: UserCircle,      label: 'Perfil'   },
  ]
  // Público / sin rol
  return [
    { path: '/catalog',      icon: ShoppingBasket, label: 'Catálogo' },
    { path: '/mapa',         icon: MapPin,          label: 'Cerca'    },
    { path: '/verify-badge', icon: Plus,            label: '',         isCenter: true },
    { path: '/login',        icon: UserCircle,      label: 'Entrar'   },
    { path: '/perfil',       icon: UserCircle,      label: 'Perfil'   },
  ]
}

const BottomNav = () => {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const tabs = getTabs(user?.roles || [])

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-campo-100 flex items-center"
      style={{ boxShadow: '0 -1px 8px rgba(59,175,42,0.06)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map((tab, i) => {
        const Icon = tab.icon
        const activo = pathname === tab.path || (tab.path !== '/catalog' && pathname.startsWith(tab.path + '/'))

        if (tab.isCenter) return (
          <div key={i} className="flex-1 flex justify-center">
            <Link
              to={tab.path}
              className="w-12 h-12 bg-verde-400 rounded-[14px] flex items-center justify-center -mt-4 active:scale-90 transition-transform min-h-0"
              style={{ boxShadow: '0 4px 16px rgba(59,175,42,0.4)' }}
            >
              <Icon size={22} color="white" strokeWidth={2.5} />
            </Link>
          </div>
        )

        return (
          <Link
            key={i}
            to={tab.path}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-0"
          >
            <Icon
              size={20}
              className={activo ? 'text-verde-400' : 'text-campo-300'}
              strokeWidth={activo ? 2.5 : 2}
            />
            <span className={`text-[8px] font-semibold ${activo ? 'text-verde-400' : 'text-campo-300'}`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
