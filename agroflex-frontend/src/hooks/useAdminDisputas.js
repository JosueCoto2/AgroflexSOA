import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminDisputas() {
  const [disputas, setDisputas]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [tabActivo, setTabActivo] = useState('ABIERTA')
  const [actionLoading, setAL]    = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { size: 50 }
      if (tabActivo !== 'TODAS') params.estado = tabActivo
      const data = await adminService.getDisputas(params)
      setDisputas(data.content ?? [])
      setTotal(data.totalElements ?? 0)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar disputas')
    } finally {
      setLoading(false)
    }
  }, [tabActivo])

  useEffect(() => { fetch() }, [fetch])

  const tomar = async (id) => {
    setAL(true)
    try { await adminService.tomarDisputa(id); await fetch(); return true }
    catch (err) { throw err }
    finally { setAL(false) }
  }

  const resolver = async (id, resolucion, accion) => {
    setAL(true)
    try { await adminService.resolverDisputa(id, { resolucion, accion }); await fetch(); return true }
    catch (err) { throw err }
    finally { setAL(false) }
  }

  return { disputas, total, loading, error, tabActivo, setTabActivo, retry: fetch, tomar, resolver, actionLoading }
}
