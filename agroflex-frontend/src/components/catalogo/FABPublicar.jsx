/**
 * FABPublicar — Botón flotante "Publicar" / "Quiero vender"
 * - Con rol vendedor → va directo a la página de publicación
 * - Sin rol vendedor (COMPRADOR) → va a /verify-badge para solicitar insignia
 * - Sin sesión → oculto
 */
import { Link } from 'react-router-dom'
import { Plus, Sprout } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routeConfig'

const VENDOR_ROLES = ['PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'ADMIN']

const getPublishRoute = (roles) => {
  if (roles.includes('ADMIN'))     return ROUTES.ADMIN_DASHBOARD
  if (roles.includes('PROVEEDOR')) return ROUTES.SUPPLIER_LOTS_NEW
  return ROUTES.PRODUCER_LOTS_NEW
}

export default function FABPublicar() {
  const { isAuthenticated, roles } = useAuth()

  if (!isAuthenticated) return null

  const isVendor = roles.some(r => VENDOR_ROLES.includes(r))
  const to       = isVendor ? getPublishRoute(roles) : ROUTES.VERIFY_BADGE
  const label    = isVendor ? 'Publicar producto' : 'Quiero vender'
  const Icon     = isVendor ? Plus : Sprout

  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className="
        fixed bottom-6 right-6 z-40
        w-14 h-14 rounded-fab
        bg-verde-400 hover:bg-verde-500
        text-white
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-200 active:scale-95
        group
      "
    >
      <Icon className="w-6 h-6" />

      <span className="
        absolute right-16 bottom-1/2 translate-y-1/2
        whitespace-nowrap bg-tinta-900 text-white text-xs font-semibold
        px-2.5 py-1.5 rounded-chip
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
      ">
        {label}
      </span>
    </Link>
  )
}
