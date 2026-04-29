/**
 * useNotificacionesSSE — Conecta al stream SSE de notificaciones.
 *
 * - Se conecta automáticamente cuando el usuario está autenticado.
 * - Desconecta al hacer logout o al desmontar.
 * - Expone: noLeidas (número) y nuevaNotif (última notificación recibida).
 *
 * Uso:
 *   const { noLeidas, nuevaNotif } = useNotificacionesSSE()
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import useAuthStore from '../store/authStore'
import notificationsApi from '../api/notificationsApi'

const SSE_URL = 'http://localhost:8080/api/notifications/stream'
const RECONNECT_DELAY_MS = 5000

export function useNotificacionesSSE() {
  const { isAuthenticated, accessToken } = useAuthStore()

  const [noLeidas,    setNoLeidas]    = useState(0)
  const [nuevaNotif,  setNuevaNotif]  = useState(null)

  const esRef         = useRef(null)  // EventSource
  const reconnTimeout = useRef(null)

  const cerrar = useCallback(() => {
    if (reconnTimeout.current) clearTimeout(reconnTimeout.current)
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  const conectar = useCallback(() => {
    if (!accessToken) return
    cerrar()

    const url = `${SSE_URL}?token=${encodeURIComponent(accessToken)}`
    const es   = new EventSource(url)
    esRef.current = es

    // Evento de confirmación de conexión
    es.addEventListener('conectado', () => {
      // Cargar conteo inicial de no leídas al conectar
      notificationsApi.contarNoLeidas()
        .then(res => setNoLeidas(res.data?.count ?? 0))
        .catch(() => {})
    })

    // Evento de nueva notificación
    es.addEventListener('notificacion', (e) => {
      try {
        const notif = JSON.parse(e.data)
        setNuevaNotif(notif)
        if (!notif.leida) {
          setNoLeidas(prev => prev + 1)
        }
      } catch {}
    })

    es.onerror = () => {
      es.close()
      esRef.current = null
      // Reconectar automáticamente si sigue autenticado
      reconnTimeout.current = setTimeout(() => {
        if (useAuthStore.getState().isAuthenticated) {
          conectar()
        }
      }, RECONNECT_DELAY_MS)
    }
  }, [accessToken, cerrar])

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      conectar()
    } else {
      cerrar()
      setNoLeidas(0)
      setNuevaNotif(null)
    }
    return cerrar
  }, [isAuthenticated, accessToken, conectar, cerrar])

  const marcarLeidaLocal = useCallback(() => {
    setNoLeidas(prev => Math.max(0, prev - 1))
  }, [])

  const resetNoLeidas = useCallback(() => {
    setNoLeidas(0)
  }, [])

  return { noLeidas, nuevaNotif, marcarLeidaLocal, resetNoLeidas }
}
