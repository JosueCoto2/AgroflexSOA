/**
 * usePedidos — Hook para gestionar el estado de la pantalla Mis Pedidos.
 *
 * Expone: pedidos, loading, error, filtros, setFiltros, tabActivo, setTabActivo, retry
 * Delega toda la lógica de fetch en pedidoService (arquitectura SOA respetada).
 */
import { useState, useEffect, useCallback } from 'react'
import { pedidoService } from '../services/pedidoService'

export function usePedidos() {
  const [tabActivo,  setTabActivo]  = useState('comprador') // 'comprador' | 'vendedor'
  const [pedidos,    setPedidos]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filtros,    setFiltrosRaw] = useState({
    estado: '',
    tipo:   '',
    buscar: '',
  })

  const setFiltros = useCallback((partial) => {
    setFiltrosRaw(prev => ({ ...prev, ...partial }))
  }, [])

  const fetchPedidos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await pedidoService.getMisPedidos({ rol: tabActivo, ...filtros })
      // Backend devuelve { content: [], totalElements, ... } (Page<>) o array directo
      setPedidos(Array.isArray(data) ? data : (data.content ?? []))
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }, [tabActivo, filtros])

  useEffect(() => {
    fetchPedidos()
  }, [fetchPedidos])

  return {
    pedidos,
    loading,
    error,
    filtros,
    setFiltros,
    tabActivo,
    setTabActivo,
    retry: fetchPedidos,
  }
}
