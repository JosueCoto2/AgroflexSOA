import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authApi from '../api/authApi'
import { jwtDecode } from 'jwt-decode'
import {
  desconectarFirebase,
  loginConGoogle as firebaseLoginConGoogle,
} from '../services/firebaseAuthService'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
        })
      },

      login: async (correo, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(correo, password)
          const { accessToken, refreshToken, ...user } = response.data

          // Decodificar JWT para extraer información
          const decoded = jwtDecode(accessToken)

          set({
            accessToken,
            refreshToken,
            user: {
              ...user,
              roles: decoded.roles || [],
            },
            isAuthenticated: true,
            isLoading: false,
          })

          //  desactivado
          return response.data
        } catch (error) {
          const message =
            error.response?.data?.message ||
            'Error al iniciar sesión'
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.register(data)
          const { accessToken, refreshToken, ...user } = response.data

          const decoded = jwtDecode(accessToken)

          set({
            accessToken,
            refreshToken,
            user: {
              ...user,
              roles: decoded.roles || [],
            },
            isAuthenticated: true,
            isLoading: false,
          })

          //  desactivado
          return response.data
        } catch (error) {
          const message =
            error.response?.data?.message ||
            'Error al registrarse'
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      loginConGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          const data = await firebaseLoginConGoogle()
          const { accessToken, refreshToken, ...user } = data
          const decoded = jwtDecode(accessToken)
          set({
            accessToken,
            refreshToken,
            user: { ...user, roles: decoded.roles || [] },
            isAuthenticated: true,
            isLoading: false,
          })
          return data
        } catch (error) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Error al iniciar sesión con Google'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      solicitarInsignia: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.solicitarInsignia(data)
          const { accessToken, refreshToken, ...user } = response.data
          const decoded = jwtDecode(accessToken)
          set({
            accessToken,
            refreshToken,
            user: {
              ...user,
              roles: decoded.roles || [],
            },
            isAuthenticated: true,
            isLoading: false,
          })
          return response.data
        } catch (error) {
          const message =
            error.response?.data?.message || 'Error al solicitar la insignia'
          set({ error: message, isLoading: false })
          throw error
        }
      },

      logout: () => {
        desconectarFirebase()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      forgotPassword: async (correo) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.forgotPassword(correo)
          set({ isLoading: false })
          return response.data
        } catch (error) {
          const message =
            error.response?.data?.message ||
            'Error al solicitar reset de contraseña'
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.resetPassword(token, password)
          set({ isLoading: false })
          return response.data
        } catch (error) {
          const message =
            error.response?.data?.message ||
            'Error al resetear contraseña'
          set({
            error: message,
            isLoading: false,
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
