import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminStats() {
  const [stats, setStats]           = useState(null)
  const [actividad, setActividad]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, actividadData] = await Promise.all([
        adminService.getStats(),
        adminService.getActividadReciente(),
      ])
      setStats(statsData)
      setActividad(actividadData)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats, actividad, loading, error, retry: fetch }
}
