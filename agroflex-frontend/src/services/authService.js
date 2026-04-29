/**
 * authService.js — Utilidades de autenticación (CAPA 1)
 *
 * Centraliza la lectura del JWT y la verificación de roles.
 * Los componentes usan este servicio en vez de acceder a Zustand directamente
 * cuando solo necesitan datos derivados del token (roles, permisos).
 */

import { jwtDecode } from 'jwt-decode'
import useAuthStore from '../store/authStore'

// Roles que pueden publicar productos
const PUBLISH_ROLES = ['PRODUCTOR', 'INVERNADERO', 'PROVEEDOR', 'ADMIN']

export const authService = {

  /** Devuelve el access token actual desde el store de Zustand. */
  getToken() {
    return useAuthStore.getState().accessToken ?? null
  },

  /** Devuelve el objeto user actual. */
  getUser() {
    return useAuthStore.getState().user ?? null
  },

  /** Devuelve el array de roles del usuario autenticado. */
  getRoles() {
    return this.getUser()?.roles ?? []
  },

  /** Verifica si el usuario tiene un rol específico (case-insensitive). */
  hasRole(role) {
    return this.getRoles().includes(role.toUpperCase())
  },

  /**
   * Verifica si el usuario puede publicar productos.
   * Roles permitidos: PRODUCTOR, INVERNADERO, PROVEEDOR, ADMIN.
   */
  canPublish() {
    return this.getRoles().some(r => PUBLISH_ROLES.includes(r))
  },

  /** Decodifica un JWT sin verificar firma (solo para datos del payload). */
  decodeToken(token) {
    if (!token) return null
    try {
      return jwtDecode(token)
    } catch {
      return null
    }
  },

  /** Devuelve el payload del token actual. */
  getTokenPayload() {
    return this.decodeToken(this.getToken())
  },

  /** Verifica si hay una sesión activa. */
  isAuthenticated() {
    return useAuthStore.getState().isAuthenticated
  },
}
