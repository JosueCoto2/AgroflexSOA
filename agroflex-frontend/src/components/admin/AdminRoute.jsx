/**
 * AdminRoute — Protege rutas del panel de administración.
 * Requiere: autenticado + rol ADMIN.
 * Si no cumple → redirige a /catalog.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../routes/routeConfig'

export default function AdminRoute() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  const isAdmin = user?.roles?.includes('ADMIN')
  if (!isAdmin) {
    return <Navigate to={ROUTES.CATALOG} replace />
  }

  return <Outlet />
}
