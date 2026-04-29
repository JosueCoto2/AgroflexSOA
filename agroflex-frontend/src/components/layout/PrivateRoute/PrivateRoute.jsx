import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'

const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, roles, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) =>
      roles.includes(role.toUpperCase())
    )

    if (!hasAllowedRole) {
      return <Navigate to="/verify-badge" replace />
    }
  }

  return <Outlet />
}

export default PrivateRoute
