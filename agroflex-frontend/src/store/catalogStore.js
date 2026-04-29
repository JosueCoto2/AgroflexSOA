import { create } from 'zustand'
import * as catalogApi from '../api/catalogApi'

const FILTROS_INICIALES = {
  idCultivo: null,
  estadoRepublica: '',
  municipio: '',
  precioMin: null,
  precioMax: null,
  unidadVenta: '',
  gradoCalidad: '',
  esOrganico: null,
  ordenarPor: 'fecha_desc',
  page: 0,
  size: 12,
}

const useCatalogStore = create((set, get) => ({
  lotes: [],
  loteActual: null,
  lotesCercanos: [],
  tiposCultivo: [],
  filtros: { ...FILTROS_INICIALES },
  busqueda: '',
  totalPaginas: 0,
  totalElementos: 0,
  paginaActual: 0,
  hayMas: false,
  isLoading: false,
  error: null,

  // ─── Acciones de lectura ─────────────────────────────────────────────────

  fetchLotes: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filtros } = get()
      const params = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== null && v !== '' && v !== undefined)
      )
      const { data } = await catalogApi.getLotes(params)
      set({
        lotes: data.lotes,
        totalPaginas: data.totalPaginas,
        totalElementos: data.totalElementos,
        paginaActual: data.paginaActual,
        hayMas: data.hayMas,
        isLoading: false,
      })
    } catch (error) {
      set({ error: error.response?.data?.message || 'Error al cargar el catálogo', isLoading: false })
    }
  },

  fetchDetalle: async (id) => {
    set({ isLoading: true, error: null, loteActual: null })
    try {
      const { data } = await catalogApi.getLoteDetalle(id)
      set({ loteActual: data, isLoading: false })
    } catch (error) {
      set({ error: 'Lote no encontrado', isLoading: false })
    }
  },

  buscar: async (query, page = 0) => {
    set({ isLoading: true, error: null, busqueda: query })
    try {
      const { filtros } = get()
      const { data } = await catalogApi.buscarLotes(query, page, filtros.size)
      set({
        lotes: data.lotes,
        totalPaginas: data.totalPaginas,
        totalElementos: data.totalElementos,
        paginaActual: data.paginaActual,
        hayMas: data.hayMas,
        isLoading: false,
      })
    } catch (error) {
      set({ error: 'Error en la búsqueda', isLoading: false })
    }
  },

  fetchCercanos: async (lat, lng, radioKm = 50) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await catalogApi.getLotesCercanos(lat, lng, radioKm)
      set({ lotesCercanos: data, isLoading: false })
    } catch (error) {
      set({ error: 'Error al obtener lotes cercanos', isLoading: false })
    }
  },

  fetchTiposCultivo: async () => {
    try {
      const { data } = await catalogApi.getTiposCultivo()
      set({ tiposCultivo: data })
    } catch {
      // silencioso — no crítico
    }
  },

  // ─── Acciones de escritura ───────────────────────────────────────────────

  publicar: async (loteData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await catalogApi.publicarLote(loteData)
      set({ isLoading: false })
      return data
    } catch (error) {
      const msg = error.response?.data?.mensaje || 'Error al publicar el lote'
      set({ error: msg, isLoading: false })
      throw error
    }
  },

  actualizar: async (id, loteData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await catalogApi.actualizarLote(id, loteData)
      set({ isLoading: false })
      return data
    } catch (error) {
      set({ error: 'Error al actualizar el lote', isLoading: false })
      throw error
    }
  },

  eliminar: async (id) => {
    try {
      await catalogApi.eliminarLote(id)
      set((state) => ({ lotes: state.lotes.filter((l) => l.idLote !== id) }))
    } catch (error) {
      set({ error: 'Error al eliminar el lote' })
      throw error
    }
  },

  // ─── Filtros ─────────────────────────────────────────────────────────────

  setFiltros: (nuevosFiltros) => {
    set((state) => ({
      filtros: { ...state.filtros, ...nuevosFiltros, page: 0 },
    }))
  },

  resetFiltros: () => {
    set({ filtros: { ...FILTROS_INICIALES }, busqueda: '' })
  },

  setBusqueda: (query) => set({ busqueda: query }),
}))

export default useCatalogStore
