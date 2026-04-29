/**
 * GuestRoute — Ruta solo para usuarios NO autenticados.
 *
 * Si el usuario ya tiene sesión activa, lo redirige al catálogo
 * usando `replace` para que el botón Atrás no pueda volver a la
 * landing ni al login.
 *
 * Lee localStorage directamente como fallback sincrónico para evitar
 * el flash que ocurre antes de que zustand hydrate su store persistido.
 */
import { useMemo } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../routes/routeConfig'

const GuestRoute = () => {
  const { isAuthenticated } = useAuth()

  // Verificación sincrónica directa desde localStorage para evitar flash
  // antes de que zustand hidrate el store (puede tardar un tick en React 18)
  const isAuthFromStorage = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('auth-store') || '{}')
      return stored?.state?.isAuthenticated === true
    } catch {
      return false
    }
  }, [])

  if (isAuthenticated || isAuthFromStorage) {
    return <Navigate to={ROUTES.CATALOG} replace />
  }

  return <Outlet />
}

export default GuestRoute
