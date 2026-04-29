import { create } from 'zustand'
import ordersApi from '../api/ordersApi'

const useOrderStore = create((set, get) => ({
  ordenes: [],
  ordenActual: null,
  estadisticas: null,
  isLoading: false,
  error: null,

  /**
   * Crea una nueva orden.
   * @param {Object} data - { idVendedor, items: [{idProducto, tipoProducto, cantidad}], ... }
   */
  crearOrden: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const res = await ordersApi.crearOrden(data)
      set(state => ({
        ordenes: [res.data, ...state.ordenes],
        ordenActual: res.data,
        isLoading: false,
      }))
      return res.data
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al crear la orden'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  /** Carga los pedidos del usuario autenticado. */
  fetchMisPedidos: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await ordersApi.misPedidos()
      const data = res.data
      set({
        ordenes: Array.isArray(data) ? data : (data.content ?? []),
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al cargar pedidos',
        isLoading: false,
      })
    }
  },

  // Alias para compatibilidad con hooks existentes
  fetchMisOrdenes: async () => get().fetchMisPedidos(),

  /** Carga el detalle de una orden. */
  fetchDetalle: async (orderId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await ordersApi.detalle(orderId)
      set({ ordenActual: res.data, isLoading: false })
      return res.data
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al cargar la orden',
        isLoading: false,
      })
      throw err
    }
  },

  // Alias
  fetchOrden: async (id) => get().fetchDetalle(id),

  /** Actualiza el estado de una orden. */
  actualizarEstado: async (orderId, nuevoEstado, motivo) => {
    try {
      const res = await ordersApi.actualizarEstado(orderId, nuevoEstado, motivo)
      set(state => ({
        ordenes: state.ordenes.map(o => o.id === orderId ? res.data : o),
        ordenActual: get().ordenActual?.id === orderId ? res.data : get().ordenActual,
      }))
      return res.data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Error al actualizar estado' })
      throw err
    }
  },

  /** Cancela una orden. */
  cancelarOrden: async (orderId, motivo) => {
    set({ isLoading: true })
    try {
      await ordersApi.cancelar(orderId, motivo)
      set(state => ({
        ordenes: state.ordenes.filter(o => o.id !== orderId),
        isLoading: false,
      }))
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Error al cancelar la orden',
        isLoading: false,
      })
      throw err
    }
  },

  clearError: () => set({ error: null }),
  clearOrdenActual: () => set({ ordenActual: null }),
}))

export default useOrderStore
