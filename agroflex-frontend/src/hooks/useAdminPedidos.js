import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminPedidos() {
  const [pedidos, setPedidos]     = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [filtros, setFiltrosRaw]  = useState({ estado: '', page: 0, size: 20 })
  const [actionLoading, setAL]    = useState(false)

  const setFiltros = useCallback((partial) =>
    setFiltrosRaw(prev => ({ ...prev, ...partial, page: 0 })), [])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: filtros.page, size: filtros.size }
      if (filtros.estado) params.estado = filtros.estado
      const data = await adminService.getPedidosAdmin(params)
      setPedidos(data.content ?? [])
      setTotal(data.totalElements ?? 0)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => { fetch() }, [fetch])

  const intervenir = async (id, accion, motivo) => {
    setAL(true)
    try { await adminService.intervenirPedido(id, { accion, motivo }); await fetch(); return true }
    catch (err) { throw err }
    finally { setAL(false) }
  }

  return { pedidos, total, loading, error, filtros, setFiltros, retry: fetch, intervenir, actionLoading }
}
