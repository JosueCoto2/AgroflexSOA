/**
 * firebase.js — Inicialización Firebase (CAPA 4)
 *
 * AgroFlex usa Firebase para:
 *   1. Storage   — subida directa de imágenes/documentos desde el frontend
 *   2. Auth      — sincronización con JWT de Spring Boot (custom tokens)
 *   3. Firestore — notificaciones en tiempo real (trigger de re-fetch)
 *
 * ── Pasos manuales en Firebase Console (console.firebase.google.com) ────────
 *  1. Abrir el proyecto AgroFlex en Firebase Console
 *  2. Ir a Storage → Get Started → región us-central1 → Done
 *  3. En Storage → Rules → pegar y publicar estas reglas:
 *
 *  rules_version = '2';
 *  service firebase.storage {
 *    match /b/{bucket}/o {
 *      match /productos/{userId}/{allPaths=**} {
 *        allow read:  if true;
 *        allow write: if request.auth != null
 *                     && request.auth.uid == userId
 *                     && request.resource.size < 5 * 1024 * 1024
 *                     && request.resource.contentType.matches('image/.*');
 *      }
 *      match /insignias/{userId}/{allPaths=**} {
 *        allow read:  if request.auth != null && request.auth.uid == userId;
 *        allow write: if request.auth != null
 *                     && request.auth.uid == userId
 *                     && request.resource.size < 10 * 1024 * 1024
 *                     && (request.resource.contentType.matches('image/.*')
 *                         || request.resource.contentType == 'application/pdf');
 *      }
 *      match /perfiles/{userId}/{allPaths=**} {
 *        allow read:  if true;
 *        allow write: if request.auth != null
 *                     && request.auth.uid == userId
 *                     && request.resource.size < 2 * 1024 * 1024
 *                     && request.resource.contentType.matches('image/.*');
 *      }
 *    }
 *  }
 *
 *  4. Ir a Authentication → Sign-in method → habilitar "Custom Token"
 *  5. Ir a Configuración del proyecto → Cuentas de servicio →
 *     "Generar nueva clave privada" → guardar como:
 *     agroflex-auth-service/src/main/resources/firebase-service-account.json
 *
 * Variables requeridas en .env:
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
 *   VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
 *   VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps }                        from 'firebase/app'
import { getDatabase, ref, push, onValue, serverTimestamp } from 'firebase/database'
import { getStorage }                                     from 'firebase/storage'
import { getAuth }                                        from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

// Inicializar una sola vez (evita "duplicate app" en HMR de Vite)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

let rtdb    = null
let storage = null
let auth    = null

if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
  try {
    rtdb    = getDatabase(app)
    storage = getStorage(app)
    auth    = getAuth(app)
  } catch (err) {
    console.warn('[AgroFlex] Firebase no inicializado:', err.message)
  }
}

/**
 * Notifica a todos los clientes que hay un nuevo lote publicado.
 * Escribe en /productos_updates de Realtime Database.
 */
export async function notificarNuevoLote(idLote) {
  if (!rtdb) return
  try {
    await push(ref(rtdb, 'productos_updates'), {
      idLote,
      accion:    'NUEVO_LOTE',
      timestamp: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[AgroFlex] Firebase push error:', err.message)
  }
}

/**
 * Suscribe a cambios en /productos_updates para re-fetch en tiempo real.
 * Firebase es solo el trigger — los datos vienen de Spring Boot.
 */
export function subscribeProductosUpdates(onUpdate) {
  if (!rtdb) return () => {}
  try {
    const dbRef = ref(rtdb, 'productos_updates')
    let primera = true
    const unsub = onValue(dbRef, () => {
      // Ignorar la carga inicial para no recargar innecesariamente al montar
      if (primera) { primera = false; return }
      onUpdate()
    }, (err) => {
      console.warn('[AgroFlex] Firebase onValue error:', err.message)
    })
    return unsub
  } catch (err) {
    console.warn('[AgroFlex] Firebase subscribe error:', err.message)
    return () => {}
  }
}

export { rtdb, storage, auth }
export default app
