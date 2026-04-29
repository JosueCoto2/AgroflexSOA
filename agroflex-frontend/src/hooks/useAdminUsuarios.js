import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminUsuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [filtros, setFiltrosRaw]  = useState({ buscar: '', activo: '', page: 0, size: 20 })
  const [actionLoading, setAL]    = useState(false)

  const setFiltros = useCallback((partial) =>
    setFiltrosRaw(prev => ({ ...prev, ...partial, page: 0 })), [])

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: filtros.page, size: filtros.size }
      if (filtros.buscar) params.buscar = filtros.buscar
      if (filtros.activo !== '') params.activo = filtros.activo === 'true'
      const data = await adminService.getUsuarios(params)
      setUsuarios(data.content ?? [])
      setTotal(data.totalElements ?? 0)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => { fetch() }, [fetch])

  const suspender = async (id, motivo) => {
    setAL(true)
    try {
      await adminService.suspenderUsuario(id, motivo)
      await fetch()
      return true
    } catch (err) {
      throw err
    } finally {
      setAL(false)
    }
  }

  const activar = async (id, motivo) => {
    setAL(true)
    try {
      await adminService.activarUsuario(id, motivo)
      await fetch()
      return true
    } catch (err) {
      throw err
    } finally {
      setAL(false)
    }
  }

  return { usuarios, total, loading, error, filtros, setFiltros, retry: fetch, suspender, activar, actionLoading }
}
