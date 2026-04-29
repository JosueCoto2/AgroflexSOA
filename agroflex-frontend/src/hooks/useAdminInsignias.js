import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminInsignias() {
  const [pendientes, setPendientes] = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [actionLoading, setAL]      = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pend, statsData] = await Promise.all([
        adminService.getInsigniasPendientes(),
        adminService.getInsigniasStats(),
      ])
      setPendientes(pend)
      setStats(statsData)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar insignias')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const aprobar = async (id, comentario) => {
    setAL(true)
    try {
      await adminService.aprobarInsignia(id, comentario)
      await fetch()
      return true
    } catch (err) { throw err }
    finally { setAL(false) }
  }

  const rechazar = async (id, motivo) => {
    setAL(true)
    try {
      await adminService.rechazarInsignia(id, motivo)
      await fetch()
      return true
    } catch (err) { throw err }
    finally { setAL(false) }
  }

  return { pendientes, stats, loading, error, retry: fetch, aprobar, rechazar, actionLoading }
}
