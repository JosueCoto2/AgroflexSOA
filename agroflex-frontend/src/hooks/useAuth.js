import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    loginConGoogle,
    forgotPassword,
    resetPassword,
    solicitarInsignia,
  } = useAuthStore()

  const hasRole = (role) => {
    if (!user || !user.roles) return false
    return user.roles.includes(role.toUpperCase())
  }

  const isAdmin = () => {
    return hasRole('ADMIN')
  }

  const roles = user?.roles || []

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    roles,
    login,
    logout,
    register,
    loginConGoogle,
    forgotPassword,
    resetPassword,
    solicitarInsignia,
    hasRole,
    isAdmin,
  }
}
