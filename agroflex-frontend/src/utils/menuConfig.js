import {
  Bell,
  Star,
  Settings,
  Sprout,
  Package,
  BarChart2,
  ShoppingCart,
  QrCode,
  MapPin,
  Store,
} from 'lucide-react'
import { ROUTES } from '../routes/routeConfig'

/**
 * Devuelve el rol principal del usuario según prioridad.
 * @param {string[]} roles
 * @returns {string|null}
 */
export const getPrimaryRole = (roles) => {
  if (!roles?.length) return null
  const priority = ['PRODUCTOR', 'INVERNADERO', 'COMPRADOR', 'EMPAQUE', 'PROVEEDOR']
  return priority.find((r) => roles.includes(r)) || roles[0]
}

const MENU_POR_ROL = {
  PRODUCTOR: [
    { icon: Sprout,    label: 'Mis cosechas',  path: ROUTES.MIS_COSECHAS,  color: 'bg-verde-100 text-verde-700' },
    { icon: Package,   label: 'Mis pedidos',   path: ROUTES.MIS_PEDIDOS,   color: 'bg-blue-100 text-blue-700' },
    { icon: MapPin,    label: 'Lotes cerca',   path: ROUTES.MAPA,          color: 'bg-amber-100 text-amber-700' },
    { icon: BarChart2, label: 'Estadísticas',  path: ROUTES.PRODUCER_STATS,color: 'bg-purple-100 text-purple-700' },
  ],
  INVERNADERO: [
    { icon: Sprout,  label: 'Mis cosechas', path: ROUTES.MIS_COSECHAS, color: 'bg-verde-100 text-verde-700' },
    { icon: Package, label: 'Mis pedidos',  path: ROUTES.MIS_PEDIDOS,  color: 'bg-blue-100 text-blue-700' },
    { icon: MapPin,  label: 'Lotes cerca',  path: ROUTES.MAPA,         color: 'bg-amber-100 text-amber-700' },
  ],
  COMPRADOR: [
    { icon: ShoppingCart, label: 'Mis compras',  path: ROUTES.MIS_COMPRAS, color: 'bg-blue-100 text-blue-700' },
    { icon: QrCode,       label: 'Escanear QR',  path: ROUTES.QR_SCANNER,  color: 'bg-verde-100 text-verde-700' },
    { icon: MapPin,       label: 'Lotes cerca',  path: ROUTES.MAPA,        color: 'bg-amber-100 text-amber-700' },
  ],
  EMPAQUE: [
    { icon: ShoppingCart, label: 'Mis compras',  path: ROUTES.MIS_COMPRAS, color: 'bg-blue-100 text-blue-700' },
    { icon: QrCode,       label: 'Escanear QR',  path: ROUTES.QR_SCANNER,  color: 'bg-verde-100 text-verde-700' },
    { icon: MapPin,       label: 'Lotes cerca',  path: ROUTES.MAPA,        color: 'bg-amber-100 text-amber-700' },
  ],
  PROVEEDOR: [
    { icon: Store,   label: 'Mi tienda',   path: ROUTES.MI_TIENDA,  color: 'bg-verde-100 text-verde-700' },
    { icon: Package, label: 'Mis pedidos', path: ROUTES.MIS_PEDIDOS,color: 'bg-blue-100 text-blue-700' },
    { icon: MapPin,  label: 'Lotes cerca', path: ROUTES.MAPA,       color: 'bg-amber-100 text-amber-700' },
  ],
}

const BASE_MENU = [
  { icon: Bell,     label: 'Notificaciones', path: ROUTES.NOTIFICACIONES, color: 'bg-red-100 text-red-700' },
  { icon: Star,     label: 'Mis reseñas',    path: ROUTES.RESENAS,        color: 'bg-amber-100 text-amber-700' },
  { icon: Settings, label: 'Configuración',  path: ROUTES.CONFIGURACION,  color: 'bg-stone-100 text-stone-600' },
]

/**
 * Retorna los ítems de menú según el rol del usuario.
 * Acepta string o array de roles.
 * @param {string|string[]} roles
 * @returns {Array}
 */
export const getMenuByRole = (roles) => {
  const normalized = Array.isArray(roles) ? roles : [roles].filter(Boolean)
  const primaryRole = getPrimaryRole(normalized)
  return [...(MENU_POR_ROL[primaryRole] ?? []), ...BASE_MENU]
}
