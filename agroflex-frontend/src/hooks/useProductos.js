/**
 * useProductos.js — Estado del catálogo (CAPA 1 / Hook)
 *
 * Maneja: fetching, filtros, paginación, infinite scroll y Firebase trigger.
 * Los componentes consumen este hook; nunca llaman al servicio directamente.
 *
 * Flujo:
 *   Componente → useProductos → productoService → axiosClient → Spring Boot
 *                                               ↑
 *                             Firebase trigger (Capa 4) dispara re-fetch
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { productoService }          from '../services/productoService'
import { subscribeProductosUpdates } from '../services/firebase'

const PAGE_SIZE = 12

/**
 * @typedef {Object} Filtros
 * @property {string} tipo      - '' | 'cosecha' | 'suministro'
 * @property {string} buscar    - Texto de búsqueda libre
 * @property {string} municipio - Municipio para filtrar ubicación
 * @property {string} orden     - 'recientes' | 'precio_asc' | 'precio_desc'
 */

const FILTROS_INICIALES = {
  tipo:      '',
  buscar:    '',
  municipio: '',
  orden:     'recientes',
}

export function useProductos() {
  const [productos,    setProductos]    = useState([])
  const [destacados,   setDestacados]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [loadingMore,  setLoadingMore]  = useState(false)
  const [error,        setError]        = useState(null)
  const [hasMore,      setHasMore]      = useState(false)
  const [filtros,      setFiltrosState] = useState(FILTROS_INICIALES)

  // Refs para evitar closures obsoletos
  const filtrosRef    = useRef(filtros)
  const currentPage   = useRef(0)
  const requestId     = useRef(0)       // ignora respuestas de requests anteriores
  const firebaseUnsub = useRef(() => {})

  // Mantener filtrosRef sincronizado
  filtrosRef.current = filtros

  // ── Función principal de fetch (no depende del estado vía closure)
  const fetchPage = useCallback(async (page = 0, replace = true) => {
    const id = ++requestId.current

    if (replace) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = {
        page,
        size: PAGE_SIZE,
        ...(filtrosRef.current.tipo      && { tipo:      filtrosRef.current.tipo }),
        ...(filtrosRef.current.buscar    && { buscar:    filtrosRef.current.buscar }),
        ...(filtrosRef.current.municipio && { municipio: filtrosRef.current.municipio }),
        ...(filtrosRef.current.orden     && { orden:     filtrosRef.current.orden }),
      }

      const data = await productoService.getAll(params)

      // Descartar si llegó una respuesta de un request más antiguo
      if (id !== requestId.current) return

      const nuevos = data.content ?? data

      if (replace) {
        setProductos(nuevos)
      } else {
        setProductos(prev => [...prev, ...nuevos])
      }

      setHasMore(!data.last && (data.totalPages ?? 1) > page + 1)
      currentPage.current = page

    } catch (err) {
      if (id !== requestId.current) return
      setError('No se pudo cargar el catálogo. Verifica tu conexión.')
    } finally {
      if (id === requestId.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, []) // fetchPage no cambia; usa filtrosRef para siempre tener los filtros actuales

  // ── Carga de destacados (solo una vez al montar)
  const fetchDestacados = useCallback(async () => {
    try {
      const data = await productoService.getDestacados()
      setDestacados(data)
    } catch {
      // Silencioso — destacados no bloquean la UI
    }
  }, [])

  // ── Montar: carga inicial + Firebase listener
  useEffect(() => {
    fetchPage(0, true)
    fetchDestacados()

    // Suscripción Firebase — cuando el backend publica un producto,
    // Firebase dispara el callback y re-fetcha desde Spring Boot
    firebaseUnsub.current = subscribeProductosUpdates(() => {
      fetchPage(0, true)
    })

    return () => {
      firebaseUnsub.current()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-fetch cuando cambian filtros (skip en el primer render)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    fetchPage(0, true)
  }, [filtros, fetchPage])

  // ── Cargar más resultados (infinite scroll)
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPage(currentPage.current + 1, false)
    }
  }, [loadingMore, hasMore, fetchPage])

  // ── Actualizar filtros (acepta objeto parcial)
  const setFiltros = useCallback((updates) => {
    setFiltrosState(prev => ({ ...prev, ...updates }))
  }, [])

  // ── Reintentar tras error
  const retry = useCallback(() => {
    fetchPage(0, true)
  }, [fetchPage])

  return {
    productos,
    destacados,
    loading,
    loadingMore,
    error,
    hasMore,
    filtros,
    setFiltros,
    loadMore,
    retry,
  }
}
