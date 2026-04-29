import axios from 'axios'

const axiosClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Lee tokens desde el store de Zustand (guardado en 'auth-store')
const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('auth-store')
    if (!raw) return null
    const { state } = JSON.parse(raw)
    return state?.accessToken ?? null
  } catch {
    return null
  }
}

const getRefreshToken = () => {
  try {
    const raw = localStorage.getItem('auth-store')
    if (!raw) return null
    const { state } = JSON.parse(raw)
    return state?.refreshToken ?? null
  } catch {
    return null
  }
}

const clearAuthStore = () => {
  try {
    localStorage.removeItem('auth-store')
  } catch {}
}

// Endpoints que no deben disparar el refresh/redirect si fallan con 401
const SKIP_RETRY_URLS = [
  '/api/auth/firebase-token',
  '/api/auth/refresh',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/enviar-codigo',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/google',
]

// Request interceptor: Agrega token JWT a cada solicitud
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: Maneja 401 y refresca el token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // No reintentar para endpoints de auth ni cuando ya se reintentó
    const shouldSkip = SKIP_RETRY_URLS.some((url) => originalRequest.url?.includes(url))
    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkip) {
      originalRequest._retry = true

      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data

        // Actualizar el auth-store con los nuevos tokens
        try {
          const raw = localStorage.getItem('auth-store')
          if (raw) {
            const stored = JSON.parse(raw)
            stored.state.accessToken  = accessToken
            stored.state.refreshToken = newRefreshToken
            localStorage.setItem('auth-store', JSON.stringify(stored))
          }
        } catch {}

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        // Limpiar auth y redirigir a login
        clearAuthStore()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
