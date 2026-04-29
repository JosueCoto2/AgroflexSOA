import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminCatalogo() {
  const [productos, setProductos] = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [filtros, setFiltrosRaw]  = useState({ tipo: '', activo: '', buscar: '', page: 0, size: 20 })
  const [actionLoading, setAL]    = useState(false)

  const setFiltros = useCallback((partial) =>
    setFiltrosRaw(prev => ({ ...prev, ...partial, page: 0 })), [])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: filtros.page, size: filtros.size }
      if (filtros.tipo) params.tipo = filtros.tipo
      if (filtros.activo !== '') params.activo = filtros.activo === 'true'
      if (filtros.buscar) params.buscar = filtros.buscar
      const data = await adminService.getProductosAdmin(params)
      setProductos(data.content ?? [])
      setTotal(data.totalElements ?? 0)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => { fetch() }, [fetch])

  const eliminar = async (id, motivo) => {
    setAL(true)
    try { await adminService.eliminarProducto(id, motivo); await fetch(); return true }
    catch (err) { throw err }
    finally { setAL(false) }
  }

  const suspender = async (id, motivo) => {
    setAL(true)
    try { await adminService.suspenderProducto(id, motivo); await fetch(); return true }
    catch (err) { throw err }
    finally { setAL(false) }
  }

  const restaurar = async (id) => {
    setAL(true)
    try { await adminService.restaurarProducto(id); await fetch(); return true }
    catch (err) { throw err }
    finally { setAL(false) }
  }

  return { productos, total, loading, error, filtros, setFiltros, retry: fetch, eliminar, suspender, restaurar, actionLoading }
}
