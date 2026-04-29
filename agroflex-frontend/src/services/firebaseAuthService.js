/**
 * firebaseAuthService.js — Sincronización Firebase Auth con Spring Boot JWT
 *
 * Firebase se inicializa de forma LAZY (solo cuando se necesita).
 * El import estático de firebase.js fue reemplazado por import dinámico
 * para evitar que Firebase SDK se auto-inicialice al cargar la página
 * y dispare requests a Google sin interacción del usuario.
 *
 * Flujo email/password:  NO toca Firebase en ningún momento.
 * Flujo Google:          Firebase se inicializa al llamar loginConGoogle().
 */

import axiosClient from '../api/axiosClient'
import authApi from '../api/authApi'

// Carga firebase.js solo cuando se llama una función que lo necesita
const loadFirebase = () => import('./firebase')

/**
 * Llama al backend para obtener un Firebase Custom Token y autentica
 * al usuario en Firebase Auth.
 * Se llama solo después de un login exitoso con Google.
 */
export const sincronizarFirebaseAuth = async () => {
  try {
    const { auth } = await loadFirebase()
    if (!auth) {
      console.warn('[Firebase Auth] No inicializado — Storage usará modo sin auth.')
      return
    }
    const { signInWithCustomToken } = await import('firebase/auth')
    const { data } = await axiosClient.post('/api/auth/firebase-token')
    await signInWithCustomToken(auth, data.firebaseToken)
  } catch (err) {
    // No bloquear el flujo principal si Firebase falla
    console.warn('[Firebase Auth] Sincronización omitida:', err.message)
  }
}

/**
 * Cierra la sesión de Firebase cuando el usuario hace logout en AgroFlex.
 */
export const desconectarFirebase = async () => {
  try {
    const { auth } = await loadFirebase()
    if (!auth) return
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
  } catch (err) {
    console.warn('[Firebase Auth] Error al cerrar sesión:', err.message)
  }
}

/**
 * Devuelve el UID actual de Firebase (= string del id_usuario de Spring Boot).
 * Útil para construir la ruta de Storage: productos/{uid}/archivo.jpg
 */
export const getFirebaseUid = async () => {
  try {
    const { auth } = await loadFirebase()
    return auth?.currentUser?.uid ?? null
  } catch {
    return null
  }
}

/**
 * Abre el popup de Google, obtiene el ID token de Firebase,
 * lo envía al backend Spring Boot y devuelve la respuesta AgroFlex
 * (accessToken, refreshToken, user).
 *
 * ÚNICO punto donde Firebase se inicializa — solo al presionar el botón Google.
 */
export const loginConGoogle = async () => {
  const { auth } = await loadFirebase()
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado. Verifica las variables VITE_FIREBASE_* en .env')
  }
  const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  const result  = await signInWithPopup(auth, provider)
  const idToken = await result.user.getIdToken()

  const { data } = await authApi.loginConGoogle(idToken)
  return data
}
